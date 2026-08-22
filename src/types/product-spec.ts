/**
 * Product Specification & Variant System
 * Strict typed model for Kenyan electronics marketplace
 */

export type ProductCondition =
  | 'brand_new_sealed'
  | 'open_box'
  | 'like_new'
  | 'good'
  | 'fair'
  | 'refurbished'
  | 'display';

export type VerificationStatus = 'verified' | 'unverified' | 'pending_review' | 'rejected';
export type PriceConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export interface HardwareSpecs {
  processor?: string | undefined;
  chipset?: string | undefined;
  cpu?: string | undefined;
  gpu?: string | undefined;
  ramGb?: number | undefined;
  ramType?: string | undefined; // e.g. LPDDR5, DDR4, Unified
  ramSpeedMhz?: number | undefined;
  ramUpgradeable?: boolean | undefined;
  storageGb?: number | undefined;
  storageType?: 'SSD' | 'eMMC' | 'NVMe' | 'UFS 2.1' | 'UFS 2.2' | 'UFS 3.1' | 'UFS 4.0' | 'HDD' | string | undefined;
  storageInterface?: string | undefined;
  storageUpgradeable?: boolean | undefined;
  expandableStorage?: boolean | undefined;
  expandableStorageType?: string | undefined; // e.g. microSD up to 1TB
  screenSizeInches?: number | undefined;
  resolution?: string | undefined; // e.g. 2796 x 1290 pixels
  refreshRateHz?: number | undefined; // e.g. 60, 90, 120, 144
  panelType?: 'OLED' | 'AMOLED' | 'Super AMOLED' | 'Super Retina XDR' | 'IPS LCD' | 'Mini-LED' | 'VA' | 'TN' | string | undefined;
  batteryCapacityMah?: number | undefined;
  chargingWattage?: number | undefined;
  wirelessCharging?: boolean | undefined;
  operatingSystem?: string | undefined; // e.g. iOS 17, Android 14, Windows 11 Pro, macOS Sonoma
}

export interface PhoneSpecs extends HardwareSpecs {
  simConfiguration?: 'Single SIM' | 'Dual Physical SIM' | 'Physical SIM + eSIM' | 'Dual eSIM' | undefined;
  hasEsim?: boolean | undefined;
  networkSupport?: string[] | undefined; // e.g. ['2G', '3G', '4G LTE', '5G']
  is5g?: boolean | undefined;
  rearCameraSetup?: string | undefined; // e.g. 48MP Main + 12MP Ultra-wide + 12MP 5x Telephoto
  frontCameraSetup?: string | undefined; // e.g. 12MP TrueDepth
  videoRecordingMax?: string | undefined; // e.g. 4K at 60fps
  biometricSecurity?: string[] | undefined; // e.g. ['Face ID', 'Under-display Fingerprint']
  waterResistanceRating?: string | undefined; // e.g. IP68
}

export interface LaptopSpecs extends HardwareSpecs {
  cpuGeneration?: string | undefined; // e.g. 13th Gen Intel Core, Apple M3 Pro, AMD Ryzen 7000
  cpuCores?: number | undefined;
  cpuThreads?: number | undefined;
  ports?: string[] | undefined; // e.g. ['2x Thunderbolt 4', '1x HDMI 2.1', '2x USB-A 3.2', 'SD Card Slot']
  keyboardLayout?: string | undefined; // e.g. Backlit English US
  weightKg?: number | undefined;
  webcamResolution?: string | undefined; // e.g. 1080p FHD
}

export interface TabletSpecs extends HardwareSpecs {
  cellularSupport?: boolean | undefined;
  simType?: 'Wi-Fi Only' | 'eSIM' | 'Nano-SIM' | undefined;
  stylusSupport?: boolean | undefined;
  stylusIncluded?: boolean | undefined;
  keyboardSupport?: boolean | undefined;
}

export interface CommercialInfo {
  kenyanRetailPriceKes?: number | undefined;
  observedPriceMinKes?: number | undefined;
  observedPriceMaxKes?: number | undefined;
  currency: 'KES';
  priceSource?: string | undefined; // e.g. PhonePlace Kenya, Safaricom Shop, Avechi
  priceSourceUrl?: string | undefined;
  priceVerificationDate?: string | undefined;
  warrantyType?: 'Official Brand Warranty' | 'Merchant Shop Warranty' | 'No Warranty' | undefined;
  warrantyDurationMonths?: number | undefined;
}

export interface TrustProvenance {
  source: string;
  sourceUrl?: string | undefined;
  sourceType: 'manufacturer_spec' | 'kenyan_retailer_catalog' | 'seller_attestation' | 'unverified';
  verificationStatus: VerificationStatus;
  verificationTimestamp?: string | undefined;
  confidenceLevel: PriceConfidence;
}

export interface ProductVariant {
  sku: string;
  variantName: string; // e.g. "128GB / 6GB RAM - Space Black (eSIM)"
  storageGb?: number | undefined;
  ramGb?: number | undefined;
  color?: string | undefined;
  simType?: string | undefined;
  priceKes?: number | undefined;
  stockCount: number;
  condition: ProductCondition;
  isAvailable: boolean;
}

export interface EnrichedProductSpec {
  productId: string;
  brand: string | null;
  model: string | null;
  modelNumber?: string | undefined;
  productFamily?: string | undefined;
  category: string;
  subcategory?: string | undefined;
  title: string;
  shortDescription?: string | undefined;
  fullDescription?: string | undefined;
  primaryImage: string;
  images: Array<{ id: string; url: string; alt?: string | undefined }>;
  hardware: HardwareSpecs;
  phoneDetails?: PhoneSpecs | undefined;
  laptopDetails?: LaptopSpecs | undefined;
  tabletDetails?: TabletSpecs | undefined;
  condition: ProductCondition;
  commercial: CommercialInfo;
  trust: TrustProvenance;
  variants: ProductVariant[];
  rawSpecs?: Record<string, any> | undefined;
}

export interface LeadRecord {
  id: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  sellerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  source: 'whatsapp_pdp' | 'whatsapp_cart' | 'reserve_click' | 'buy_now_click' | 'price_inquiry' | 'seller_contact' | 'direct_call';
  campaign?: string;
  status: 'new' | 'contacted' | 'negotiating' | 'payment_pending' | 'converted' | 'lost' | 'cancelled';
  estimatedValueKes?: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeviceTrustData {
  id?: string;
  listingId: string;
  productId?: string;
  imei1?: string;
  imei2?: string;
  serialNumber?: string;
  modelNumber?: string;
  batteryHealthPercentage?: number;
  activationLockStatus: 'unlocked' | 'icloud_locked' | 'google_frp_locked' | 'knox_finance_locked' | 'network_sim_locked' | 'unknown';
  financeLockDeclared: boolean;
  proofOfPurchaseUrl?: string;
  trustLevel: 'seller_entered' | 'document_verified' | 'external_database_verified' | 'not_verified';
  verifiedBy?: string;
  verifiedAt?: string;
  moderatorNotes?: string;
}
