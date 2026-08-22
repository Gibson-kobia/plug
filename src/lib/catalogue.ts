import type { Category, Subcategory, Brand } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'C01',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'New & used phones, Android and iPhone',
    subcategories: [
      { id: 'S01-01', name: 'Android Phones', slug: 'android-phones', categoryId: 'C01' },
      { id: 'S01-02', name: 'iPhones', slug: 'iphones', categoryId: 'C01' },
      { id: 'S01-03', name: 'Flagship Phones', slug: 'flagship-phones', categoryId: 'C01' },
      { id: 'S01-04', name: 'Midrange Phones', slug: 'midrange-phones', categoryId: 'C01' },
      { id: 'S01-05', name: 'Budget Phones', slug: 'budget-phones', categoryId: 'C01' },
      { id: 'S01-06', name: 'Gaming Phones', slug: 'gaming-phones', categoryId: 'C01' },
      { id: 'S01-07', name: 'Foldable Phones', slug: 'foldable-phones', categoryId: 'C01' },
      { id: 'S01-08', name: '5G Phones', slug: '5g-phones', categoryId: 'C01' },
      { id: 'S01-09', name: 'Refurbished Phones', slug: 'refurbished-phones', categoryId: 'C01' },
      { id: 'S01-10', name: 'Used Phones', slug: 'used-phones', categoryId: 'C01' },
      { id: 'S01-11', name: 'Dual SIM Phones', slug: 'dual-sim-phones', categoryId: 'C01' },
      { id: 'S01-12', name: 'Business Phones', slug: 'business-phones', categoryId: 'C01' },
      { id: 'S01-13', name: 'Rugged Phones', slug: 'rugged-phones', categoryId: 'C01' },
    ],
  },
  {
    id: 'C02',
    name: 'Tablets',
    slug: 'tablets',
    description: 'Android tablets, iPads, drawing tablets',
    subcategories: [
      { id: 'S02-01', name: 'Android Tablets', slug: 'android-tablets', categoryId: 'C02' },
      { id: 'S02-02', name: 'iPads', slug: 'ipads', categoryId: 'C02' },
      { id: 'S02-03', name: 'Kids Tablets', slug: 'kids-tablets', categoryId: 'C02' },
      { id: 'S02-04', name: 'Drawing Tablets', slug: 'drawing-tablets', categoryId: 'C02' },
      { id: 'S02-05', name: 'Business Tablets', slug: 'business-tablets', categoryId: 'C02' },
      { id: 'S02-06', name: 'Student Tablets', slug: 'student-tablets', categoryId: 'C02' },
      { id: 'S02-07', name: 'Gaming Tablets', slug: 'gaming-tablets', categoryId: 'C02' },
    ],
  },
  {
    id: 'C03',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Laptops, MacBooks, Chromebooks, 2-in-1',
    subcategories: [
      { id: 'S03-01', name: 'Business', slug: 'business-laptops', categoryId: 'C03' },
      { id: 'S03-02', name: 'Gaming', slug: 'gaming-laptops', categoryId: 'C03' },
      { id: 'S03-03', name: 'Student', slug: 'student-laptops', categoryId: 'C03' },
      { id: 'S03-04', name: 'Workstation', slug: 'workstation-laptops', categoryId: 'C03' },
      { id: 'S03-05', name: 'Ultrabook', slug: 'ultrabook', categoryId: 'C03' },
      { id: 'S03-06', name: '2-in-1', slug: '2-in-1-laptops', categoryId: 'C03' },
      { id: 'S03-07', name: 'Chromebook', slug: 'chromebook', categoryId: 'C03' },
      { id: 'S03-08', name: 'MacBook', slug: 'macbook', categoryId: 'C03' },
      { id: 'S03-09', name: 'Refurbished', slug: 'refurbished-laptops', categoryId: 'C03' },
      { id: 'S03-10', name: 'Used', slug: 'used-laptops', categoryId: 'C03' },
    ],
  },
  {
    id: 'C04',
    name: 'Desktop Computers',
    slug: 'desktops',
    description: 'Gaming PCs, Office PCs, Mini PCs, AIO, Workstations, Custom Builds',
    subcategories: [
      { id: 'S04-01', name: 'Gaming PCs', slug: 'gaming-pcs', categoryId: 'C04' },
      { id: 'S04-02', name: 'Office PCs', slug: 'office-pcs', categoryId: 'C04' },
      { id: 'S04-03', name: 'Mini PCs', slug: 'mini-pcs', categoryId: 'C04' },
      { id: 'S04-04', name: 'All-in-One PCs', slug: 'all-in-one-pcs', categoryId: 'C04' },
      { id: 'S04-05', name: 'Workstations', slug: 'workstations', categoryId: 'C04' },
      { id: 'S04-06', name: 'Custom Builds', slug: 'custom-builds', categoryId: 'C04' },
    ],
  },
  {
    id: 'C05',
    name: 'Monitors',
    slug: 'monitors',
    description: 'Gaming, Office, Professional, Curved, Ultrawide, Portable',
    subcategories: [
      { id: 'S05-01', name: 'Gaming', slug: 'gaming-monitors', categoryId: 'C05' },
      { id: 'S05-02', name: 'Office', slug: 'office-monitors', categoryId: 'C05' },
      { id: 'S05-03', name: 'Professional', slug: 'professional-monitors', categoryId: 'C05' },
      { id: 'S05-04', name: 'Curved', slug: 'curved-monitors', categoryId: 'C05' },
      { id: 'S05-05', name: 'Ultrawide', slug: 'ultrawide-monitors', categoryId: 'C05' },
      { id: 'S05-06', name: 'Portable', slug: 'portable-monitors', categoryId: 'C05' },
    ],
  },
  {
    id: 'C06',
    name: 'TVs',
    slug: 'tvs',
    description: 'Smart TVs, QLED, OLED, 4K, 8K, Used TVs',
    subcategories: [
      { id: 'S06-01', name: 'Smart TVs', slug: 'smart-tvs', categoryId: 'C06' },
      { id: 'S06-02', name: 'Android TVs', slug: 'android-tvs', categoryId: 'C06' },
      { id: 'S06-03', name: 'Google TVs', slug: 'google-tvs', categoryId: 'C06' },
      { id: 'S06-04', name: 'QLED', slug: 'qled-tvs', categoryId: 'C06' },
      { id: 'S06-05', name: 'OLED', slug: 'oled-tvs', categoryId: 'C06' },
      { id: 'S06-06', name: 'Mini LED', slug: 'mini-led-tvs', categoryId: 'C06' },
      { id: 'S06-07', name: 'LED', slug: 'led-tvs', categoryId: 'C06' },
      { id: 'S06-08', name: '4K', slug: '4k-tvs', categoryId: 'C06' },
      { id: 'S06-09', name: '8K', slug: '8k-tvs', categoryId: 'C06' },
      { id: 'S06-10', name: 'Full HD', slug: 'full-hd-tvs', categoryId: 'C06' },
      { id: 'S06-11', name: 'Used TVs', slug: 'used-tvs', categoryId: 'C06' },
    ],
  },
  {
    id: 'C07',
    name: 'Smart Watches',
    slug: 'smartwatches',
    description: 'Fitness, Premium, Kids, Business, Outdoor',
    subcategories: [
      { id: 'S07-01', name: 'Fitness', slug: 'fitness-watches', categoryId: 'C07' },
      { id: 'S07-02', name: 'Premium', slug: 'premium-watches', categoryId: 'C07' },
      { id: 'S07-03', name: 'Kids', slug: 'kids-watches', categoryId: 'C07' },
      { id: 'S07-04', name: 'Business', slug: 'business-watches', categoryId: 'C07' },
      { id: 'S07-05', name: 'Outdoor', slug: 'outdoor-watches', categoryId: 'C07' },
    ],
  },
  {
    id: 'C08',
    name: 'Audio',
    slug: 'audio',
    description: 'Earbuds, Headphones, Speakers, Soundbars, Home Theatre, Mics, DACs, Amps',
    subcategories: [
      { id: 'S08-01', name: 'Earbuds', slug: 'earbuds', categoryId: 'C08' },
      { id: 'S08-02', name: 'Headphones', slug: 'headphones', categoryId: 'C08' },
      { id: 'S08-03', name: 'Speakers', slug: 'speakers', categoryId: 'C08' },
      { id: 'S08-04', name: 'Soundbars', slug: 'soundbars', categoryId: 'C08' },
      { id: 'S08-05', name: 'Home Theatre', slug: 'home-theatre', categoryId: 'C08' },
      { id: 'S08-06', name: 'Microphones', slug: 'microphones', categoryId: 'C08' },
      { id: 'S08-07', name: 'DACs', slug: 'dacs', categoryId: 'C08' },
      { id: 'S08-08', name: 'Amplifiers', slug: 'amplifiers', categoryId: 'C08' },
    ],
  },
  {
    id: 'C09',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Consoles, Controllers, Chairs, Keyboards, Mouse, Headsets, Monitors, Laptops, PCs',
    subcategories: [
      { id: 'S09-01', name: 'Consoles', slug: 'consoles', categoryId: 'C09' },
      { id: 'S09-02', name: 'Controllers', slug: 'controllers', categoryId: 'C09' },
      { id: 'S09-03', name: 'Gaming Chairs', slug: 'gaming-chairs', categoryId: 'C09' },
      { id: 'S09-04', name: 'Gaming Keyboards', slug: 'gaming-keyboards', categoryId: 'C09' },
      { id: 'S09-05', name: 'Gaming Mouse', slug: 'gaming-mouse', categoryId: 'C09' },
      { id: 'S09-06', name: 'Gaming Headsets', slug: 'gaming-headsets', categoryId: 'C09' },
      { id: 'S09-07', name: 'Gaming Monitors', slug: 'gaming-monitors-cross', categoryId: 'C09' },
      { id: 'S09-08', name: 'Gaming Laptops', slug: 'gaming-laptops-cross', categoryId: 'C09' },
      { id: 'S09-09', name: 'Gaming PCs', slug: 'gaming-pcs-cross', categoryId: 'C09' },
    ],
  },
  {
    id: 'C10',
    name: 'Cameras',
    slug: 'cameras',
    description: 'Mirrorless, DSLR, Action, Drones, Security, Webcams',
    subcategories: [
      { id: 'S10-01', name: 'Mirrorless', slug: 'mirrorless-cameras', categoryId: 'C10' },
      { id: 'S10-02', name: 'DSLR', slug: 'dslr-cameras', categoryId: 'C10' },
      { id: 'S10-03', name: 'Action Cameras', slug: 'action-cameras', categoryId: 'C10' },
      { id: 'S10-04', name: 'Drones', slug: 'drones', categoryId: 'C10' },
      { id: 'S10-05', name: 'Security Cameras', slug: 'security-cameras', categoryId: 'C10' },
      { id: 'S10-06', name: 'Webcams', slug: 'webcams', categoryId: 'C10' },
    ],
  },
  {
    id: 'C11',
    name: 'Networking',
    slug: 'networking',
    description: 'Routers, Mesh, Access Points, Switches, Repeaters, Modems, SIM Routers',
    subcategories: [
      { id: 'S11-01', name: 'Routers', slug: 'routers', categoryId: 'C11' },
      { id: 'S11-02', name: 'WiFi Mesh', slug: 'wifi-mesh', categoryId: 'C11' },
      { id: 'S11-03', name: 'Access Points', slug: 'access-points', categoryId: 'C11' },
      { id: 'S11-04', name: 'Switches', slug: 'switches', categoryId: 'C11' },
      { id: 'S11-05', name: 'Repeaters', slug: 'repeaters', categoryId: 'C11' },
      { id: 'S11-06', name: 'Modems', slug: 'modems', categoryId: 'C11' },
      { id: 'S11-07', name: 'SIM Routers', slug: 'sim-routers', categoryId: 'C11' },
    ],
  },
  {
    id: 'C12',
    name: 'Storage',
    slug: 'storage',
    description: 'HDD, SSD, Flash Drives, Memory Cards, NAS, External Drives',
    subcategories: [
      { id: 'S12-01', name: 'Hard Drives (HDD)', slug: 'hard-drives', categoryId: 'C12' },
      { id: 'S12-02', name: 'SSDs (Internal)', slug: 'ssds-internal', categoryId: 'C12' },
      { id: 'S12-03', name: 'Flash Drives', slug: 'flash-drives', categoryId: 'C12' },
      { id: 'S12-04', name: 'Memory Cards', slug: 'memory-cards', categoryId: 'C12' },
      { id: 'S12-05', name: 'NAS', slug: 'nas', categoryId: 'C12' },
      { id: 'S12-06', name: 'External SSDs', slug: 'external-ssds', categoryId: 'C12' },
      { id: 'S12-07', name: 'External HDDs', slug: 'external-hdds', categoryId: 'C12' },
    ],
  },
  {
    id: 'C13',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Largest category — all accessories (phone cases, cables, power banks, bags, printers, etc.)',
    subcategories: [
      { id: 'S13-01', name: 'Phone Cases', slug: 'phone-cases', categoryId: 'C13' },
      { id: 'S13-02', name: 'Screen Protectors', slug: 'screen-protectors', categoryId: 'C13' },
      { id: 'S13-03', name: 'Chargers', slug: 'chargers', categoryId: 'C13' },
      { id: 'S13-04', name: 'Fast Chargers', slug: 'fast-chargers', categoryId: 'C13' },
      { id: 'S13-05', name: 'Power Banks', slug: 'power-banks', categoryId: 'C13' },
      { id: 'S13-06', name: 'USB Cables', slug: 'usb-cables', categoryId: 'C13' },
      { id: 'S13-07', name: 'Lightning Cables', slug: 'lightning-cables', categoryId: 'C13' },
      { id: 'S13-08', name: 'USB-C to USB-C Cables', slug: 'usb-c-cables', categoryId: 'C13' },
      { id: 'S13-09', name: 'HDMI Cables', slug: 'hdmi-cables', categoryId: 'C13' },
      { id: 'S13-10', name: 'DisplayPort Cables', slug: 'displayport-cables', categoryId: 'C13' },
      { id: 'S13-11', name: 'Laptop Chargers', slug: 'laptop-chargers', categoryId: 'C13' },
      { id: 'S13-12', name: 'Laptop Batteries', slug: 'laptop-batteries', categoryId: 'C13' },
      { id: 'S13-13', name: 'Laptop Keyboards', slug: 'laptop-keyboards', categoryId: 'C13' },
      { id: 'S13-14', name: 'Laptop Screens', slug: 'laptop-screens', categoryId: 'C13' },
      { id: 'S13-15', name: 'Cooling Pads', slug: 'cooling-pads', categoryId: 'C13' },
      { id: 'S13-16', name: 'Docking Stations', slug: 'docking-stations', categoryId: 'C13' },
      { id: 'S13-17', name: 'Mouse (non-gaming)', slug: 'mouse', categoryId: 'C13' },
      { id: 'S13-18', name: 'Keyboards (non-gaming)', slug: 'keyboards', categoryId: 'C13' },
      { id: 'S13-19', name: 'Mouse Pads', slug: 'mouse-pads', categoryId: 'C13' },
      { id: 'S13-20', name: 'Laptop Bags', slug: 'laptop-bags', categoryId: 'C13' },
      { id: 'S13-21', name: 'Backpacks', slug: 'backpacks', categoryId: 'C13' },
      { id: 'S13-22', name: 'Tripods', slug: 'tripods', categoryId: 'C13' },
      { id: 'S13-23', name: 'Phone Holders', slug: 'phone-holders', categoryId: 'C13' },
      { id: 'S13-24', name: 'Car Chargers', slug: 'car-chargers', categoryId: 'C13' },
      { id: 'S13-25', name: 'Car Phone Holders', slug: 'car-phone-holders', categoryId: 'C13' },
      { id: 'S13-26', name: 'Bluetooth Adapters', slug: 'bluetooth-adapters', categoryId: 'C13' },
      { id: 'S13-27', name: 'USB Hubs', slug: 'usb-hubs', categoryId: 'C13' },
      { id: 'S13-28', name: 'Memory Cards (Acc)', slug: 'memory-cards-acc', categoryId: 'C13' },
      { id: 'S13-29', name: 'OTG Adapters', slug: 'otg-adapters', categoryId: 'C13' },
      { id: 'S13-30', name: 'Stylus Pens', slug: 'stylus-pens', categoryId: 'C13' },
      { id: 'S13-31', name: 'Microphones (Acc)', slug: 'microphones-acc', categoryId: 'C13' },
      { id: 'S13-32', name: 'Ring Lights', slug: 'ring-lights', categoryId: 'C13' },
      { id: 'S13-33', name: 'Webcams (Acc)', slug: 'webcams-acc', categoryId: 'C13' },
      { id: 'S13-34', name: 'Monitor Arms', slug: 'monitor-arms', categoryId: 'C13' },
      { id: 'S13-35', name: 'Cleaning Kits', slug: 'cleaning-kits', categoryId: 'C13' },
      { id: 'S13-36', name: 'Extension Cables', slug: 'extension-cables', categoryId: 'C13' },
      { id: 'S13-37', name: 'Surge Protectors', slug: 'surge-protectors', categoryId: 'C13' },
      { id: 'S13-38', name: 'Smart Plugs', slug: 'smart-plugs', categoryId: 'C13' },
      { id: 'S13-39', name: 'Smart Bulbs', slug: 'smart-bulbs', categoryId: 'C13' },
      { id: 'S13-40', name: 'UPS', slug: 'ups', categoryId: 'C13' },
      { id: 'S13-41', name: 'Printers', slug: 'printers', categoryId: 'C13' },
      { id: 'S13-42', name: 'Printer Ink / Toner', slug: 'printer-ink', categoryId: 'C13' },
      { id: 'S13-43', name: 'Scanners', slug: 'scanners', categoryId: 'C13' },
      { id: 'S13-44', name: 'Barcode Scanners', slug: 'barcode-scanners', categoryId: 'C13' },
      { id: 'S13-45', name: 'Receipt Printers', slug: 'receipt-printers', categoryId: 'C13' },
      { id: 'S13-46', name: 'POS Machines', slug: 'pos-machines', categoryId: 'C13' },
      { id: 'S13-47', name: 'Label Printers', slug: 'label-printers', categoryId: 'C13' },
    ],
  },
];

const BRAND_ENTRIES: [string, string[]][] = [
  ['C01', ['Apple','Samsung','Tecno','Infinix','itel','Xiaomi','Redmi','POCO','Oppo','Vivo','OnePlus','Nothing','Google Pixel','Huawei','Honor','Nokia','Motorola','Realme','Asus','Sony','Blackview','Doogee','Ulefone','Oukitel','ZTE','Lenovo','Meizu']],
  ['C02', ['Samsung','Apple','Lenovo','Huawei','Xiaomi','Redmi','Honor','Amazon','Microsoft','Nokia','Blackview','Doogee','Teclast','Alldocube']],
  ['C03', ['HP','Dell','Lenovo','Asus','Acer','Apple','MSI','Gigabyte','Razer','Microsoft','Samsung','Huawei','LG','Toshiba','Fujitsu','Dynabook','Framework']],
  ['C04', ['HP','Dell','Lenovo','Asus','Acer','Apple','MSI','Gigabyte','Razer','Microsoft','Samsung','Intel NUC','Minisforum','Beelink','Chuwi','GeekFun','iBUYPOWER','CyberPowerPC','Alienware','Corsair']],
  ['C05', ['Samsung','LG','Dell','HP','AOC','MSI','ViewSonic','BenQ','Asus','Gigabyte','Acer','Philips','Lenovo']],
  ['C06', ['Samsung','LG','Hisense','TCL','Skyworth','Sony','Vitron','Vision Plus','Syinix','Haier','Toshiba','Panasonic','Sharp']],
  ['C07', ['Apple','Samsung','Huawei','Xiaomi','Redmi','Amazfit','Garmin','Fitbit','CMF','Nothing','Oraimo','Haylou','Kieslect']],
  ['C08', ['JBL','Sony','Anker','Soundcore','Oraimo','Bose','Marshall','Apple','Samsung','Beats','Skullcandy','Logitech','Edifier','Tribit','Tronsmart','Haylou','CMF','Earfun','1MORE','FiiO','Shure','Sennheiser','Audio-Technica','Harman Kardon']],
  ['C09', ['Sony','Microsoft','Nintendo','Logitech','Razer','SteelSeries','Corsair','HyperX','Redragon','MSI','ASUS ROG','Acer Predator','Lenovo Legion','HP Omen','Alienware','DXRacer','Secretlab','AndaSeat','Fantech','Bloody','Cougar','Glorious','Kinesis']],
  ['C10', ['Canon','Nikon','Sony','Fujifilm','DJI','GoPro','Panasonic','Insta360','Sigma','Tamron','Hikvision','Dahua','Reolink','Ezviz','Ring','Blink','Arlo','Logitech','Anker','AverMedia','Elgato']],
  ['C11', ['TP-Link','D-Link','Huawei','MikroTik','Ubiquiti','UniFi','Netgear','Tenda','Mercusys','ASUS','Linksys','Xiaomi','ZTE','Faiber','Totolink','Cisco','Juniper','Aruba']],
  ['C12', ['Samsung','Kingston','SanDisk','WD','Seagate','Crucial','Lexar','Transcend','ADATA','TeamGroup','Corsair','G.Skill','Silicon Power','Patriot','Toshiba','HP','Verbatim','PNY','OWC','Synology','QNAP','Asustor','TerraMaster']],
  ['C13', ['Oraimo','Anker','Baseus','UGREEN','Belkin','Spigen','Ringke','OtterBox','Tech21','Catalyst','Griffin','Logitech','Microsoft','Lenovo','HP','Dell','Samsung','Apple','JBL','Sony','Tribit','Tronsmart','Promate','Havit','Fantech','T-Dagger','Vention','Cable Matters','StarTech','TP-Link','Ezviz','Sandisk','Kingston','Verbatim','3M','Schneider','APC','Eaton','Everbrite','Premier','Canon','Epson','Brother','Xerox','Honeywell','Zebra','Sato']],
];

export const BRANDS: Brand[] = (() => {
  const byName = new Map<string, Brand>();
  for (const [catId, names] of BRAND_ENTRIES) {
    for (const n of names) {
      if (!byName.has(n)) byName.set(n, { name: n, categoryIds: [] });
      byName.get(n)!.categoryIds.push(catId);
    }
  }
  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
})();

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getSubcategoryById(id: string): Subcategory | undefined {
  for (const cat of CATEGORIES) {
    const s = cat.subcategories.find(s => s.id === id);
    if (s) return s;
  }
  return undefined;
}

export function getSubcategoryBySlug(slug: string): Subcategory | undefined {
  for (const cat of CATEGORIES) {
    const s = cat.subcategories.find(s => s.slug === slug);
    if (s) return s;
  }
  return undefined;
}

export function getBrandByName(name: string): Brand | undefined {
  return BRANDS.find(b => b.name.toLowerCase() === name.toLowerCase());
}

export const CATEGORY_ICON_COLORS: Record<string, string> = {
  C01: 'from-navy-700 to-navy-900',
  C02: 'from-copper-500 to-copper-700',
  C03: 'from-navy-600 to-navy-800',
  C04: 'from-slate-700 to-slate-900',
  C05: 'from-indigo-600 to-indigo-800',
  C06: 'from-jade-600 to-jade-800',
  C07: 'from-copper-400 to-copper-600',
  C08: 'from-purple-600 to-purple-800',
  C09: 'from-rose-600 to-rose-800',
  C10: 'from-slate-800 to-slate-900',
  C11: 'from-emerald-600 to-emerald-800',
  C12: 'from-blue-600 to-blue-800',
  C13: 'from-amber-500 to-amber-700',
};

export const CATEGORY_DEFAULT_COLOR = 'from-zinc-600 to-zinc-800';
