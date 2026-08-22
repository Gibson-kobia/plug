import fs from "node:fs";
import path from "node:path";

const ENV_FILE = ".env.local";

function loadEnv(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`${file} not found`);
  }

  const env = {};

  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const env = loadEnv(ENV_FILE);

const PRIVATE_KEY = env.IMAGEKIT_PRIVATE_KEY;
const ENDPOINT = env.IMAGEKIT_URL_ENDPOINT;

if (!PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is missing from .env.local");
}

if (!ENDPOINT) {
  throw new Error("IMAGEKIT_URL_ENDPOINT is missing from .env.local");
}

const API_BASE = "https://api.imagekit.io/v1/files";

const PROJECT_FOLDERS = new Set([
  "airbuds",
  "airbuds2",
  "airbuds3",
  "airbuds4",
  "airbuds5",
  "gadgets",
  "Oppo",
  "Oppo2",
  "Oppo3",
  "Oppo4",
  "Oppo5",
  "Oppo6",
  "Bts",
  "itel",
  "tvs",
  "Sound Bars",
  "laptops1",
  "ecommerce",
]);

const CATEGORY_MAP = {
  airbuds: "Earbuds",
  airbuds2: "Earbuds",
  airbuds3: "Earbuds",
  airbuds4: "Earbuds",
  airbuds5: "Earbuds",
  gadgets: "Gadgets",
  Oppo: "Smartphones",
  Oppo2: "Smartphones",
  Oppo3: "Smartphones",
  Oppo4: "Smartphones",
  Oppo5: "Smartphones",
  Oppo6: "Smartphones",
  Bts: "Other",
  itel: "Smartphones",
  tvs: "Televisions",
  "Sound Bars": "Sound Bars",
  laptops1: "Laptops",
  ecommerce: "Ecommerce Assets",
};

const auth = "Basic " + Buffer.from(`${PRIVATE_KEY}:`).toString("base64");

async function fetchPage(skip) {
  const url = new URL(API_BASE);

  url.searchParams.set("fileType", "all");
  url.searchParams.set("limit", "1000");
  url.searchParams.set("skip", String(skip));

  const response = await fetch(url, {
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`ImageKit API ${response.status}: ${text.slice(0, 500)}`);
  }

  return JSON.parse(text);
}

function getRootFolder(filePath) {
  if (!filePath) return null;

  const cleaned = filePath.replace(/^\/+/, "");
  const firstSlash = cleaned.indexOf("/");

  if (firstSlash === -1) {
    return null;
  }

  return cleaned.slice(0, firstSlash);
}

function csvEscape(value) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function cleanName(filename) {
  if (!filename) return "";

  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectBrand(folder, filename) {
  const lower = `${folder} ${filename}`.toLowerCase();

  if (lower.includes("oppo")) return "OPPO";
  if (lower.includes("itel")) return "itel";
  if (lower.includes("apple") || lower.includes("airpods")) return "Apple";
  if (lower.includes("samsung") || lower.includes("galaxy")) return "Samsung";
  if (lower.includes("jbl")) return "JBL";
  if (lower.includes("anker") || lower.includes("soundcore")) return "Anker Soundcore";
  if (lower.includes("oneplus")) return "OnePlus";
  if (lower.includes("sony")) return "Sony";
  if (lower.includes("huawei")) return "Huawei";
  if (lower.includes("nothing")) return "Nothing";
  if (lower.includes("xiaomi") || lower.includes("redmi")) return "Xiaomi";
  if (lower.includes("google") || lower.includes("pixel")) return "Google";

  return "";
}

async function main() {
  console.log("");
  console.log("==============================================");
  console.log(" IMAGEKIT ASSET EXPORT");
  console.log("==============================================");
  console.log("");
  console.log("Reading ImageKit...");
  console.log("No files will be downloaded or modified.");
  console.log("");

  const allFiles = [];
  let skip = 0;
  let pageNumber = 0;

  while (true) {
    pageNumber++;

    console.log(`Fetching page ${pageNumber} (skip ${skip})...`);

    const page = await fetchPage(skip);

    if (!Array.isArray(page)) {
      throw new Error("Unexpected ImageKit API response.");
    }

    console.log(`  Received ${page.length} records`);

    allFiles.push(...page);

    if (page.length < 1000) {
      break;
    }

    skip += 1000;
  }

  console.log("");
  console.log(`Total records received: ${allFiles.length}`);

  const projectFiles = [];

  for (const file of allFiles) {
    if (!file || file.type === "folder") continue;

    const rootFolder = getRootFolder(file.filePath);

    if (!PROJECT_FOLDERS.has(rootFolder)) continue;

    const filename = file.name || path.basename(file.filePath || "");

    const category = CATEGORY_MAP[rootFolder] || "Other";

    const record = {
      id: file.fileId || "",
      name: cleanName(filename),
      filename,
      brand: detectBrand(rootFolder, filename),
      category,
      sourceFolder: rootFolder,
      filePath: file.filePath || "",
      url: file.url || "",
      fileType: file.fileType || "",
      mimeType: file.mimeType || "",
      size: file.size ?? "",
      width: file.width ?? "",
      height: file.height ?? "",
      createdAt: file.createdAt || "",
      updatedAt: file.updatedAt || "",
      tags: Array.isArray(file.tags) ? file.tags.join("|") : "",
    };

    projectFiles.push(record);
  }

  projectFiles.sort((a, b) =>
    a.filePath.localeCompare(b.filePath)
  );

  const outputDir = path.join("data");

  fs.mkdirSync(outputDir, { recursive: true });

  const jsonPath = path.join(outputDir, "imagekit-products.json");
  const csvPath = path.join(outputDir, "imagekit-products.csv");
  const allAssetsPath = path.join(outputDir, "imagekit-assets.csv");

  /*
   * Product-focused JSON
   */
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(projectFiles, null, 2),
    "utf8"
  );

  /*
   * Product-focused CSV
   */
  const columns = [
    "id",
    "name",
    "filename",
    "brand",
    "category",
    "sourceFolder",
    "filePath",
    "url",
    "fileType",
    "mimeType",
    "size",
    "width",
    "height",
    "createdAt",
    "updatedAt",
    "tags",
  ];

  const csv = [
    columns.join(","),
    ...projectFiles.map((record) =>
      columns.map((column) => csvEscape(record[column])).join(",")
    ),
  ].join("\n");

  fs.writeFileSync(csvPath, csv, "utf8");

  /*
   * Full asset CSV.
   * This intentionally contains the same project assets,
   * including icons, logos, banners and other assets.
   */
  fs.writeFileSync(allAssetsPath, csv, "utf8");

  /*
   * Summary
   */
  const byFolder = {};

  for (const file of projectFiles) {
    byFolder[file.sourceFolder] =
      (byFolder[file.sourceFolder] || 0) + 1;
  }

  const summaryPath = path.join(
    outputDir,
    "imagekit-export-summary.json"
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    totalImageKitRecordsScanned: allFiles.length,
    totalProjectAssets: projectFiles.length,
    totalCdnUrls: projectFiles.filter((x) => x.url).length,
    pagesFetched: pageNumber,
    folders: byFolder,
  };

  fs.writeFileSync(
    summaryPath,
    JSON.stringify(summary, null, 2),
    "utf8"
  );

  console.log("");
  console.log("==============================================");
  console.log(" EXPORT COMPLETE");
  console.log("==============================================");
  console.log("");
  console.log(`ImageKit records scanned : ${allFiles.length}`);
  console.log(`Project assets           : ${projectFiles.length}`);
  console.log(`CDN URLs                 : ${projectFiles.filter(x => x.url).length}`);
  console.log(`API pages fetched        : ${pageNumber}`);
  console.log("");

  console.log("Assets by folder:");

  for (const folder of PROJECT_FOLDERS) {
    console.log(
      `  ${folder}: ${byFolder[folder] || 0}`
    );
  }

  console.log("");
  console.log("Created:");
  console.log(`  ${jsonPath}`);
  console.log(`  ${csvPath}`);
  console.log(`  ${allAssetsPath}`);
  console.log(`  ${summaryPath}`);
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error("EXPORT FAILED");
  console.error(error.message);
  console.error("");
  process.exit(1);
});