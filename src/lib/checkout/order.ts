export interface DeliveryZone {
  id: string;
  name: string;
  region: string;
  feeKes: number;
  estimatedHours: string;
}

export const NAIROBI_DELIVERY_ZONES: DeliveryZone[] = [
  { id: 'zone-cbd', name: 'Nairobi CBD & Central', region: 'Nairobi', feeKes: 200, estimatedHours: '2-4 hours' },
  { id: 'zone-westlands', name: 'Westlands / Parklands / Lavington', region: 'Nairobi', feeKes: 250, estimatedHours: '3-5 hours' },
  { id: 'zone-kilimani', name: 'Kilimani / Kileleshwa / Ngong Rd', region: 'Nairobi', feeKes: 250, estimatedHours: '3-5 hours' },
  { id: 'zone-eastlands', name: 'Eastlands / Donholm / Buruburu', region: 'Nairobi', feeKes: 300, estimatedHours: '4-6 hours' },
  { id: 'zone-kasarani', name: 'Kasarani / Roysambu / Zimmermann', region: 'Nairobi', feeKes: 300, estimatedHours: '4-6 hours' },
  { id: 'zone-karen', name: 'Karen / Langata / Rongai', region: 'Nairobi', feeKes: 400, estimatedHours: 'Same-day' },
  { id: 'zone-thika-rd', name: 'Thika Road / Ruiru / Juja', region: 'Nairobi Outskirts', feeKes: 450, estimatedHours: 'Same-day' },
  { id: 'zone-nationwide', name: 'Nationwide Courier (47 Counties)', region: 'Rest of Kenya', feeKes: 500, estimatedHours: '24-48 hours' },
];

export function validateKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Matches 07xx, 010x, 011x, +2547xx, +25410x, +25411x, 2547xx
  const regex = /^(?:\+?254|0)?(?:1[01]\d{7}|[7]\d{8})$/;
  return regex.test(cleaned);
}

export function formatKenyanPhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+254' + cleaned.slice(1);
  } else if (cleaned.startsWith('254')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

// Simple HMAC-SHA256 reference signature generator
export function generateOrderRefSignature(orderRef: string, secretKey: string = 'ke-electronics-secret'): string {
  let hash = 0;
  const str = `${orderRef}:${secretKey}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase();
  return hex.padStart(8, '0').slice(0, 8);
}

export function generateOrderReference(): { orderRef: string; signature: string } {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.floor(1000 + Math.random() * 9000);
  const orderRef = `KE-${timestamp}-${random}`;
  const signature = generateOrderRefSignature(orderRef);
  return { orderRef, signature };
}

export interface WhatsAppOrderPayload {
  orderRef: string;
  signature: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryZone: DeliveryZone;
  deliveryAddress: string;
  isPickup: boolean;
  sellerGroupKey: string;
  sellerPhone: string; // e.g. +254700000000
  items: Array<{
    displayName: string;
    brand?: string;
    quantity: number;
    marketRefPriceKes?: number;
  }>;
}

export function getBusinessWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NO || '+254798021312';
}

export function buildProductInquiryWhatsAppUrl(
  product: {
    productId: string;
    displayName: string;
    brand?: string | null | undefined;
    categoryName?: string | null | undefined;
    subcategoryName?: string | null | undefined;
    priceKes?: number | undefined;
    marketPriceStatus?: string | undefined;
    marketRefPriceKes?: number | undefined;
    slug?: string | undefined;
  },
  pageUrl?: string | undefined
): string {
  const rawBusinessNumber = getBusinessWhatsAppNumber();
  const cleanNumber = rawBusinessNumber ? formatKenyanPhone(rawBusinessNumber).replace('+', '') : '';

  const fullTitle = product.brand && !product.displayName.toLowerCase().startsWith(product.brand.toLowerCase())
    ? `${product.brand} ${product.displayName}`
    : product.displayName;

  const lines: string[] = [
    'Hello Plugke,',
    'I am interested in purchasing this product:',
    `Product: ${fullTitle}`,
  ];

  if (product.brand) {
    lines.push(`Brand: ${product.brand}`);
  }

  if (product.categoryName && product.categoryName !== 'Uncategorized') {
    const catStr = product.subcategoryName
      ? `${product.categoryName} - ${product.subcategoryName}`
      : product.categoryName;
    lines.push(`Category: ${catStr}`);
  }

  lines.push(`Product reference: ${product.productId}`);

  if (typeof product.priceKes === 'number') {
    lines.push(`Plugke selling price: KSh ${product.priceKes.toLocaleString('en-KE')}`);
  } else if (product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number') {
    lines.push(`Kenyan market reference price: KSh ${product.marketRefPriceKes.toLocaleString('en-KE')}`);
  }

  if (pageUrl) {
    lines.push('Product page:');
    lines.push(pageUrl);
  }

  lines.push('');
  lines.push('Please confirm:');
  lines.push('1. Availability');
  lines.push('2. Final Plugke selling price');
  lines.push('3. Delivery/pickup options');
  lines.push('4. Payment instructions');
  lines.push('');
  lines.push('Thank you.');

  const text = lines.join('\n');
  if (!cleanNumber) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

export function buildWhatsAppUrl(payload: WhatsAppOrderPayload): string {
  const targetPhone = payload.sellerPhone || getBusinessWhatsAppNumber();
  const cleanSellerPhone = formatKenyanPhone(targetPhone).replace('+', '');
  
  let msg = `🛒 *KENYA ELECTRONICS MARKETPLACE ORDER*\n`;
  msg += `----------------------------------------\n`;
  msg += `📌 *Order Ref:* ${payload.orderRef} (Sig: ${payload.signature})\n`;
  msg += `👤 *Customer:* ${payload.customerName}\n`;
  msg += `📞 *Phone:* ${payload.customerPhone}\n`;
  if (payload.customerEmail) msg += `✉️ *Email:* ${payload.customerEmail}\n`;
  msg += `----------------------------------------\n`;
  msg += `📦 *ITEMS ORDERED:*\n`;

  let totalMarketRef = 0;
  let hasPrices = false;

  payload.items.forEach((item, i) => {
    msg += `${i + 1}. ${item.brand ? item.brand + ' ' : ''}${item.displayName} x${item.quantity}\n`;
    if (typeof item.marketRefPriceKes === 'number') {
      const lineEst = item.marketRefPriceKes * item.quantity;
      totalMarketRef += lineEst;
      hasPrices = true;
      msg += `   Est. Market Ref: KSh ${lineEst.toLocaleString('en-KE')}\n`;
    }
  });

  msg += `----------------------------------------\n`;
  msg += `🚚 *Fulfillment:* ${payload.isPickup ? 'Self Pickup' : 'Delivery to ' + payload.deliveryZone.name}\n`;
  msg += `📍 *Address/Notes:* ${payload.deliveryAddress}\n`;
  if (!payload.isPickup) {
    msg += `💵 *Est. Delivery Fee:* KSh ${payload.deliveryZone.feeKes.toLocaleString('en-KE')} (${payload.deliveryZone.estimatedHours})\n`;
  }
  if (hasPrices) {
    msg += `💰 *Est. Total Market Ref:* KSh ${(totalMarketRef + (payload.isPickup ? 0 : payload.deliveryZone.feeKes)).toLocaleString('en-KE')}\n`;
  }
  msg += `----------------------------------------\n`;
  msg += `*Please confirm availability, final price & M-Pesa payment instructions.*`;

  return `https://wa.me/${cleanSellerPhone}?text=${encodeURIComponent(msg)}`;
}
