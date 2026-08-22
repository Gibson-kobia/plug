import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const CATEGORY_MAP = {
  'Smartphones': { id: 'C01', name: 'Smartphones' },
  'Tablets': { id: 'C02', name: 'Tablets' },
  'Laptops': { id: 'C03', name: 'Laptops' },
  'Desktop Computers': { id: 'C04', name: 'Desktop Computers' },
  'Monitors': { id: 'C05', name: 'Monitors' },
  'TVs': { id: 'C06', name: 'TVs' },
  'Smart Watches': { id: 'C07', name: 'Smart Watches' },
  'Audio': { id: 'C08', name: 'Audio' },
  'Gaming': { id: 'C09', name: 'Gaming' },
  'Cameras': { id: 'C10', name: 'Cameras' },
  'Networking': { id: 'C11', name: 'Networking' },
  'Storage': { id: 'C12', name: 'Storage' },
  'Accessories': { id: 'C13', name: 'Accessories' },
};

// Load duplicate groups CSV to get real primaryImageUrl and image counts
const dupCsvPath = path.join(DATA_DIR, 'duplicate-product-groups.csv');
const dupImageMap = new Map();
if (fs.existsSync(dupCsvPath)) {
  const lines = fs.readFileSync(dupCsvPath, 'utf8').split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    // Simple CSV parser for standard rows
    const parts = line.split(',');
    if (parts.length >= 6) {
      const displayName = parts[3]?.trim();
      const imageCount = parseInt(parts[4]?.trim() || '1', 10);
      const primaryImage = parts[5]?.trim();
      if (displayName) {
        dupImageMap.set(displayName.toLowerCase(), { imageCount, primaryImage });
      }
    }
  }
}

// Load uncertain items CSV
const uncCsvPath = path.join(DATA_DIR, 'uncertain-items.csv');
const uncImageMap = new Map();
if (fs.existsSync(uncCsvPath)) {
  const lines = fs.readFileSync(uncCsvPath, 'utf8').split(/\r?\n/).slice(1);
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(',');
    if (parts.length >= 10) {
      const displayName = parts[3]?.trim();
      const url = parts[parts.length - 1]?.trim();
      if (displayName && url) {
        uncImageMap.set(displayName.toLowerCase(), url);
      }
    }
  }
}

const researchPath = path.join(DATA_DIR, 'product-market-research.json');
if (!fs.existsSync(researchPath)) {
  console.error('product-market-research.json not found');
  process.exit(1);
}

const researchList = JSON.parse(fs.readFileSync(researchPath, 'utf8'));

const normalized = researchList.map((item, idx) => {
  const pName = item.productName || `Product ${idx + 1}`;
  const pNameLower = pName.toLowerCase();

  const dupInfo = dupImageMap.get(pNameLower);
  const uncUrl = uncImageMap.get(pNameLower);

  const primaryImageUrl = dupInfo?.primaryImage || uncUrl || `https://ik.imagekit.io/0iaahkrcv/ecommerce/${encodeURIComponent(pName)}.webp`;
  const imageCount = dupInfo?.imageCount || 1;

  const catMeta = CATEGORY_MAP[item.category] || null;

  return {
    productId: item.candidateId || `IMG-PROD-${String(idx + 1).padStart(5, '0')}`,
    brand: item.brand || null,
    model: item.model || null,
    displayName: pName,
    slug: slugify(`${item.brand || ''} ${item.model || ''} ${pName}`) || `product-${idx + 1}`,
    categoryId: catMeta?.id || (item.category && item.category !== 'Uncategorized' ? item.category : null),
    categoryName: catMeta?.name || item.category || null,
    subcategoryId: item.subcategory || null,
    subcategoryName: item.subcategory || null,
    sourceFolder: null,
    imageCount: imageCount,
    primaryImageUrl: primaryImageUrl,
    images: [
      {
        id: `img-${idx + 1}`,
        url: primaryImageUrl,
      }
    ],
    specs: {},
    confidence: item.confidence === 'HIGH' ? 'HIGH' : item.confidence === 'MEDIUM' ? 'MEDIUM' : 'LOW',
    needsReview: item.confidence === 'UNVERIFIED' || item.confidence === 'LOW',
    marketRefPriceKes: item.price || undefined,
    marketPriceStatus: item.priceStatus === 'VERIFIED' ? 'VERIFIED' : 'UNVERIFIED',
    marketPriceSource: item.sourceName || undefined,
    marketPriceSourceUrl: item.sourceUrl || undefined,
    marketPriceCheckedAt: item.checkedAt || undefined,
  };
});

const outPath = path.join(DATA_DIR, 'normalized-products.json');
fs.writeFileSync(outPath, JSON.stringify(normalized, null, 2), 'utf8');
console.log(`Generated ${normalized.length} normalized products to ${outPath}`);
