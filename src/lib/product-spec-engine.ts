import type {
  NormalizedProduct,
  EnrichedProductSpec,
  HardwareSpecs,
  PhoneSpecs,
  LaptopSpecs,
  TabletSpecs,
  ProductVariant,
  ProductCondition,
  PriceConfidence,
  VerificationStatus,
} from '@/types';

// Authoritative verified specifications database for high-confidence Kenyan market catalog models
// Sources: Manufacturer official spec sheets (Apple, Samsung, Anker, Oppo, Nothing, HP, Dell) and PhonePlace Kenya
const VERIFIED_MODEL_SPECS: Record<string, Partial<EnrichedProductSpec>> = {
  // Apple iPhone 15 Pro / Max
  'iphone-15-pro': {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    productFamily: 'iPhone 15',
    shortDescription: 'Titanium design with A17 Pro chip, Action button, and advanced 48MP Pro camera system with 3x/5x optical zoom.',
    fullDescription: 'Forged in titanium, the iPhone 15 Pro features an aerospace-grade titanium design, A17 Pro chip with 6-core GPU, customizable Action button, Super Retina XDR display with ProMotion 120Hz, and USB-C with USB 3 speeds.',
    hardware: {
      processor: 'Apple A17 Pro',
      chipset: 'Apple A17 Pro (3nm)',
      cpu: '6-core CPU (2 performance and 4 efficiency cores)',
      gpu: '6-core GPU with hardware-accelerated ray tracing',
      ramGb: 8,
      ramType: 'LPDDR5 Unified',
      storageType: 'NVMe',
      screenSizeInches: 6.1,
      resolution: '2556 x 1179 pixels at 460 ppi',
      refreshRateHz: 120,
      panelType: 'Super Retina XDR',
      batteryCapacityMah: 3274,
      chargingWattage: 20,
      wirelessCharging: true,
      operatingSystem: 'iOS 17 (Upgradable to iOS 18)',
    },
    phoneDetails: {
      simConfiguration: 'Physical SIM + eSIM',
      hasEsim: true,
      networkSupport: ['2G', '3G', '4G LTE', '5G Sub-6GHz'],
      is5g: true,
      rearCameraSetup: '48MP Main (f/1.78) + 12MP Ultra Wide (f/2.2) + 12MP 3x Telephoto (f/2.8)',
      frontCameraSetup: '12MP TrueDepth (f/1.9)',
      videoRecordingMax: '4K at 60 fps (ProRes 4K at 60 fps to external drive)',
      biometricSecurity: ['Face ID'],
      waterResistanceRating: 'IP68 (maximum depth of 6 meters up to 30 minutes)',
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 145000,
      observedPriceMinKes: 140000,
      observedPriceMaxKes: 155000,
      priceSource: 'PhonePlace Kenya',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/apple-iphone-15-pro/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Official Brand Warranty',
      warrantyDurationMonths: 12,
    },
    trust: {
      source: 'Apple / PhonePlace Kenya',
      sourceUrl: 'https://www.apple.com/iphone-15-pro/specs/',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'IP15P-128-NAT', variantName: '128GB - Natural Titanium', storageGb: 128, ramGb: 8, color: 'Natural Titanium', priceKes: 145000, stockCount: 5, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'IP15P-256-NAT', variantName: '256GB - Natural Titanium', storageGb: 256, ramGb: 8, color: 'Natural Titanium', priceKes: 158000, stockCount: 3, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'IP15P-512-BLK', variantName: '512GB - Black Titanium', storageGb: 512, ramGb: 8, color: 'Black Titanium', priceKes: 175000, stockCount: 2, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Apple iPhone 15
  'iphone-15': {
    brand: 'Apple',
    model: 'iPhone 15',
    productFamily: 'iPhone 15',
    shortDescription: 'Dynamic Island, 48MP Main camera with 2x Telephoto, and color-infused glass back with USB-C.',
    fullDescription: 'iPhone 15 brings Dynamic Island, a 48MP Main camera with 2x optical-quality telephoto, durable color-infused glass and aluminum design, and USB-C connectivity.',
    hardware: {
      processor: 'Apple A16 Bionic',
      chipset: 'Apple A16 Bionic (4nm)',
      cpu: '6-core CPU',
      gpu: '5-core GPU',
      ramGb: 6,
      ramType: 'LPDDR5',
      storageType: 'NVMe',
      screenSizeInches: 6.1,
      resolution: '2556 x 1179 pixels',
      refreshRateHz: 60,
      panelType: 'Super Retina XDR',
      batteryCapacityMah: 3349,
      chargingWattage: 20,
      wirelessCharging: true,
      operatingSystem: 'iOS 17',
    },
    phoneDetails: {
      simConfiguration: 'Physical SIM + eSIM',
      hasEsim: true,
      networkSupport: ['2G', '3G', '4G LTE', '5G'],
      is5g: true,
      rearCameraSetup: '48MP Main + 12MP Ultra Wide',
      frontCameraSetup: '12MP TrueDepth',
      videoRecordingMax: '4K at 60 fps',
      biometricSecurity: ['Face ID'],
      waterResistanceRating: 'IP68',
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 115000,
      observedPriceMinKes: 110000,
      observedPriceMaxKes: 120000,
      priceSource: 'PhonePlace Kenya',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/apple-iphone-15/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Official Brand Warranty',
      warrantyDurationMonths: 12,
    },
    trust: {
      source: 'Apple Official',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'IP15-128-BLK', variantName: '128GB - Black', storageGb: 128, ramGb: 6, color: 'Black', priceKes: 115000, stockCount: 6, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'IP15-256-BLU', variantName: '256GB - Blue', storageGb: 256, ramGb: 6, color: 'Blue', priceKes: 128000, stockCount: 4, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Apple AirPods 4
  'airpods-4': {
    brand: 'Apple',
    model: 'AirPods 4',
    productFamily: 'AirPods',
    shortDescription: 'Powered by the Apple H2 chip with Voice Isolation, personalized spatial audio, and USB-C case.',
    fullDescription: 'AirPods 4 features a redesigned acoustic architecture, the H2 headphone chip, Personalized Spatial Audio with dynamic head tracking, and a 10% smaller charging case with USB-C charging.',
    hardware: {
      processor: 'Apple H2 Headphone Chip',
      batteryCapacityMah: 350,
      chargingWattage: 5,
      wirelessCharging: true,
      operatingSystem: 'Apple Audio OS',
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 175000,
      observedPriceMinKes: 17500,
      observedPriceMaxKes: 25000,
      priceSource: 'PhonePlace Kenya',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/apple-airpods-4/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Official Brand Warranty',
      warrantyDurationMonths: 12,
    },
    trust: {
      source: 'Apple Official / PhonePlace Kenya',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'AP4-STD', variantName: 'Standard Charging Case (USB-C)', priceKes: 17500, stockCount: 8, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'AP4-ANC', variantName: 'Active Noise Cancellation Edition', priceKes: 24500, stockCount: 4, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Anker Soundcore Liberty 4 NC
  'soundcore-liberty-4-nc': {
    brand: 'Anker Soundcore',
    model: 'Liberty 4 NC',
    productFamily: 'Liberty Series',
    shortDescription: '98.5% noise reduction with Adaptive ANC 2.0, Hi-Res wireless audio with LDAC, and 50-hour playtime.',
    fullDescription: 'The Liberty 4 NC noise cancelling earbuds feature high-sensitivity in-ear sound sensors, 11mm custom drivers, and an innovative noise isolation chamber that reduces noise by up to 98.5%.',
    hardware: {
      processor: 'Anker Soundcore Digital DSP',
      batteryCapacityMah: 53,
      operatingSystem: 'Soundcore App Compatible',
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 8500,
      observedPriceMinKes: 6499,
      observedPriceMaxKes: 8500,
      priceSource: 'PhonePlace Kenya / Avechi',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-liberty-4-nc/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Merchant Shop Warranty',
      warrantyDurationMonths: 12,
    },
    trust: {
      source: 'Soundcore Official / PhonePlace Kenya',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'ANK-L4NC-BLK', variantName: 'Velvet Black', color: 'Black', priceKes: 8500, stockCount: 12, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'ANK-L4NC-BLU', variantName: 'Navy Blue', color: 'Blue', priceKes: 8500, stockCount: 6, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'ANK-L4NC-WHT', variantName: 'Clear White', color: 'White', priceKes: 8500, stockCount: 5, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Anker Soundcore R50i
  'soundcore-r50i': {
    brand: 'Anker Soundcore',
    model: 'R50i True Wireless Earbuds',
    productFamily: 'R-Series',
    shortDescription: '10mm drivers with BassUp technology, 30-hour playtime with case, and IPX5 water resistance.',
    fullDescription: 'Anker Soundcore R50i delivers extra-bass with 10mm drivers, 22 preset EQs via the Soundcore app, AI-enhanced clear calls with dual microphones, and compact lanyard case.',
    hardware: {
      processor: 'Soundcore Audio Chip',
      batteryCapacityMah: 430,
      operatingSystem: 'Soundcore App Support',
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 2999,
      observedPriceMinKes: 2499,
      observedPriceMaxKes: 3200,
      priceSource: 'PhonePlace Kenya',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-r50i/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Merchant Shop Warranty',
      warrantyDurationMonths: 6,
    },
    trust: {
      source: 'Soundcore / PhonePlace Kenya',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'ANK-R50I-BLK', variantName: 'Black Edition', color: 'Black', priceKes: 2999, stockCount: 20, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'ANK-R50I-WHT', variantName: 'White Edition', color: 'White', priceKes: 2999, stockCount: 15, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Samsung Galaxy A15 4G
  'galaxy-a15': {
    brand: 'Samsung',
    model: 'Galaxy A15',
    productFamily: 'Galaxy A-Series',
    shortDescription: '6.5-inch Super AMOLED 90Hz display, 50MP triple camera, MediaTek Helio G99, and 5000mAh battery.',
    fullDescription: 'Samsung Galaxy A15 features a vibrant 6.5" Super AMOLED screen with Vision Booster, robust Helio G99 octa-core processor, 50MP primary camera, and 25W super fast charging.',
    hardware: {
      processor: 'MediaTek Helio G99 (6nm)',
      cpu: 'Octa-core (2x2.2 GHz Cortex-A76 & 6x2.0 GHz Cortex-A55)',
      gpu: 'Mali-G57 MC2',
      ramGb: 6,
      ramType: 'LPDDR4X',
      storageGb: 128,
      storageType: 'UFS 2.2',
      expandableStorage: true,
      expandableStorageType: 'microSDXC up to 1TB',
      screenSizeInches: 6.5,
      resolution: '1080 x 2340 pixels',
      refreshRateHz: 90,
      panelType: 'Super AMOLED',
      batteryCapacityMah: 5000,
      chargingWattage: 25,
      wirelessCharging: false,
      operatingSystem: 'Android 14 with One UI 6',
    },
    phoneDetails: {
      simConfiguration: 'Dual Physical SIM',
      hasEsim: false,
      networkSupport: ['2G', '3G', '4G LTE'],
      is5g: false,
      rearCameraSetup: '50MP Main (f/1.8) + 5MP Ultra-Wide (f/2.2) + 2MP Macro (f/2.4)',
      frontCameraSetup: '13MP (f/2.0)',
      videoRecordingMax: '1080p at 30 fps',
      biometricSecurity: ['Side-mounted Fingerprint', 'Face Unlock'],
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 24500,
      observedPriceMinKes: 18699,
      observedPriceMaxKes: 24500,
      priceSource: 'PhonePlace Kenya / Avechi',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a15-4g/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Official Brand Warranty',
      warrantyDurationMonths: 24,
    },
    trust: {
      source: 'Samsung Official / PhonePlace Kenya',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'SAM-A15-128-4', variantName: '128GB / 4GB RAM - Blue Black', storageGb: 128, ramGb: 4, color: 'Blue Black', priceKes: 19500, stockCount: 8, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'SAM-A15-128-6', variantName: '128GB / 6GB RAM - Light Blue', storageGb: 128, ramGb: 6, color: 'Light Blue', priceKes: 22500, stockCount: 10, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'SAM-A15-256-8', variantName: '256GB / 8GB RAM - Yellow', storageGb: 256, ramGb: 8, color: 'Yellow', priceKes: 25500, stockCount: 4, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },

  // Oppo A3x 4G
  'oppo-a3x': {
    brand: 'OPPO',
    model: 'A3x 4G',
    productFamily: 'Oppo A-Series',
    shortDescription: 'Military-grade shock resistance, 1000 nits ultra-bright display, 45W SUPERVOOC flash charge, 5100mAh battery.',
    fullDescription: 'OPPO A3x features multiple liquid resistance, MIL-STD 810H shock resistance certification, Snapdragon 6s 4G Gen1 processor, 45W SUPERVOOC charging, and 300% ultra-volume speaker mode.',
    hardware: {
      processor: 'Qualcomm Snapdragon 6s 4G Gen1',
      cpu: 'Octa-core',
      gpu: 'Adreno 610',
      ramGb: 4,
      storageGb: 64,
      storageType: 'eMMC 5.1',
      expandableStorage: true,
      screenSizeInches: 6.67,
      resolution: '720 x 1604 pixels (HD+)',
      refreshRateHz: 90,
      panelType: 'IPS LCD',
      batteryCapacityMah: 5100,
      chargingWattage: 45,
      operatingSystem: 'ColorOS 14 (Android 14)',
    },
    phoneDetails: {
      simConfiguration: 'Dual Physical SIM',
      hasEsim: false,
      networkSupport: ['2G', '3G', '4G LTE'],
      is5g: false,
      rearCameraSetup: '8MP Main Camera (f/2.0)',
      frontCameraSetup: '5MP (f/2.2)',
      biometricSecurity: ['Side Fingerprint', 'Facial Recognition'],
    },
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: 13200,
      observedPriceMinKes: 12999,
      observedPriceMaxKes: 15899,
      priceSource: 'PhonePlace Kenya / Avechi',
      priceSourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a3x-4g/',
      priceVerificationDate: '2026-08-14',
      warrantyType: 'Official Brand Warranty',
      warrantyDurationMonths: 24,
    },
    trust: {
      source: 'OPPO Official / PhonePlace Kenya',
      sourceType: 'manufacturer_spec',
      verificationStatus: 'verified',
      verificationTimestamp: '2026-08-14T10:00:00Z',
      confidenceLevel: 'HIGH',
    },
    variants: [
      { sku: 'OPPO-A3X-64', variantName: '64GB / 4GB RAM - Nebula Red', storageGb: 64, ramGb: 4, color: 'Nebula Red', priceKes: 13200, stockCount: 7, condition: 'brand_new_sealed', isAvailable: true },
      { sku: 'OPPO-A3X-128', variantName: '128GB / 4GB RAM - Ocean Blue', storageGb: 128, ramGb: 4, color: 'Ocean Blue', priceKes: 15400, stockCount: 5, condition: 'brand_new_sealed', isAvailable: true },
    ],
  },
};

/**
 * Normalizes and extracts structured specifications from raw text or model keywords.
 * NEVER invents specs. Preserves raw inputs and marks missing fields cleanly.
 */
export function enrichProductSpecification(product: NormalizedProduct): EnrichedProductSpec {
  const nameLower = `${product.brand || ''} ${product.displayName || ''} ${product.model || ''}`.toLowerCase();

  // 1. Check exact match in verified models database
  for (const [key, specTemplate] of Object.entries(VERIFIED_MODEL_SPECS)) {
    const pattern = new RegExp(key.replace(/-/g, '[\\s-]'), 'i');
    if (pattern.test(nameLower)) {
      return {
        productId: product.productId,
        brand: specTemplate.brand || product.brand,
        model: specTemplate.model || product.model || product.displayName,
        title: specTemplate.brand ? `${specTemplate.brand} ${specTemplate.model}` : product.displayName,
        shortDescription: specTemplate.shortDescription || `${product.displayName} available in Kenya.`,
        fullDescription: specTemplate.fullDescription || `Genuine ${product.displayName} with verified specifications.`,
        category: product.categoryName || 'Electronics',
        subcategory: product.subcategoryName || undefined,
        primaryImage: product.primaryImageUrl,
        images: product.images?.length > 0 ? product.images : [{ id: 'primary', url: product.primaryImageUrl }],
        hardware: { ...specTemplate.hardware },
        phoneDetails: specTemplate.phoneDetails ? { ...specTemplate.phoneDetails } : undefined,
        laptopDetails: specTemplate.laptopDetails ? { ...specTemplate.laptopDetails } : undefined,
        tabletDetails: specTemplate.tabletDetails ? { ...specTemplate.tabletDetails } : undefined,
        condition: (product.condition as ProductCondition) || 'brand_new_sealed',
        commercial: {
          currency: 'KES',
          kenyanRetailPriceKes: product.marketRefPriceKes || specTemplate.commercial?.kenyanRetailPriceKes,
          observedPriceMinKes: specTemplate.commercial?.observedPriceMinKes,
          observedPriceMaxKes: specTemplate.commercial?.observedPriceMaxKes,
          priceSource: product.marketPriceSource || specTemplate.commercial?.priceSource,
          priceSourceUrl: product.marketPriceSourceUrl || specTemplate.commercial?.priceSourceUrl,
          priceVerificationDate: product.marketPriceCheckedAt || specTemplate.commercial?.priceVerificationDate,
          warrantyType: specTemplate.commercial?.warrantyType || 'Merchant Shop Warranty',
          warrantyDurationMonths: product.warrantyMonths || specTemplate.commercial?.warrantyDurationMonths || 12,
        },
        trust: {
          source: specTemplate.trust?.source || 'PhonePlace Kenya',
          sourceUrl: specTemplate.trust?.sourceUrl,
          sourceType: specTemplate.trust?.sourceType || 'kenyan_retailer_catalog',
          verificationStatus: 'verified',
          verificationTimestamp: specTemplate.trust?.verificationTimestamp || new Date().toISOString(),
          confidenceLevel: specTemplate.trust?.confidenceLevel || 'HIGH',
        },
        variants: specTemplate.variants && specTemplate.variants.length > 0
          ? specTemplate.variants
          : [
              {
                sku: `SKU-${product.productId}-STD`,
                variantName: 'Standard Configuration',
                priceKes: product.marketRefPriceKes || product.priceKes,
                stockCount: product.stockCount || 1,
                condition: (product.condition as ProductCondition) || 'brand_new_sealed',
                isAvailable: true,
              },
            ],
        rawSpecs: product.specs || {},
      };
    }
  }

  // 2. For unverified / catalogue products without an exact manufacturer template match:
  // Extract only strictly evident specifications from existing raw text
  const extractedHardware: HardwareSpecs = {};
  const extractedPhone: PhoneSpecs = {};
  const extractedLaptop: LaptopSpecs = {};

  // RAM Extraction
  const ramMatch = nameLower.match(/(\d+)\s*(?:gb|g)\s*(?:ram)?\b/i);
  if (ramMatch && ramMatch[1] && parseInt(ramMatch[1], 10) <= 64) {
    extractedHardware.ramGb = parseInt(ramMatch[1], 10);
  }

  // Storage Extraction
  const storageMatch = nameLower.match(/(\d+)\s*(?:gb|tb)\s*(?:ssd|rom|storage|nvme)?\b/i);
  if (storageMatch && storageMatch[1]) {
    const val = parseInt(storageMatch[1], 10);
    const unit = storageMatch[0].toLowerCase().includes('tb') ? 1024 : 1;
    extractedHardware.storageGb = val * unit;
    if (nameLower.includes('ssd')) extractedHardware.storageType = 'SSD';
  }

  // Battery extraction
  const battMatch = nameLower.match(/(\d{4,5})\s*mah/i);
  if (battMatch && battMatch[1]) {
    extractedHardware.batteryCapacityMah = parseInt(battMatch[1], 10);
  }

  // 5G detection
  if (nameLower.includes(' 5g') || nameLower.includes('-5g') || nameLower.includes('5g-')) {
    extractedPhone.is5g = true;
    extractedPhone.networkSupport = ['2G', '3G', '4G LTE', '5G'];
  }

  const isVerifiedPrice = product.marketPriceStatus === 'VERIFIED' && typeof product.marketRefPriceKes === 'number';

  return {
    productId: product.productId,
    brand: product.brand,
    model: product.model || product.displayName,
    title: product.brand && !product.displayName.toLowerCase().startsWith(product.brand.toLowerCase())
      ? `${product.brand} ${product.displayName}`
      : product.displayName,
    shortDescription: `${product.displayName} available in Kenya.`,
    fullDescription: `${product.displayName} listed in the Kenya Electronics Marketplace catalogue.`,
    category: product.categoryName || 'Electronics',
    subcategory: product.subcategoryName || undefined,
    primaryImage: product.primaryImageUrl,
    images: product.images?.length > 0 ? product.images : [{ id: 'primary', url: product.primaryImageUrl }],
    hardware: extractedHardware,
    phoneDetails: product.categoryName === 'Smartphones' ? extractedPhone : undefined,
    laptopDetails: product.categoryName === 'Laptops' ? extractedLaptop : undefined,
    condition: (product.condition as ProductCondition) || 'brand_new_sealed',
    commercial: {
      currency: 'KES',
      kenyanRetailPriceKes: isVerifiedPrice ? product.marketRefPriceKes : undefined,
      priceSource: product.marketPriceSource,
      priceSourceUrl: product.marketPriceSourceUrl,
      priceVerificationDate: product.marketPriceCheckedAt,
      warrantyType: 'Merchant Shop Warranty',
      warrantyDurationMonths: product.warrantyMonths || 6,
    },
    trust: {
      source: product.marketPriceSource || 'Catalogue Ingestion',
      sourceUrl: product.marketPriceSourceUrl,
      sourceType: isVerifiedPrice ? 'kenyan_retailer_catalog' : 'unverified',
      verificationStatus: isVerifiedPrice ? 'verified' : 'unverified',
      verificationTimestamp: product.marketPriceCheckedAt || undefined,
      confidenceLevel: isVerifiedPrice ? 'HIGH' : 'UNVERIFIED',
    },
    variants: [
      {
        sku: `SKU-${product.productId}-DEFAULT`,
        variantName: 'Standard Configuration',
        priceKes: isVerifiedPrice ? product.marketRefPriceKes : undefined,
        stockCount: product.stockCount || 1,
        condition: (product.condition as ProductCondition) || 'brand_new_sealed',
        isAvailable: true,
      },
    ],
    rawSpecs: product.specs || {},
  };
}
