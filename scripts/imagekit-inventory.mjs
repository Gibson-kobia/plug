#!/usr/bin/env node
/**
 * ImageKit Asset Inventory — Kenya Electronics Marketplace
 *
 * READ-ONLY utility. Does NOT modify, move, rename, or delete anything in
 * ImageKit. Only calls the metadata (files/folders) APIs. Never downloads
 * image binaries. Never fabricates metadata.
 *
 * Credentials are read from process.env (IMAGEKIT_PUBLIC_KEY / PRIVATE_KEY /
 * URL_ENDPOINT). Run with:
 *   node --env-file=.env.local scripts/imagekit-inventory.mjs
 * (or export the vars in your shell).
 *
 * Outputs (deterministic; rerunnable):
 *   data/imagekit-inventory.json
 *   data/imagekit-inventory.csv
 *   data/imagekit-asset-summary.json
 *   data/imagekit-duplicate-candidates.csv
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API_BASE = 'https://api.imagekit.io/v1';
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
const DATA_DIR = join(process.cwd(), 'data');

if (!PRIVATE_KEY || !URL_ENDPOINT) {
  console.error('MISSING_IMAGEKIT_ENV: IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT are required.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Expected project folders (Phase 1). Names are matched case-sensitively
// against ImageKit root folders.
// ---------------------------------------------------------------------------
const PROJECT_FOLDERS = [
  'airbuds',
  'airbuds2',
  'airbuds3',
  'airbuds4',
  'airbuds5',
  'gadgets',
  'Oppo',
  'Oppo2',
  'Oppo3',
  'Oppo4',
  'Oppo5',
  'Oppo6',
  'Bts',
  'itel',
  'tvs',
  'Sound Bars',
  'laptops1',
  'ecommerce',
];

const FOLDER_LIMIT = 1000; // API max per request
const MAX_PAGES = 1000; // safety bound (1000 * 1000 files)
const API_ERRORS = [];

const authHeader =
  'Basic ' + Buffer.from(`${PRIVATE_KEY}:`).toString('base64');

async function apiGet(path, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}${path}${query ? '?' + query : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    API_ERRORS.push({ url, status: res.status, body: body.slice(0, 300) });
    throw new Error(`ImageKit ${res.status} for ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Discovery: list root folders
// ---------------------------------------------------------------------------
async function listRootFolders() {
  const seen = new Set();
  let skip = 0;
  let safety = 0;
  while (safety < MAX_PAGES) {
    safety += 1;
    const data = await apiGet('/files', { limit: FOLDER_LIMIT, skip, fileType: 'all' });
    const arr = Array.isArray(data) ? data : data?.files ?? [];
    if (arr.length === 0) break;
    for (const f of arr) {
      const p = (f.filePath || '').replace(/^\//, '');
      const firstSlash = p.indexOf('/');
      if (firstSlash > 0) seen.add(p.slice(0, firstSlash));
    }
    if (arr.length < FOLDER_LIMIT) break;
    skip += FOLDER_LIMIT;
  }
  return [...seen].sort();
}

// ---------------------------------------------------------------------------
// List all files under a folder, recursively, with pagination.
// Returns { files: [], pagination: {} } where files carry the API metadata.
// ---------------------------------------------------------------------------
async function listFilesInFolder(folderPath) {
  const files = [];
  const pagination = { folderPath, pages: 0, total: 0, complete: false };

  let skip = 0;
  while (pagination.pages < MAX_PAGES) {
    let batch;
    try {
      batch = await apiGet('/files', {
        path: folderPath,
        limit: FOLDER_LIMIT,
        skip,
        fileType: 'all',
      });
    } catch (err) {
      pagination.error = String(err);
      break;
    }
    const arr = Array.isArray(batch) ? batch : batch?.fileVersions ?? batch?.files ?? [];
    if (arr.length === 0) break;
    files.push(...arr.filter((f) => (f.type ?? f.fileType) !== 'folder'));
    pagination.pages += 1;
    pagination.total += arr.length;
    if (arr.length < FOLDER_LIMIT) break;
    skip += FOLDER_LIMIT;
  }
  pagination.complete = pagination.pages < MAX_PAGES;
  return { files, pagination };
}

// ---------------------------------------------------------------------------
// Recursive discovery of every folder beneath a project root folder
// ---------------------------------------------------------------------------
async function collectSubfolders(rootPath, depth = 0) {
  if (depth > 20) return [];
  const normalized = '/' + rootPath.replace(/^\/+|\/+$/g, '') + '/';
  const children = new Set();
  let skip = 0;
  let safety = 0;
  while (safety < MAX_PAGES) {
    safety += 1;
    let data;
    try {
      data = await apiGet('/files', { limit: FOLDER_LIMIT, skip, fileType: 'all' });
    } catch (err) {
      API_ERRORS.push({ url: rootPath, error: String(err) });
      return [];
    }
    const arr = Array.isArray(data) ? data : data?.files ?? [];
    if (arr.length === 0) break;
    for (const f of arr) {
      let p = f.filePath || '';
      if (!p.startsWith('/')) p = '/' + p;
      if (p === normalized.slice(0, -1)) continue;
      if (!p.startsWith(normalized)) continue;
      const tail = p.slice(normalized.length);
      const nextSlash = tail.indexOf('/');
      if (nextSlash > 0) {
        children.add(normalized + tail.slice(0, nextSlash));
      }
    }
    if (arr.length < FOLDER_LIMIT) break;
    skip += FOLDER_LIMIT;
  }
  const out = [...children];
  for (const sub of [...children]) {
    const deeper = await collectSubfolders(sub, depth + 1);
    out.push(...deeper);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Classification (file-level, conservative). Never guesses without evidence.
//
// Production-safety rules:
//  - Generic words that commonly appear in electronics product names
//    (phone, bag, card, home, star, list, grid, menu, user, profile,
//    mobile, etc.) are deliberately EXCLUDED from icon hints so products
//    are never misclassified as icons.
//  - An image is only classified PRODUCT_IMAGE when it has plausible
//    product dimensions (>= 400x300) and matches no other signal.
//  - Ambiguous assets default to UNKNOWN with an explanation.
// ---------------------------------------------------------------------------
const STRONG_ICON_HINTS =
  /(^|[-_\s])(whatsapp|search|cart|account|arrow|chevron|social|facebook|instagram|tiktok|twitter|payment|mpesa|visa|mastercard|heart|wishlist|share|menu|close|plus|minus|check|trash|settings|notification|bell|filter|logo|symbol|badge|user|profile|logout|login|signin|signup|download|upload|refresh|edit|delete|save|send|call|email|location|pin|map|clock|time|calendar|info|help|question|warning|error|success|spinner|loader|empty|placeholder)([-_\s]|$)/i;

const LOGO_HINTS = /(^|[-_\s])(logo|wordmark|brandmark|brand-logo|monogram|official-logo|[-_\s]original)([-_\s\(\d\.\)]|$)/i;
const BANNER_HINTS = /(banner|hero|promo|campaign|splash|slider|carousel)/i;
const MARKETING_HINTS =
  /(deal|offer|promo|sale|discount|marketing|social|banner|hero|landing|advert|campaign)/i;
const BRAND_HINTS = /(brand|wordmark|official|storefront|poster|[-_\s]original|brand[-_\s]asset)/i;
const UI_HINTS = /(background|pattern|texture|placeholder|empty-state|spinner|loader|skeleton|hero-bg|^ui[-_\s])/i;
const BRAND_TOKEN_IN_NAME = /(^|[-_\s])(apple|samsung|oppo|vivo|xiaomi|redmi|poco|tecno|itel|infinix|huawei|honor|nokia|oneplus|google|pixel|anker|soundcore|beats|bose|jbl|sony|lg|tcl|hisense|hp|lenovo|dell|asus|acer|msi|toshiba|canon|nikon|gionee|realme)([-_\s]|$)/i;

function classifyFile(f) {
  const name = (f.name || '').toLowerCase();
  const path = (f.filePath || '').toLowerCase();
  const mime = (f.mimeType || '').toLowerCase();
  const size = f.size ?? 0;
  const w = f.width ?? 0;
  const h = f.height ?? 0;
  const isSvg =
    mime === 'image/svg+xml' ||
    name.toLowerCase().endsWith('.svg');
  const knownImgExt = /\.(webp|jpe?g|png|gif|avif|heic|bmp|tiff?|webp2?|ico|svg)$/i.test(
    name
  );
  const isImage =
    mime.startsWith('image/') ||
    (f.fileType ?? f.type) === 'image' ||
    knownImgExt;
  const knownNonImgExt = /\.(mp4|mov|avi|mkv|webm|mp3|wav|flac|pdf|doc|docx|xls|xlsx|zip|json|csv|txt|js|css|html)$/i.test(
    name
  );

  let assetType = 'UNKNOWN';
  let confidence = 'LOW';
  let reason = '';

  const isLogoName = LOGO_HINTS.test(name) || /\/logo\b/.test(path);
  const isBannerName = BANNER_HINTS.test(name);
  const isMarketingName = MARKETING_HINTS.test(name);
  const isIconName = STRONG_ICON_HINTS.test(name);
  const isBrandName = BRAND_HINTS.test(name);
  const isUiName = UI_HINTS.test(name);

  if (!isImage) {
    assetType = knownNonImgExt ? 'OTHER' : 'UNKNOWN';
    confidence = knownNonImgExt ? 'HIGH' : 'LOW';
    reason = knownNonImgExt
      ? `non-image asset (known ext: ${name}, mimeType: ${mime})`
      : `unable to confirm image type (mimeType empty, no recognized ext: ${name}, fileType=${
          f.fileType ?? f.type
        })`;
  } else if (isLogoName) {
    assetType = 'BRAND_LOGO';
    confidence = 'HIGH';
    reason = `name/path indicates logo (${name || path})`;
  } else if (
    (BRAND_TOKEN_IN_NAME.test(name) || /logo/i.test(name)) &&
    w > 0 &&
    h > 0 &&
    w < 800 &&
    h < 500 &&
    (Math.max(w, h) / Math.min(w, h) > 1.2 || /-original|logo/i.test(name))
  ) {
    assetType = 'BRAND_LOGO';
    confidence = 'MEDIUM';
    reason = `name carries known brand token or 'logo' substring, dimensions brand-graphic-sized (${w}x${h}): ${name}`;
  } else if (isSvg) {
    assetType = 'GLOBAL_ICON';
    confidence = 'HIGH';
    reason = `SVG asset — almost always a reusable icon/graphic (${name})`;
  } else if (isIconName && size < 80_000 && Math.max(w, h) <= 512) {
    assetType = 'GLOBAL_ICON';
    confidence = 'MEDIUM';
    reason = `small image (${w}x${h}, ${size}B) matching strong icon pattern: ${name}`;
  } else if (isBannerName && w >= 1200) {
    assetType = 'BANNER';
    confidence = 'HIGH';
    reason = `name indicates banner and wide dimensions ${w}x${h}`;
  } else if (isBannerName && isImage) {
    assetType = 'BANNER';
    confidence = 'MEDIUM';
    reason = `name indicates banner (${name}) but dimensions ${w}x${h} are not wide`;
  } else if (isMarketingName && isImage) {
    assetType = 'MARKETING_ASSET';
    confidence = 'MEDIUM';
    reason = `name matches marketing/deal/offer pattern: ${name}`;
  } else if (isBrandName && isImage) {
    assetType = 'BRAND_ASSET';
    confidence = 'MEDIUM';
    reason = `name matches brand-asset pattern: ${name}`;
  } else if (isUiName && isImage) {
    assetType = 'UI_ASSET';
    confidence = 'MEDIUM';
    reason = `name matches UI-asset pattern: ${name}`;
  } else if (
    isImage &&
    (w >= 400 && h >= 300)
  ) {
    assetType = 'PRODUCT_IMAGE';
    confidence = 'MEDIUM';
    reason = `image in project folder with plausible product dimensions (${w}x${h}, ${name})`;
  } else if (
    isImage &&
    w >= 144 &&
    h >= 144 &&
    /\(\d+\)\.(webp|jpe?g|png|avif)$/i.test(f.name || '')
  ) {
    assetType = 'PRODUCT_IMAGE';
    confidence = 'MEDIUM';
    reason = `small numbered variant (N) filename suggesting product-gallery thumbnail: ${name} (${w}x${h})`;
  } else if (
    isImage &&
    w >= 144 &&
    h >= 144 &&
    /[-_\s]medium|small|thumb|variant|v\d+[-_\s.]/i.test(f.name || '')
  ) {
    assetType = 'PRODUCT_IMAGE';
    confidence = 'LOW';
    reason = `variant/small/medium/thumb filename token + minimum ${w}x${h} dims suggests product-image variant: ${name}`;
  } else if (isImage && w >= 80 && h >= 80 && Math.abs(w - h) <= 20 && !isIconName) {
    assetType = 'PRODUCT_IMAGE';
    confidence = 'LOW';
    reason = `square-ish image (${w}x${h}) in project product folder with no icon/logo/banner signals: ${name}`;
  } else if (isImage) {
    assetType = 'UNKNOWN';
    reason = `image with no clear product/icon/banner/marketing evidence: ${name} (${w}x${h}, ${mime}, ${size}B)`;
  }

  if (assetType === 'UNKNOWN' && !reason) {
    reason = `insufficient evidence to classify: ${name || path}`;
  }

  return { assetType, classificationConfidence: confidence, classificationReason: reason };
}

function logicalGroupFor(assetType) {
  switch (assetType) {
    case 'PRODUCT_IMAGE':
      return 'products';
    case 'BRAND_LOGO':
    case 'BRAND_ASSET':
      return 'brands';
    case 'GLOBAL_ICON':
      return 'icons';
    case 'BANNER':
      return 'banners';
    case 'MARKETING_ASSET':
      return 'marketing';
    case 'UI_ASSET':
      return 'ui';
    case 'OTHER':
      return 'other';
    default:
      return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('DISCOVERING root folders...');
  let rootFolders = [];
  try {
    rootFolders = await listRootFolders();
  } catch (err) {
    console.error('DISCOVERY_FAILED', err.message);
    process.exit(2);
  }

  const found = PROJECT_FOLDERS.filter((f) => rootFolders.includes(f));
  const missing = PROJECT_FOLDERS.filter((f) => !rootFolders.includes(f));
  const other = rootFolders.filter((f) => !PROJECT_FOLDERS.includes(f));

  console.log(`PROJECT FOLDERS FOUND: ${found.length}/${PROJECT_FOLDERS.length}`);
  if (missing.length) {
    console.log('PROJECT FOLDERS NOT FOUND:');
    missing.forEach((m) => console.log(`  - ${m}`));
    console.error('STOP: missing project folders. Not proceeding to inventory.');
    process.exit(3);
  }
  if (other.length) {
    console.log('OTHER FOLDERS DETECTED (NOT part of this project, excluded):');
    other.forEach((o) => console.log(`  - ${o}`));
  }

  console.log('Building inventory...');
  const inventory = [];
  const paginationReport = [];
  let totalProjectFiles = 0;

  for (const folder of PROJECT_FOLDERS) {
    const rootPath = `/${folder}`;
    const allFolders = [rootPath, ...(await collectSubfolders(rootPath))];
    for (const fp of allFolders) {
      const { files, pagination } = await listFilesInFolder(fp);
      paginationReport.push(pagination);
      for (const f of files) {
        const { assetType, classificationConfidence, classificationReason } = classifyFile(f);
        inventory.push({
          fileId: f.fileId ?? '',
          name: f.name ?? '',
          filePath: f.filePath ?? '',
          url: f.url ?? '',
          fileType: f.fileType ?? (f.type ?? ''),
          mimeType: f.mimeType ?? '',
          size: f.size ?? 0,
          width: f.width ?? null,
          height: f.height ?? null,
          createdAt: f.createdAt ?? '',
          updatedAt: f.updatedAt ?? '',
          folder: fp,
          tags: f.tags ?? [],
          customMetadata: f.customMetadata ?? null,
          isPrivateFile: f.isPrivateFile ?? null,
          isPublished: f.isPublished ?? null,
          assetType,
          sourceFolder: folder,
          classificationConfidence,
          classificationReason,
          logicalGroup: logicalGroupFor(assetType),
        });
      }
      totalProjectFiles += files.length;
    }
    console.log(`  ${folder}: ${totalProjectFiles} project files so far`);
  }

  // Determinism: sort by filePath then fileId
  inventory.sort((a, b) =>
    (a.filePath || '').localeCompare(b.filePath || '') ||
    (a.fileId || '').localeCompare(b.fileId || '')
  );

  // Summary
  const byFolder = {};
  const byType = {};
  for (const r of inventory) {
    byFolder[r.sourceFolder] = (byFolder[r.sourceFolder] ?? 0) + 1;
    byType[r.assetType] = (byType[r.assetType] ?? 0) + 1;
  }

  // Duplicate candidates (metadata bases — no file hashing/downloads)
  // Bases:
  //   A. identical fileId — same asset listed >1 time (integrity concern)
  //   B. identical filePath — same path under 2+ fileIds (integrity concern)
  //   C. same name + size + dimensions — strong visual-duplicate signal
  //   D. same name (case-insensitive) in 2+ different source folders — cross-folder dup
  const allGroups = new Map();

  function addGroup(basis, key, arr) {
    if (arr.length > 1) {
      const k = basis + '::' + key;
      if (!allGroups.has(k)) {
        const ids = [...new Set(arr.map((r) => r.fileId))];
        allGroups.set(k, {
          duplicateGroupKey: key,
          duplicateBasis: basis,
          count: arr.length,
          fileIds: arr.map((r) => r.fileId).join('|'),
          filePaths: arr.map((r) => r.filePath).join('|'),
          names: arr.map((r) => r.name).join('|'),
          size: arr[0].size,
          width: arr[0].width,
          height: arr[0].height,
          _uniqueIds: ids.length,
        });
      }
    }
  }

  // A. by fileId
  const byFileId = new Map();
  for (const r of inventory) {
    if (!byFileId.has(r.fileId)) byFileId.set(r.fileId, []);
    byFileId.get(r.fileId).push(r);
  }
  for (const [k, arr] of byFileId) addGroup('identical fileId (same asset listed multiple times)', k, arr);

  const repeatedFileIds = [...byFileId.entries()]
    .filter(([, arr]) => arr.length > 1)
    .map(([fileId, arr]) => ({
      fileId,
      count: arr.length,
      filePaths: arr.map((r) => r.filePath).join('|'),
    }));

  // B. by filePath
  const byPath = new Map();
  for (const r of inventory) {
    if (!byPath.has(r.filePath)) byPath.set(r.filePath, []);
    byPath.get(r.filePath).push(r);
  }
  for (const [k, arr] of byPath) addGroup('identical filePath', k, arr);

  // C. name + size + dimensions
  const byNSD = new Map();
  for (const r of inventory) {
    const key = [r.size, r.width, r.height, r.name.toLowerCase()].join('|');
    if (!byNSD.has(key)) byNSD.set(key, []);
    byNSD.get(key).push(r);
  }
  for (const [k, arr] of byNSD) addGroup('same name + size + dimensions', k, arr);

  // D. same name in 2+ sourceFolders
  const byNameFolders = new Map();
  for (const r of inventory) {
    const k = r.name.toLowerCase();
    if (!byNameFolders.has(k)) byNameFolders.set(k, []);
    byNameFolders.get(k).push(r);
  }
  for (const [k, arr] of byNameFolders) {
    const folders = new Set(arr.map((r) => r.sourceFolder));
    if (folders.size > 1) {
      addGroup(`same filename in ${folders.size} different source folders`, k, arr);
    }
  }

  const duplicateCandidates = [...allGroups.values()].sort((a, b) =>
    a.duplicateGroupKey.localeCompare(b.duplicateGroupKey) ||
    a.duplicateBasis.localeCompare(b.duplicateBasis)
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    source: 'ImageKit Media Library API v2 (read-only)',
    imagekitUrlEndpoint: URL_ENDPOINT,
    projectFoldersExpected: PROJECT_FOLDERS.length,
    projectFoldersFound: found,
    projectFoldersNotFound: missing,
    otherFoldersDetected: other,
    totalProjectFiles: totalProjectFiles,
    totalProjectAssets: inventory.length,
    assetsPerFolder: byFolder,
    assetsByAssetType: byType,
    counts: {
      PRODUCT_IMAGE: byType['PRODUCT_IMAGE'] ?? 0,
      BRAND_LOGO: byType['BRAND_LOGO'] ?? 0,
      BRAND_ASSET: byType['BRAND_ASSET'] ?? 0,
      GLOBAL_ICON: byType['GLOBAL_ICON'] ?? 0,
      UI_ASSET: byType['UI_ASSET'] ?? 0,
      BANNER: byType['BANNER'] ?? 0,
      MARKETING_ASSET: byType['MARKETING_ASSET'] ?? 0,
      OTHER: byType['OTHER'] ?? 0,
      UNKNOWN: byType['UNKNOWN'] ?? 0,
    },
    brandAssetTotal: (byType['BRAND_LOGO'] ?? 0) + (byType['BRAND_ASSET'] ?? 0),
    cdnUrlCount: inventory.filter((r) => r.url).length,
    paginationStatus: {
      pages: paginationReport.length,
      foldersPaged: paginationReport.filter((p) => p.pages > 1).length,
      anyIncomplete: paginationReport.some((p) => !p.complete || p.error),
      errors: paginationReport.filter((p) => p.error),
    },
    duplicateCandidates: {
      groups: duplicateCandidates.length,
      repeatedFileIds: repeatedFileIds.length,
    },
    apiErrors: API_ERRORS,
  };

  // Write outputs
  writeFileSync(join(DATA_DIR, 'imagekit-inventory.json'), JSON.stringify(inventory, null, 2));
  writeFileSync(
    join(DATA_DIR, 'imagekit-inventory.csv'),
    toCsv(inventory, [
      'fileId', 'name', 'filePath', 'url', 'fileType', 'mimeType', 'size',
      'width', 'height', 'createdAt', 'updatedAt', 'folder', 'assetType',
      'sourceFolder', 'classificationConfidence', 'classificationReason', 'logicalGroup',
    ])
  );
  writeFileSync(join(DATA_DIR, 'imagekit-asset-summary.json'), JSON.stringify(summary, null, 2));
  writeFileSync(
    join(DATA_DIR, 'imagekit-duplicate-candidates.csv'),
    toCsv(duplicateCandidates, [
      'duplicateGroupKey', 'duplicateBasis', 'count', 'fileIds', 'filePaths', 'names', 'size', 'width', 'height',
    ])
  );

  console.log('\n=== DONE ===');
  console.log(`PROJECT FOLDERS FOUND: ${found.length}`);
  console.log(`PROJECT FOLDERS NOT FOUND: ${missing.length}`);
  console.log(`OTHER FOLDERS DETECTED: ${other.length}`);
  console.log(`TOTAL PROJECT FILES: ${totalProjectFiles}`);
  console.log(`Assets by type: ${JSON.stringify(byType)}`);
  console.log(`Duplicate candidate groups: ${duplicateCandidates.length}`);
  console.log(`Repeated fileIds: ${repeatedFileIds.length}`);
  console.log(`API errors: ${API_ERRORS.length}`);
  console.log('Files written:');
  console.log('  data/imagekit-inventory.json');
  console.log('  data/imagekit-inventory.csv');
  console.log('  data/imagekit-asset-summary.json');
  console.log('  data/imagekit-duplicate-candidates.csv');
}

function toCsv(rows, cols) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const header = cols.join(',');
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(','));
  return [header, ...lines].join('\n');
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});