import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');

const PRODUCTS_JSON = join(DATA_DIR, 'imagekit-products.json');
const INVENTORY_JSON = join(DATA_DIR, 'imagekit-inventory.json');
const ASSET_SUMMARY = join(DATA_DIR, 'imagekit-asset-summary.json');
const EXPORT_SUMMARY = join(DATA_DIR, 'imagekit-export-summary.json');
const COVERAGE_JSON = join(DATA_DIR, 'catalogue-coverage.json');
const COVERAGE_CSV = join(DATA_DIR, 'catalogue-coverage.csv');
const NORMALIZED_PRODUCTS_JSON = join(DATA_DIR, 'normalized-products.json');
const UNCERTAIN_ITEMS_CSV = join(DATA_DIR, 'uncertain-items.csv');
const NON_PRODUCT_ASSETS_CSV = join(DATA_DIR, 'non-product-assets.csv');
const DUPLICATE_PRODUCT_GROUPS_CSV = join(DATA_DIR, 'duplicate-product-groups.csv');

const CATALOGUE_CATEGORIES = {
  C01: { id: 'C01', name: 'Smartphones', slug: 'smartphones', subcategories: ['S01-01','S01-02','S01-03','S01-04','S01-05','S01-06','S01-07','S01-08','S01-09','S01-10','S01-11','S01-12','S01-13'] },
  C02: { id: 'C02', name: 'Tablets', slug: 'tablets', subcategories: ['S02-01','S02-02','S02-03','S02-04','S02-05','S02-06','S02-07'] },
  C03: { id: 'C03', name: 'Laptops', slug: 'laptops', subcategories: ['S03-01','S03-02','S03-03','S03-04','S03-05','S03-06','S03-07','S03-08','S03-09','S03-10'] },
  C04: { id: 'C04', name: 'Desktop Computers', slug: 'desktops', subcategories: ['S04-01','S04-02','S04-03','S04-04','S04-05','S04-06'] },
  C05: { id: 'C05', name: 'Monitors', slug: 'monitors', subcategories: ['S05-01','S05-02','S05-03','S05-04','S05-05','S05-06'] },
  C06: { id: 'C06', name: 'TVs', slug: 'tvs', subcategories: ['S06-01','S06-02','S06-03','S06-04','S06-05','S06-06','S06-07','S06-08','S06-09','S06-10','S06-11'] },
  C07: { id: 'C07', name: 'Smart Watches', slug: 'smartwatches', subcategories: ['S07-01','S07-02','S07-03','S07-04','S07-05'] },
  C08: { id: 'C08', name: 'Audio', slug: 'audio', subcategories: ['S08-01','S08-02','S08-03','S08-04','S08-05','S08-06','S08-07','S08-08'] },
  C09: { id: 'C09', name: 'Gaming', slug: 'gaming', subcategories: ['S09-01','S09-02','S09-03','S09-04','S09-05','S09-06','S09-07','S09-08','S09-09'] },
  C10: { id: 'C10', name: 'Cameras', slug: 'cameras', subcategories: ['S10-01','S10-02','S10-03','S10-04','S10-05','S10-06'] },
  C11: { id: 'C11', name: 'Networking', slug: 'networking', subcategories: ['S11-01','S11-02','S11-03','S11-04','S11-05','S11-06','S11-07'] },
  C12: { id: 'C12', name: 'Storage', slug: 'storage', subcategories: ['S12-01','S12-02','S12-03','S12-04','S12-05','S12-06','S12-07'] },
  C13: { id: 'C13', name: 'Accessories', slug: 'accessories', subcategories: ['S13-01','S13-02','S13-03','S13-04','S13-05','S13-06','S13-07','S13-08','S13-09','S13-10','S13-11','S13-12','S13-13','S13-14','S13-15','S13-16','S13-17','S13-18','S13-19','S13-20','S13-21','S13-22','S13-23','S13-24','S13-25','S13-26','S13-27','S13-28','S13-29','S13-30','S13-31','S13-32','S13-33','S13-34','S13-35','S13-36','S13-37','S13-38','S13-39','S13-40','S13-41','S13-42','S13-43','S13-44','S13-45','S13-46','S13-47'] },
};

const BRANDS_BY_CATEGORY = {
  C01: ['Apple','Samsung','Tecno','Infinix','itel','Xiaomi','Redmi','POCO','Oppo','Vivo','OnePlus','Nothing','Google Pixel','Huawei','Honor','Nokia','Motorola','Realme','Asus','Sony','Blackview','Doogee','Ulefone','Oukitel','ZTE','Lenovo','Meizu'],
  C02: ['Samsung','Apple','Lenovo','Huawei','Xiaomi','Redmi','Honor','Amazon','Microsoft','Nokia','Blackview','Doogee','Teclast','Alldocube'],
  C03: ['HP','Dell','Lenovo','Asus','Acer','Apple','MSI','Gigabyte','Razer','Microsoft','Samsung','Huawei','LG','Toshiba','Fujitsu','Dynabook','Framework'],
  C04: ['HP','Dell','Lenovo','Asus','Acer','Apple','MSI','Gigabyte','Razer','Microsoft','Samsung','Intel NUC','Minisforum','Beelink','Chuwi','GeekFun','iBUYPOWER','CyberPowerPC','Alienware','Corsair'],
  C05: ['Samsung','LG','Dell','HP','AOC','MSI','ViewSonic','BenQ','Asus','Gigabyte','Acer','Philips','Lenovo'],
  C06: ['Samsung','LG','Hisense','TCL','Skyworth','Sony','Vitron','Vision Plus','Syinix','Haier','Toshiba','Panasonic','Sharp'],
  C07: ['Apple','Samsung','Huawei','Xiaomi','Redmi','Amazfit','Garmin','Fitbit','CMF','Nothing','Oraimo','Haylou','Kieslect'],
  C08: ['JBL','Sony','Anker','Soundcore','Oraimo','Bose','Marshall','Apple','Samsung','Beats','Skullcandy','Logitech','Edifier','Tribit','Tronsmart','Haylou','CMF','Earfun','1MORE','FiiO','Shure','Sennheiser','Audio-Technica','Harman Kardon'],
  C09: ['Sony','Microsoft','Nintendo','Logitech','Razer','SteelSeries','Corsair','HyperX','Redragon','MSI','ASUS ROG','Acer Predator','Lenovo Legion','HP Omen','Alienware','DXRacer','Secretlab','AndaSeat','Fantech','Bloody','Cougar','Glorious','Kinesis'],
  C10: ['Canon','Nikon','Sony','Fujifilm','DJI','GoPro','Panasonic','Insta360','Sigma','Tamron','Hikvision','Dahua','Reolink','Ezviz','Ring','Blink','Arlo','Logitech','Anker','AverMedia','Elgato'],
  C11: ['TP-Link','D-Link','Huawei','MikroTik','Ubiquiti','UniFi','Netgear','Tenda','Mercusys','ASUS','Linksys','Xiaomi','ZTE','Faiber','Totolink','Cisco','Juniper','Aruba'],
  C12: ['Samsung','Kingston','SanDisk','WD','Seagate','Crucial','Lexar','Transcend','ADATA','TeamGroup','Corsair','G.Skill','Silicon Power','Patriot','Toshiba','HP','Verbatim','PNY','OWC','Synology','QNAP','Asustor','TerraMaster'],
  C13: ['Oraimo','Anker','Baseus','UGREEN','Belkin','Spigen','Ringke','OtterBox','Tech21','Catalyst','Griffin','Logitech','Microsoft','Lenovo','HP','Dell','Samsung','Apple','JBL','Sony','Tribit','Tronsmart','Promate','Havit','Fantech','T-Dagger','Vention','Cable Matters','StarTech','TP-Link','Ezviz','Sandisk','Kingston','Verbatim','3M','Schneider','APC','Eaton','Everbrite','Premier','Canon','Epson','Brother','Xerox','Honeywell','Zebra','Sato'],
};

const FOLDER_TO_CATEGORY_MAP = {
  'airbuds': { catId: 'C08', subId: 'S08-01', catName: 'Audio', subName: 'Earbuds', confidence: 'HIGH' },
  'airbuds2': { catId: 'C08', subId: 'S08-01', catName: 'Audio', subName: 'Earbuds', confidence: 'HIGH' },
  'airbuds3': { catId: 'C08', subId: 'S08-01', catName: 'Audio', subName: 'Earbuds', confidence: 'HIGH' },
  'airbuds4': { catId: 'C08', subId: 'S08-01', catName: 'Audio', subName: 'Earbuds', confidence: 'HIGH' },
  'airbuds5': { catId: 'C08', subId: 'S08-01', catName: 'Audio', subName: 'Earbuds', confidence: 'HIGH' },
  'Bts': { catId: 'C08', subId: 'S08-02', catName: 'Audio', subName: 'Headphones', confidence: 'MEDIUM', note: 'Could be Bluetooth speakers/headphones mixed' },
  'gadgets': { catId: null, subId: null, catName: null, subName: null, confidence: 'LOW', note: 'Generic "gadgets" folder - requires review' },
  'itel': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH', note: 'itel is listed in smartphone brands' },
  'laptops1': { catId: 'C03', subId: null, catName: 'Laptops', subName: null, confidence: 'HIGH' },
  'Oppo': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Oppo2': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Oppo3': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Oppo4': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Oppo5': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Oppo6': { catId: 'C01', subId: 'S01-01', catName: 'Smartphones', subName: 'Android Phones', confidence: 'HIGH' },
  'Sound Bars': { catId: 'C08', subId: 'S08-04', catName: 'Audio', subName: 'Soundbars', confidence: 'HIGH' },
  'tvs': { catId: 'C06', subId: null, catName: 'TVs', subName: null, confidence: 'HIGH' },
  'ecommerce': { catId: null, subId: null, catName: null, subName: null, confidence: 'LOW', note: 'Generic ecommerce folder - mixed assets, requires review' },
};

const NON_PRODUCT_KEYWORDS = [
  'logo', 'icon', 'banner', 'footer', 'header', 'bg-', 'background',
  'placeholder', 'empty-state', 'skeleton', 'avatar', 'default',
  'category-', 'cat_', 'web-banner', 'hero', 'slider', 'carousel',
  'promo', 'ad-', 'advert', 'template', 'mockup', 'frame',
  'certificate', 'warranty', 'seal', 'stamp', 'badge',
  'social', 'share', 'fb-', 'ig-', 'twitter', 'whatsapp',
  'shipping', 'delivery', 'truck', 'map', 'pin', 'marker',
  'payment', 'mpesa', 'visa', 'mastercard', 'paypal',
  'star', 'rating', 'review', 'checkmark', 'tick', 'cross',
  'arrow', 'chevron', 'menu', 'hamburger', 'search', 'filter',
  'cart', 'bag', 'heart', 'wishlist', 'user', 'profile',
  '-small', '-thumb', '_thumb', '-mini', '-micro',
];

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCSV(headers, rows) {
  return [
    headers.map(escapeCSV).join(','),
    ...rows.map(r => headers.map(h => escapeCSV(r[h])).join(','))
  ].join('\r\n');
}

function slugify(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function normalizeFileName(name) {
  return String(name).toLowerCase()
    .replace(/\.(webp|jpg|jpeg|png|gif)$/i, '')
    .replace(/\s*\(\d+\)\s*$/g, '')
    .replace(/\s*-\s*(small|medium|large|thumb|mini|micro)\s*$/gi, '')
    .replace(/\s*-\s*(front|back|left|right|top|bottom|box|accessories?|lifestyle)\s*$/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDisplayName(rawName) {
  let name = String(rawName);
  name = name.replace(/\.(webp|jpg|jpeg|png|gif)$/i, '');
  name = name.replace(/\s*\(\d+\)\s*/g, ' ');
  name = name.replace(/\s*-\s*(small|medium|large|thumb|mini|micro)\s*/gi, ' ');
  name = name.replace(/\s*-\s*(front|back|left|right|top|bottom|box|accessories?|lifestyle)\s*/gi, ' ');
  name = name.replace(/-[A-Za-z0-9]{10,}(?=[-.\s]|$)/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  name = name.replace(/^-|-$/g, '').trim();
  return name || rawName;
}

function detectBrand(name, filename, folder, brandsAll) {
  const haystack = (name + ' ' + filename + ' ' + folder).toLowerCase();
  for (const brand of brandsAll) {
    const patterns = [
      `\\b${brand.toLowerCase().replace(/\s+/g, '[\\s-]?')}\\b`,
      `-${brand.toLowerCase().replace(/\s+/g, '-')}-`,
    ];
    for (const p of patterns) {
      if (new RegExp(p).test(haystack)) {
        return brand;
      }
    }
  }
  return null;
}

function extractModel(name, brand) {
  let n = cleanDisplayName(name);
  if (brand) {
    const re = new RegExp(`^${brand.replace(/\s+/g, '[\\s-]?')}[\\s-]*`, 'i');
    n = n.replace(re, '');
  }
  n = n.replace(/\b(2gb|3gb|4gb|6gb|8gb|12gb|16gb|24gb)\s*\/?\s*(16gb|32gb|64gb|128gb|256gb|512gb|1tb|2tb)\b/gi, '').trim();
  n = n.replace(/\b(16|32|64|128|256|512|1024|1|2)\s*(gb|tb)\b/gi, '').trim();
  n = n.replace(/\b(\d{3,4})\s*(mah|mah)\b/gi, '').trim();
  n = n.replace(/\b(\d+\.?\d*)\s*inch\b/gi, '').trim();
  n = n.replace(/\s+-/g, ' ').replace(/-\s+/g, ' ').trim();
  n = n.replace(/^[-\s]+|[-\s]+$/g, '').trim();
  return n || null;
}

function detectSpecs(name, filename) {
  const text = (name + ' ' + filename).toLowerCase();
  const specs = {};
  const ramMatch = text.match(/\b(\d+)\s*gb?\s*(?:ram)?\b/);
  if (ramMatch) {
    const val = parseInt(ramMatch[1]);
    if (val <= 24) specs.ram = `${val}GB`;
  }
  const storageMatch = text.match(/\b(\d+|1|2)\s*(gb|tb)\b.*?(storage|rom)?/i) || text.match(/(?:storage|rom)\s*[:=]?\s*(\d+|1|2)\s*(gb|tb)/i);
  if (storageMatch) {
    let val = parseInt(storageMatch[1]);
    const unit = storageMatch[2].toLowerCase();
    if (unit === 'tb') val = val * 1024;
    if (val >= 16 && val <= 2048) specs.storage = val >= 1024 ? `${Math.round(val/1024)}TB` : `${val}GB`;
  }
  const battMatch = text.match(/\b(\d{3,4})\s*mah\b/i);
  if (battMatch) specs.battery_mah = parseInt(battMatch[1]);
  const screenMatch = text.match(/\b(\d+\.?\d*)\s*(?:inch|inches|")\b/);
  if (screenMatch) specs.screen_size_in = parseFloat(screenMatch[1]);
  return specs;
}

function isLikelyNonProduct(name, filename, folder, assetType) {
  if (assetType && assetType !== 'PRODUCT_IMAGE' && assetType !== 'BRAND_ASSET') return true;
  const text = (name + ' ' + filename + ' ' + folder).toLowerCase();
  for (const kw of NON_PRODUCT_KEYWORDS) {
    if (text.includes(kw.toLowerCase())) return true;
  }
  return false;
}

function classifyCategory(asset, allBrandsFlat) {
  const folder = asset.sourceFolder;
  const folderMap = FOLDER_TO_CATEGORY_MAP[folder];
  
  let catId = folderMap?.catId || null;
  let subId = folderMap?.subId || null;
  let catName = folderMap?.catName || null;
  let subName = folderMap?.subName || null;
  let confidence = folderMap?.confidence || 'LOW';
  let reasons = [];
  
  if (folderMap) {
    reasons.push(`folder mapping: ${folder} -> ${folderMap.catName || 'UNCATEGORIZED'}`);
    if (folderMap.note) reasons.push(`note: ${folderMap.note}`);
  }
  
  if (asset.brand) {
    const brandCatMatches = [];
    for (const [cId, brands] of Object.entries(BRANDS_BY_CATEGORY)) {
      if (brands.some(b => b.toLowerCase() === asset.brand.toLowerCase())) {
        brandCatMatches.push(cId);
      }
    }
    if (brandCatMatches.length === 1) {
      if (!catId) {
        catId = brandCatMatches[0];
        catName = CATALOGUE_CATEGORIES[catId].name;
        confidence = 'HIGH';
        reasons.push(`brand ${asset.brand} uniquely maps to ${catName}`);
      } else if (catId !== brandCatMatches[0]) {
        confidence = 'LOW';
        reasons.push(`CONFLICT: folder maps to ${catName} but brand ${asset.brand} belongs to ${CATALOGUE_CATEGORIES[brandCatMatches[0]].name}`);
      }
    } else if (brandCatMatches.length > 1) {
      reasons.push(`brand ${asset.brand} appears in ${brandCatMatches.length} categories (cross-category brand)`);
    }
  }
  
  const filenameLC = (asset.name + ' ' + asset.filename).toLowerCase();
  if (!catId || confidence === 'LOW') {
    if (/\b(laptop|macbook|chromebook|notebook|2-in-1|ultrabook|workstation)\b/.test(filenameLC)) {
      catId = 'C03'; catName = 'Laptops'; confidence = 'MEDIUM'; reasons.push('filename keyword: laptop family');
    } else if (/\b(tv|television|qled|oled|4k\s*tv|8k\s*tv|smart\s*tv|android\s*tv)\b/.test(filenameLC)) {
      catId = 'C06'; catName = 'TVs'; confidence = 'MEDIUM'; reasons.push('filename keyword: TV');
    } else if (/\b(smart\s*watch|watch|smartwatch|fitness\s*tracker|band)\b/.test(filenameLC)) {
      catId = 'C07'; catName = 'Smart Watches'; confidence = 'MEDIUM'; reasons.push('filename keyword: watch');
    } else if (/\b(earbuds|airpods|earpod|bud|in-?ear|tws)\b/.test(filenameLC)) {
      catId = 'C08'; subId = 'S08-01'; catName = 'Audio'; subName = 'Earbuds'; confidence = 'MEDIUM'; reasons.push('filename keyword: earbuds');
    } else if (/\b(headphone|headset|over-?ear|on-?ear)\b/.test(filenameLC)) {
      catId = 'C08'; subId = 'S08-02'; catName = 'Audio'; subName = 'Headphones'; confidence = 'MEDIUM'; reasons.push('filename keyword: headphones');
    } else if (/\b(speaker|soundbar|sound\s*bar|sound-bar|home\s*theatre)\b/.test(filenameLC)) {
      catId = 'C08'; catName = 'Audio'; confidence = 'MEDIUM'; reasons.push('filename keyword: audio speaker family');
      if (/(soundbar|sound\s*bar|sound-bar)/.test(filenameLC)) { subId = 'S08-04'; subName = 'Soundbars'; }
      else if (/(home\s*theatre)/.test(filenameLC)) { subId = 'S08-05'; subName = 'Home Theatre'; }
      else { subId = 'S08-03'; subName = 'Speakers'; }
    } else if (/\b(monitor|display)\b/.test(filenameLC)) {
      catId = 'C05'; catName = 'Monitors'; confidence = 'MEDIUM'; reasons.push('filename keyword: monitor');
    } else if (/\b(phone|smartphone|iphone|android\s*phone|galaxy|pixel)\b/.test(filenameLC)) {
      catId = 'C01'; catName = 'Smartphones'; confidence = 'MEDIUM'; reasons.push('filename keyword: phone');
    } else if (/\b(tablet|ipad)\b/.test(filenameLC)) {
      catId = 'C02'; catName = 'Tablets'; confidence = 'MEDIUM'; reasons.push('filename keyword: tablet');
    } else if (/\b(playstation|ps[45]|xbox|nintendo|switch|console|gaming\s*(pc|chair|keyboard|mouse|headset|controller))\b/.test(filenameLC)) {
      catId = 'C09'; catName = 'Gaming'; confidence = 'MEDIUM'; reasons.push('filename keyword: gaming');
    } else if (/\b(camera|dslr|mirrorless|drone|cam|webcam|action\s*cam|security\s*cam)\b/.test(filenameLC)) {
      catId = 'C10'; catName = 'Cameras'; confidence = 'MEDIUM'; reasons.push('filename keyword: camera');
    } else if (/\b(router|modem|switch|mesh|access\s*point|repeater|wifi|sim\s*router|networking)\b/.test(filenameLC)) {
      catId = 'C11'; catName = 'Networking'; confidence = 'MEDIUM'; reasons.push('filename keyword: networking');
    } else if (/\b(hdd|ssd|storage|flash\s*drive|memory\s*card|sd\s*card|microsd|nas|external\s*(drive|ssd|hdd))\b/.test(filenameLC)) {
      catId = 'C12'; catName = 'Storage'; confidence = 'MEDIUM'; reasons.push('filename keyword: storage');
    } else if (/\b(case|screen\s*protector|charger|power\s*bank|cable|usb\s*|hdmi|dock|bag|backpack|mouse|keyboard|tripod|holder|ups|printer|accessor(y|ies))\b/.test(filenameLC)) {
      catId = 'C13'; catName = 'Accessories'; confidence = 'MEDIUM'; reasons.push('filename keyword: accessories');
    }
  }
  
  return { catId, subId, catName, subName, confidence, reasons };
}

function main() {
  console.log('Loading ImageKit exports...');
  const products = JSON.parse(readFileSync(PRODUCTS_JSON, 'utf8'));
  const inventory = JSON.parse(readFileSync(INVENTORY_JSON, 'utf8'));
  const assetSummary = JSON.parse(readFileSync(ASSET_SUMMARY, 'utf8'));
  const exportSummary = JSON.parse(readFileSync(EXPORT_SUMMARY, 'utf8'));

  console.log(`Products (JSON): ${products.length} records`);
  console.log(`Inventory (JSON): ${inventory.length} records`);

  const invMap = new Map();
  for (const inv of inventory) {
    invMap.set(inv.fileId, inv);
  }

  const allBrandsFlat = Array.from(new Set(Object.values(BRANDS_BY_CATEGORY).flat()));

  const mergedAssets = [];
  const nonProductAssets = [];
  const uncertainItems = [];

  for (const p of products) {
    const inv = invMap.get(p.id) || {};
    const assetType = inv.assetType || null;
    const classificationReason = inv.classificationReason || '';
    const classificationConfidence = inv.classificationConfidence || '';

    const detectedBrand = p.brand || detectBrand(p.name, p.filename, p.sourceFolder, allBrandsFlat);
    const specs = detectSpecs(p.name, p.filename);
    const model = extractModel(p.name, detectedBrand);
    const displayName = cleanDisplayName(p.name);

    const classification = classifyCategory(
      { ...p, brand: detectedBrand },
      allBrandsFlat
    );

    const isNonProduct = isLikelyNonProduct(p.name, p.filename, p.sourceFolder, assetType);
    const needsReview =
      classification.confidence === 'LOW' ||
      !classification.catId ||
      !detectedBrand ||
      (classification.reasons || []).some(r => r.includes('CONFLICT'));

    const asset = {
      id: p.id,
      name: p.name,
      filename: p.filename,
      sourceFolder: p.sourceFolder,
      filePath: p.filePath,
      url: p.url,
      fileType: p.fileType,
      size: p.size,
      width: p.width,
      height: p.height,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      assetType,
      classificationConfidence: classificationConfidence || classification.confidence,
      classificationReason,
      brand: detectedBrand,
      model,
      displayName,
      sourceFileName: p.filename,
      imageUrl: p.url,
      specs,
      catId: classification.catId,
      subId: classification.subId,
      catName: classification.catName,
      subName: classification.subName,
      confidence: classification.confidence,
      classificationReasons: classification.reasons,
      needsReview,
      isNonProduct,
    };

    if (isNonProduct) {
      nonProductAssets.push(asset);
    } else {
      mergedAssets.push(asset);
    }

    if (needsReview || !classification.catId) {
      uncertainItems.push(asset);
    }
  }

  console.log(`Merged assets: ${mergedAssets.length} (product candidates)`);
  console.log(`Non-product assets: ${nonProductAssets.length} (logos/icons/banners)`);
  console.log(`Uncertain items (needs review): ${uncertainItems.length}`);

  const productGroupMap = new Map();
  for (const a of mergedAssets) {
    const baseKey = [
      a.catId || 'NO-CAT',
      a.brand || 'NO-BRAND',
      slugify(normalizeFileName(a.displayName) || a.filename),
    ].join('::');
    if (!productGroupMap.has(baseKey)) {
      productGroupMap.set(baseKey, {
        groupKey: baseKey,
        catId: a.catId,
        subId: a.subId,
        catName: a.catName,
        subName: a.subName,
        brand: a.brand,
        model: a.model,
        displayName: a.displayName,
        sourceFolder: a.sourceFolder,
        confidence: a.confidence,
        needsReview: a.needsReview,
        specs: a.specs,
        images: [],
      });
    }
    const grp = productGroupMap.get(baseKey);
    grp.images.push({
      id: a.id,
      url: a.url,
      filename: a.filename,
      width: a.width,
      height: a.height,
      size: a.size,
    });
    if (!grp.model && a.model) grp.model = a.model;
    if (!grp.displayName && a.displayName) grp.displayName = a.displayName;
    if (a.confidence === 'HIGH' && grp.confidence !== 'HIGH') grp.confidence = 'HIGH';
  }

  const productGroups = Array.from(productGroupMap.values())
    .sort((a, b) => (b.images.length - a.images.length));

  console.log(`Product groups (unique logical products): ${productGroups.length}`);

  const duplicateGroups = productGroups.filter(g => g.images.length >= 4);
  console.log(`Potential duplicate image groups (>= 4 images): ${duplicateGroups.length}`);

  const coverage = {};
  for (const cId of Object.keys(CATALOGUE_CATEGORIES)) {
    const cat = CATALOGUE_CATEGORIES[cId];
    coverage[cId] = {
      categoryId: cId,
      categoryName: cat.name,
      categorySlug: cat.slug,
      assetCount: 0,
      productCount: 0,
      brandsDetected: new Set(),
      subcategories: {},
      uncertainCount: 0,
      missingSubcategories: [...cat.subcategories],
    };
    for (const sId of cat.subcategories) {
      coverage[cId].subcategories[sId] = {
        subId: sId,
        assetCount: 0,
        productCount: 0,
        brandsDetected: new Set(),
      };
    }
  }

  for (const a of mergedAssets) {
    if (a.catId && coverage[a.catId]) {
      coverage[a.catId].assetCount++;
      if (a.brand) coverage[a.catId].brandsDetected.add(a.brand);
      if (a.needsReview) coverage[a.catId].uncertainCount++;
      if (a.subId && coverage[a.catId].subcategories[a.subId]) {
        coverage[a.catId].subcategories[a.subId].assetCount++;
        if (a.brand) coverage[a.catId].subcategories[a.subId].brandsDetected.add(a.brand);
        coverage[a.catId].missingSubcategories = coverage[a.catId].missingSubcategories.filter(s => s !== a.subId);
      }
    }
  }

  for (const g of productGroups) {
    if (g.catId && coverage[g.catId]) {
      coverage[g.catId].productCount++;
      if (g.subId && coverage[g.catId].subcategories[g.subId]) {
        coverage[g.catId].subcategories[g.subId].productCount++;
      }
    }
  }

  const catsWithAssets = [];
  const catsWithoutAssets = [];
  for (const cId of Object.keys(CATALOGUE_CATEGORIES)) {
    const c = coverage[cId];
    if (c.assetCount > 0) catsWithAssets.push(cId);
    else catsWithoutAssets.push(cId);
  }

  const brandsInCatalogue = new Set(allBrandsFlat);
  const brandsInImageKit = new Set();
  for (const a of mergedAssets) {
    if (a.brand) brandsInImageKit.add(a.brand);
  }
  const brandsCovered = [...brandsInImageKit].filter(b => brandsInCatalogue.has(b));
  const brandsMissingFromCatalogue = [...brandsInImageKit].filter(b => !brandsInCatalogue.has(b));
  const catalogueBrandsMissing = [...brandsInCatalogue].filter(b => !brandsInImageKit.has(b));

  console.log('\n=== CATEGORY COVERAGE SUMMARY ===');
  for (const cId of Object.keys(CATALOGUE_CATEGORIES)) {
    const c = coverage[cId];
    console.log(`${cId} ${c.categoryName}: ${c.assetCount} assets, ${c.productCount} products, ${c.brandsDetected.size} brands, ${c.uncertainCount} uncertain`);
  }
  console.log(`\nCategories with assets: ${catsWithAssets.length}/13`);
  console.log(`Categories with NO assets: ${catsWithoutAssets.length} → ${catsWithoutAssets.map(id => CATALOGUE_CATEGORIES[id].name).join(', ')}`);
  console.log(`\nBrands detected: ${brandsInImageKit.size} total, ${brandsCovered.length} match catalogue, ${brandsMissingFromCatalogue.length} not in catalogue, ${catalogueBrandsMissing.length} catalogue brands not in assets`);

  const finalCoverage = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalImageKitAssets: products.length,
      mergedProductCandidates: mergedAssets.length,
      nonProductAssets: nonProductAssets.length,
      uncertainItems: uncertainItems.length,
      productGroups: productGroups.length,
      duplicateGroupsLarge: duplicateGroups.length,
      categoriesWithAssets: catsWithAssets.length,
      categoriesWithoutAssets: catsWithoutAssets.length,
      brandsDetectedInAssets: brandsInImageKit.size,
      brandsMatchedToCatalogue: brandsCovered.length,
      brandsInAssetsMissingFromCatalogue: brandsMissingFromCatalogue.length,
      brandsInCatalogueMissingFromAssets: catalogueBrandsMissing.length,
    },
    categories: Object.fromEntries(
      Object.entries(coverage).map(([cId, c]) => [
        cId,
        {
          ...c,
          brandsDetected: [...c.brandsDetected],
          subcategories: Object.fromEntries(
            Object.entries(c.subcategories).map(([sId, s]) => [
              sId,
              { ...s, brandsDetected: [...s.brandsDetected] },
            ])
          ),
        },
      ])
    ),
    analysis: {
      categoriesRepresented: catsWithAssets.map(id => ({ id, name: CATALOGUE_CATEGORIES[id].name, assetCount: coverage[id].assetCount, productCount: coverage[id].productCount })),
      categoriesWithNoAssets: catsWithoutAssets.map(id => ({ id, name: CATALOGUE_CATEGORIES[id].name })),
      brandsRepresented: [...brandsInImageKit].sort(),
      brandsInCatalogueWithNoAssets: catalogueBrandsMissing.sort(),
      brandsInAssetsNotInCatalogue: brandsMissingFromCatalogue.sort(),
      uncategorizedAssets: mergedAssets.filter(a => !a.catId).length,
      lowConfidenceAssets: mergedAssets.filter(a => a.confidence === 'LOW').length,
    },
    imageKitFolders: exportSummary.folders,
    folderToCategoryMapping: FOLDER_TO_CATEGORY_MAP,
  };

  writeFileSync(COVERAGE_JSON, JSON.stringify(finalCoverage, null, 2));
  console.log(`\nWritten: ${COVERAGE_JSON}`);

  const coverageRows = [];
  for (const cId of Object.keys(CATALOGUE_CATEGORIES)) {
    const cat = CATALOGUE_CATEGORIES[cId];
    const c = coverage[cId];
    coverageRows.push({
      CATEGORY: cat.name,
      CATEGORY_ID: cId,
      SUBCATEGORY: '',
      SUBCATEGORY_ID: '',
      IMAGEKIT_ASSET_COUNT: c.assetCount,
      OBVIOUS_PRODUCT_COUNT: c.productCount,
      BRANDS_DETECTED: [...c.brandsDetected].sort().join('|'),
      MISSING_OR_UNCERTAIN: c.uncertainCount > 0 ? `${c.uncertainCount} uncertain; Missing subcats: ${c.missingSubcategories.length > 0 ? c.missingSubcategories.join(',') : 'none'}` : (c.missingSubcategories.length > 0 ? `Missing subcats: ${c.missingSubcategories.join(',')}` : ''),
    });
    for (const sId of cat.subcategories) {
      const s = c.subcategories[sId];
      coverageRows.push({
        CATEGORY: cat.name,
        CATEGORY_ID: cId,
        SUBCATEGORY: s.subId,
        SUBCATEGORY_ID: sId,
        IMAGEKIT_ASSET_COUNT: s.assetCount,
        OBVIOUS_PRODUCT_COUNT: s.productCount,
        BRANDS_DETECTED: [...s.brandsDetected].sort().join('|'),
        MISSING_OR_UNCERTAIN: s.assetCount === 0 ? 'NO ASSETS' : '',
      });
    }
  }
  writeFileSync(COVERAGE_CSV, toCSV(
    ['CATEGORY','CATEGORY_ID','SUBCATEGORY','SUBCATEGORY_ID','IMAGEKIT_ASSET_COUNT','OBVIOUS_PRODUCT_COUNT','BRANDS_DETECTED','MISSING/UNCERTAIN ITEMS'],
    coverageRows
  ));
  console.log(`Written: ${COVERAGE_CSV}`);

  const normalizedProducts = productGroups.map((g, i) => ({
    productId: `IMG-PROD-${String(i+1).padStart(5, '0')}`,
    brand: g.brand,
    model: g.model,
    displayName: g.displayName,
    slug: slugify([g.brand, g.model, g.displayName].filter(Boolean).join(' ') || `product-${i+1}`),
    categoryId: g.catId,
    categoryName: g.catName,
    subcategoryId: g.subId,
    subcategoryName: g.subName,
    sourceFolder: g.sourceFolder,
    imageCount: g.images.length,
    primaryImageUrl: g.images.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0]?.url || g.images[0]?.url,
    images: g.images,
    specs: g.specs,
    confidence: g.confidence,
    needsReview: g.needsReview,
  }));

  writeFileSync(NORMALIZED_PRODUCTS_JSON, JSON.stringify(normalizedProducts, null, 2));
  console.log(`Written: ${NORMALIZED_PRODUCTS_JSON} (${normalizedProducts.length} products)`);

  writeFileSync(UNCERTAIN_ITEMS_CSV, toCSV(
    ['ID','SOURCE_FOLDER','FILENAME','DISPLAY_NAME','BRAND','CAT_ID','CAT_NAME','CONFIDENCE','REASONS','URL'],
    uncertainItems.map(a => ({
      ID: a.id, SOURCE_FOLDER: a.sourceFolder, FILENAME: a.filename,
      DISPLAY_NAME: a.displayName, BRAND: a.brand || '',
      CAT_ID: a.catId || '', CAT_NAME: a.catName || '',
      CONFIDENCE: a.confidence, REASONS: (a.classificationReasons || []).join(' | '), URL: a.url,
    }))
  ));
  console.log(`Written: ${UNCERTAIN_ITEMS_CSV}`);

  writeFileSync(NON_PRODUCT_ASSETS_CSV, toCSV(
    ['ID','SOURCE_FOLDER','FILENAME','NAME','ASSET_TYPE','URL'],
    nonProductAssets.map(a => ({
      ID: a.id, SOURCE_FOLDER: a.sourceFolder, FILENAME: a.filename,
      NAME: a.name, ASSET_TYPE: a.assetType || 'GUESS_NON_PRODUCT', URL: a.url,
    }))
  ));
  console.log(`Written: ${NON_PRODUCT_ASSETS_CSV}`);

  writeFileSync(DUPLICATE_PRODUCT_GROUPS_CSV, toCSV(
    ['GROUP_KEY','CATEGORY','BRAND','DISPLAY_NAME','IMAGE_COUNT','PRIMARY_IMAGE','CONFIDENCE','NEEDS_REVIEW'],
    duplicateGroups.map(g => ({
      GROUP_KEY: g.groupKey, CATEGORY: g.catName || '', BRAND: g.brand || '',
      DISPLAY_NAME: g.displayName, IMAGE_COUNT: g.images.length,
      PRIMARY_IMAGE: g.images[0]?.url || '', CONFIDENCE: g.confidence, NEEDS_REVIEW: g.needsReview ? 'YES' : 'NO',
    }))
  ));
  console.log(`Written: ${DUPLICATE_PRODUCT_GROUPS_CSV}`);

  console.log('\n=== DONE ===');
}

main();
