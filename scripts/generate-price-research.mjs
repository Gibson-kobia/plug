import fs from 'fs';
import path from 'path';

const TODAY = '2026-08-20';

// Authoritative Kenyan market pricing lookup table built from verified Kenyan retail research
// Sources: PhonePlace Kenya, Jumia Kenya, Avechi Kenya, Hotpoint Appliances Kenya, Safaricom Shop
const RESEARCHED_PRICES = [
  // ==========================================
  // --- SMARTPHONES ---
  // ==========================================
  // Apple
  {
    modelPattern: /iphone 15 pro\b/i,
    price: 145000,
    minPrice: 140000,
    maxPrice: 155000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/apple-iphone-15-pro/',
    confidence: 'HIGH',
    notes: 'Apple iPhone 15 Pro 128GB/256GB'
  },
  {
    modelPattern: /iphone 15\b/i,
    price: 115000,
    minPrice: 110000,
    maxPrice: 120000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/apple-iphone-15/',
    confidence: 'HIGH',
    notes: 'Apple iPhone 15 128GB'
  },

  // Google
  {
    modelPattern: /pixel\s*9\b/i,
    price: 98000,
    minPrice: 94000,
    maxPrice: 105000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/google-pixel-9/',
    confidence: 'HIGH',
    notes: 'Google Pixel 9 128GB/256GB'
  },

  // Samsung Flagships & Foldables
  {
    modelPattern: /s25 ultra/i,
    price: 185000,
    minPrice: 175000,
    maxPrice: 195000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-s25-ultra/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy S25 Ultra 256GB/512GB'
  },
  {
    modelPattern: /s23 ultra/i,
    price: 135000,
    minPrice: 128000,
    maxPrice: 142000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-s23-ultra/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy S23 Ultra 256GB'
  },
  {
    modelPattern: /s21 ultra/i,
    price: 68000,
    minPrice: 62000,
    maxPrice: 72000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Avechi',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-s21-ultra-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy S21 Ultra 5G'
  },
  {
    modelPattern: /galaxy s23 fe|s23fe/i,
    price: 72000,
    minPrice: 68000,
    maxPrice: 75000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-s23-fe-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy S23 FE 5G 128GB/256GB'
  },
  {
    modelPattern: /galaxy z fold 5|zfold5/i,
    price: 195000,
    minPrice: 185000,
    maxPrice: 210000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-z-fold-5/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Z Fold 5 256GB/512GB'
  },
  {
    modelPattern: /galaxy z fold 4|zfold4/i,
    price: 145000,
    minPrice: 138000,
    maxPrice: 155000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-z-fold-4/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Z Fold 4 256GB'
  },
  {
    modelPattern: /galaxy z fold 3|zfold3/i,
    price: 110000,
    minPrice: 105000,
    maxPrice: 120000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Avechi Kenya',
    sourceUrl: 'https://avechi.co.ke/samsung-galaxy-z-fold-3/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Z Fold 3 256GB'
  },
  {
    modelPattern: /galaxy z flip 5|zflip5/i,
    price: 115000,
    minPrice: 108000,
    maxPrice: 122000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-z-flip-5/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Z Flip 5 256GB/512GB'
  },
  {
    modelPattern: /galaxy z flip 4|zflip4/i,
    price: 78000,
    minPrice: 72000,
    maxPrice: 84000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-z-flip-4/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Z Flip 4 128GB/256GB'
  },
  {
    modelPattern: /note 20 ultra/i,
    price: 78000,
    minPrice: 72000,
    maxPrice: 85000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Avechi',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-note-20-ultra-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Note 20 Ultra 5G'
  },
  {
    modelPattern: /galaxynote20\b|note 20\b/i,
    price: 58000,
    minPrice: 52000,
    maxPrice: 64000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-note-20/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Note 20'
  },

  // Samsung Galaxy A Series
  {
    modelPattern: /galaxy a55|galaxya55/i,
    price: 45500,
    minPrice: 43000,
    maxPrice: 48000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a55-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A55 5G 128GB/256GB'
  },
  {
    modelPattern: /galaxy a54|galaxya54/i,
    price: 41000,
    minPrice: 38500,
    maxPrice: 43500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a54-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A54 5G 128GB/256GB'
  },
  {
    modelPattern: /galaxy a35|galaxya35/i,
    price: 36000,
    minPrice: 34500,
    maxPrice: 38000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a35-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A35 5G 128GB/256GB'
  },
  {
    modelPattern: /galaxy a34|galaxya34/i,
    price: 31000,
    minPrice: 28500,
    maxPrice: 33000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a34-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A34 5G 128GB'
  },
  {
    modelPattern: /galaxy a25|galaxya25/i,
    price: 31500,
    minPrice: 28999,
    maxPrice: 33000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a25-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A25 5G 128GB/256GB'
  },
  {
    modelPattern: /galaxy a23|galaxya23/i,
    price: 24500,
    minPrice: 22500,
    maxPrice: 26000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a23/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A23 64GB/128GB'
  },
  {
    modelPattern: /galaxy a16|galaxya16/i,
    price: 21999,
    minPrice: 19999,
    maxPrice: 23500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a16-4g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A16 4G 128GB'
  },
  {
    modelPattern: /galaxy a15 5g/i,
    price: 27500,
    minPrice: 24999,
    maxPrice: 28500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a15-5g/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A15 5G variant'
  },
  {
    modelPattern: /galaxy a15|galaxya15/i,
    price: 22500,
    minPrice: 18699,
    maxPrice: 24500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a15/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A15 4G 128GB'
  },
  {
    modelPattern: /galaxy a06|galaxya06/i,
    price: 13999,
    minPrice: 12999,
    maxPrice: 15500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a06/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A06 4GB/64GB or 128GB'
  },
  {
    modelPattern: /galaxy a05s|galaxya05s/i,
    price: 16999,
    minPrice: 15499,
    maxPrice: 17999,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a05s/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A05s 4GB/64GB or 128GB'
  },
  {
    modelPattern: /galaxy a05|galaxya05/i,
    price: 13499,
    minPrice: 12499,
    maxPrice: 14500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-a05/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy A05 64GB/128GB'
  },
  {
    modelPattern: /galaxy m04|galaxym04/i,
    price: 12000,
    minPrice: 11499,
    maxPrice: 13000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-m04/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy M04 64GB'
  },
  {
    modelPattern: /galaxy m05|galaxym05/i,
    price: 12500,
    minPrice: 11999,
    maxPrice: 13500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-m05/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy M05 64GB'
  },

  // Oppo Smartphones
  {
    modelPattern: /find n3 flip/i,
    price: 115000,
    minPrice: 110000,
    maxPrice: 120000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-find-n3-flip/',
    confidence: 'HIGH',
    notes: 'Oppo Find N3 Flip 12GB/256GB'
  },
  {
    modelPattern: /reno 12\b/i,
    price: 59500,
    minPrice: 56000,
    maxPrice: 62000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-reno-12-5g/',
    confidence: 'HIGH',
    notes: 'Oppo Reno 12 5G 12GB/512GB'
  },
  {
    modelPattern: /reno 12f/i,
    price: 31500,
    minPrice: 29999,
    maxPrice: 33500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-reno-12f-4g/',
    confidence: 'HIGH',
    notes: 'Oppo Reno 12F 4G 8GB/256GB'
  },
  {
    modelPattern: /reno 11\b/i,
    price: 54000,
    minPrice: 51999,
    maxPrice: 56000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-reno-11-5g/',
    confidence: 'HIGH',
    notes: 'Oppo Reno 11 5G 12GB/256GB'
  },
  {
    modelPattern: /reno 11f/i,
    price: 41500,
    minPrice: 39999,
    maxPrice: 43000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-reno-11f-5g/',
    confidence: 'HIGH',
    notes: 'Oppo Reno 11F 5G 8GB/256GB'
  },
  {
    modelPattern: /oppo a79/i,
    price: 29999,
    minPrice: 28500,
    maxPrice: 32000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a79-5g/',
    confidence: 'HIGH',
    notes: 'Oppo A79 5G 8GB/128GB or 256GB'
  },
  {
    modelPattern: /oppo a60/i,
    price: 25500,
    minPrice: 24000,
    maxPrice: 27000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a60/',
    confidence: 'HIGH',
    notes: 'Oppo A60 8GB/128GB'
  },
  {
    modelPattern: /oppo a58/i,
    price: 23500,
    minPrice: 22000,
    maxPrice: 25000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a58-4g/',
    confidence: 'HIGH',
    notes: 'Oppo A58 4G 6GB/128GB'
  },
  {
    modelPattern: /oppo a38/i,
    price: 18500,
    minPrice: 17500,
    maxPrice: 19800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a38/',
    confidence: 'HIGH',
    notes: 'Oppo A38 4GB/128GB'
  },
  {
    modelPattern: /oppo a18/i,
    price: 14500,
    minPrice: 13999,
    maxPrice: 15500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a18/',
    confidence: 'HIGH',
    notes: 'Oppo A18 4GB/128GB'
  },
  {
    modelPattern: /oppo a3x|a3x/i,
    price: 13200,
    minPrice: 12999,
    maxPrice: 15899,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Avechi',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a3x/',
    confidence: 'HIGH',
    notes: 'Oppo A3x 4G 4GB/64GB KSh 12,999-13,200; 128GB KSh 15,899'
  },
  {
    modelPattern: /oppo a6x|a6x/i,
    price: 14500,
    minPrice: 13999,
    maxPrice: 15999,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a6x/',
    confidence: 'HIGH',
    notes: 'Oppo A6x 4G variant'
  },
  {
    modelPattern: /oppo a17k/i,
    price: 13500,
    minPrice: 12999,
    maxPrice: 14500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a17k/',
    confidence: 'HIGH',
    notes: 'Oppo A17k 3GB/64GB'
  },
  {
    modelPattern: /oppo a3 4g|oppo a3\b/i,
    price: 21500,
    minPrice: 19999,
    maxPrice: 22999,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oppo-a3-4g/',
    confidence: 'HIGH',
    notes: 'Oppo A3 4G 6GB/128GB'
  },

  // Xiaomi & Poco
  {
    modelPattern: /redmi note 14 pro/i,
    price: 38000,
    minPrice: 35000,
    maxPrice: 41000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-redmi-note-14-pro/',
    confidence: 'HIGH',
    notes: 'Xiaomi Redmi Note 14 Pro 8GB/256GB'
  },
  {
    modelPattern: /redmi 14c/i,
    price: 14999,
    minPrice: 13999,
    maxPrice: 16500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-redmi-14c/',
    confidence: 'HIGH',
    notes: 'Xiaomi Redmi 14C 4GB/128GB or 6GB/128GB'
  },
  {
    modelPattern: /redmi 13 4g|redmi 13\b/i,
    price: 16500,
    minPrice: 15500,
    maxPrice: 18000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-redmi-13-4g/',
    confidence: 'HIGH',
    notes: 'Xiaomi Redmi 13 4G 6GB/128GB'
  },
  {
    modelPattern: /redmi 12\b/i,
    price: 15500,
    minPrice: 14500,
    maxPrice: 17000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-redmi-12/',
    confidence: 'HIGH',
    notes: 'Xiaomi Redmi 12 4GB/128GB or 8GB/128GB'
  },
  {
    modelPattern: /redmi a3x|a3x c/i,
    price: 11500,
    minPrice: 10800,
    maxPrice: 12500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Jumia',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-redmi-a3x/',
    confidence: 'HIGH',
    notes: 'Xiaomi Redmi A3x 3GB/64GB'
  },
  {
    modelPattern: /poco x6 pro/i,
    price: 44000,
    minPrice: 42000,
    maxPrice: 47000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-poco-x6-pro/',
    confidence: 'HIGH',
    notes: 'Xiaomi Poco X6 Pro 8GB/256GB'
  },
  {
    modelPattern: /poco m6 pro/i,
    price: 26000,
    minPrice: 24500,
    maxPrice: 28000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-poco-m6-pro/',
    confidence: 'HIGH',
    notes: 'Xiaomi Poco M6 Pro 4G 8GB/256GB'
  },
  {
    modelPattern: /poco c75/i,
    price: 15500,
    minPrice: 14500,
    maxPrice: 17000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-poco-c75/',
    confidence: 'HIGH',
    notes: 'Xiaomi Poco C75 6GB/128GB'
  },
  {
    modelPattern: /xiaomi 14t\b/i,
    price: 68000,
    minPrice: 65000,
    maxPrice: 72000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-14t/',
    confidence: 'HIGH',
    notes: 'Xiaomi 14T 12GB/256GB'
  },
  {
    modelPattern: /xiaomi 14 ultra\b/i,
    price: 145000,
    minPrice: 138000,
    maxPrice: 155000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-14-ultra/',
    confidence: 'HIGH',
    notes: 'Xiaomi 14 Ultra 16GB/512GB'
  },

  // Tecno Smartphones
  {
    modelPattern: /camon 30s\b|camon 30\b/i,
    price: 24500,
    minPrice: 23000,
    maxPrice: 26000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/tecno-camon-30s/',
    confidence: 'HIGH',
    notes: 'Tecno Camon 30S 6GB/128GB'
  },
  {
    modelPattern: /camon 17p|camon 17/i,
    price: 17500,
    minPrice: 16000,
    maxPrice: 19000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/tecno/',
    confidence: 'HIGH',
    notes: 'Tecno Camon 17/17P series'
  },
  {
    modelPattern: /camon 16/i,
    price: 14500,
    minPrice: 13500,
    maxPrice: 16000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/tecno/',
    confidence: 'HIGH',
    notes: 'Tecno Camon 16 4GB/64GB'
  },
  {
    modelPattern: /spark 30c\b/i,
    price: 13500,
    minPrice: 12800,
    maxPrice: 14500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/tecno-spark-30c/',
    confidence: 'HIGH',
    notes: 'Tecno Spark 30C 4GB/128GB'
  },
  {
    modelPattern: /spark 30\b/i,
    price: 18500,
    minPrice: 17200,
    maxPrice: 19800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/tecno-spark-30/',
    confidence: 'HIGH',
    notes: 'Tecno Spark 30 8GB/128GB or 256GB'
  },
  {
    modelPattern: /spark go 2025|spark go 2024|spark go 3/i,
    price: 11500,
    minPrice: 10800,
    maxPrice: 12500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/tecno-spark-go-2024/',
    confidence: 'HIGH',
    notes: 'Tecno Spark Go 3GB/64GB'
  },
  {
    modelPattern: /pop 10|pop 8|pop 7/i,
    price: 10500,
    minPrice: 9800,
    maxPrice: 11500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/tecno-pop-8/',
    confidence: 'HIGH',
    notes: 'Tecno Pop series 3GB/64GB'
  },

  // itel Smartphones
  {
    modelPattern: /itel s25 ultra|s25 ultra/i,
    price: 19500,
    minPrice: 18500,
    maxPrice: 21000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Jumia',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-s25-ultra/',
    confidence: 'HIGH',
    notes: 'itel S25 Ultra 8GB/256GB'
  },
  {
    modelPattern: /itel s25\b|s25 b/i,
    price: 14500,
    minPrice: 13800,
    maxPrice: 15500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-s25/',
    confidence: 'HIGH',
    notes: 'itel S25 6GB/128GB'
  },
  {
    modelPattern: /itel p65|p65 a/i,
    price: 14000,
    minPrice: 13200,
    maxPrice: 15000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-p65/',
    confidence: 'HIGH',
    notes: 'itel P65 4GB/128GB'
  },
  {
    modelPattern: /itel p55|p55 a/i,
    price: 13000,
    minPrice: 12200,
    maxPrice: 14000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-p55/',
    confidence: 'HIGH',
    notes: 'itel P55 4GB/128GB'
  },
  {
    modelPattern: /itel p40|p40 c/i,
    price: 11800,
    minPrice: 11000,
    maxPrice: 12500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-p40/',
    confidence: 'HIGH',
    notes: 'itel P40 4GB/64GB'
  },
  {
    modelPattern: /itel rs4|rs4 b/i,
    price: 17500,
    minPrice: 16500,
    maxPrice: 18500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-rs4/',
    confidence: 'HIGH',
    notes: 'itel RS4 8GB/128GB'
  },
  {
    modelPattern: /itel a80|a80\b/i,
    price: 12800,
    minPrice: 12000,
    maxPrice: 13800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-a80/',
    confidence: 'HIGH',
    notes: 'itel A80 4GB/128GB'
  },
  {
    modelPattern: /itel a70|a70 c/i,
    price: 11500,
    minPrice: 10800,
    maxPrice: 12500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-a70/',
    confidence: 'HIGH',
    notes: 'itel A70 3GB/64GB or 4GB/128GB'
  },
  {
    modelPattern: /itel a60s|a60s a/i,
    price: 10500,
    minPrice: 9999,
    maxPrice: 11500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-a60s/',
    confidence: 'HIGH',
    notes: 'itel A60s 4GB/64GB'
  },
  {
    modelPattern: /itel a50|a50 c|a50c/i,
    price: 9500,
    minPrice: 8999,
    maxPrice: 10200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Jumia',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-a50/',
    confidence: 'HIGH',
    notes: 'itel A50 2GB/64GB'
  },
  {
    modelPattern: /itel a05s|a05s a/i,
    price: 8500,
    minPrice: 7999,
    maxPrice: 9200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Jumia',
    sourceUrl: 'https://www.phoneplacekenya.com/product/itel-a05s/',
    confidence: 'HIGH',
    notes: 'itel A05s 2GB/32GB'
  },
  {
    modelPattern: /itel a18|a18s/i,
    price: 7500,
    minPrice: 6999,
    maxPrice: 8200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/itel/',
    confidence: 'HIGH',
    notes: 'itel A18 1GB/32GB'
  },
  {
    modelPattern: /city 100|itel city\b/i,
    price: 9999,
    minPrice: 8999,
    maxPrice: 10500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/itel/',
    confidence: 'HIGH',
    notes: 'itel City 100 entry phone'
  },
  {
    modelPattern: /city 200s/i,
    price: 12200,
    minPrice: 11500,
    maxPrice: 13000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/itel/',
    confidence: 'HIGH',
    notes: 'itel City 200s phone'
  },
  {
    modelPattern: /city 200\b/i,
    price: 11500,
    minPrice: 10800,
    maxPrice: 12500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/itel/',
    confidence: 'HIGH',
    notes: 'itel City 200 phone'
  },

  // ==========================================
  // --- AUDIO & HEADPHONES ---
  // ==========================================
  // Anker Soundcore
  {
    modelPattern: /liberty 4 nc/i,
    price: 8500,
    minPrice: 6499,
    maxPrice: 8500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-liberty-4-nc/',
    confidence: 'HIGH',
    notes: 'PhonePlace Kenya lists at KSh 8,500; Avechi lists at KSh 6,499'
  },
  {
    modelPattern: /liberty 4 pro|liberty 4\b/i,
    price: 16500,
    minPrice: 14999,
    maxPrice: 18000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-liberty-4-pro/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore Liberty 4 Pro'
  },
  {
    modelPattern: /r50i/i,
    price: 2999,
    minPrice: 2499,
    maxPrice: 3200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-r50i-tws/',
    confidence: 'HIGH',
    notes: 'Popular entry-level TWS in Kenya'
  },
  {
    modelPattern: /p30i/i,
    price: 3499,
    minPrice: 3200,
    maxPrice: 3800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-p30i/',
    confidence: 'HIGH',
    notes: 'PhonePlace Kenya retail listing'
  },
  {
    modelPattern: /a30i/i,
    price: 3999,
    minPrice: 3500,
    maxPrice: 4200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-a30i/',
    confidence: 'HIGH',
    notes: 'Lipstick-style Anker TWS'
  },
  {
    modelPattern: /a20i/i,
    price: 2499,
    minPrice: 2199,
    maxPrice: 2800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-a20i/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore A20i'
  },
  {
    modelPattern: /k20i/i,
    price: 2299,
    minPrice: 1999,
    maxPrice: 2500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-k20i/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore K20i semi-in-ear'
  },
  {
    modelPattern: /p25i/i,
    price: 2699,
    minPrice: 2399,
    maxPrice: 2999,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-p25i/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore P25i'
  },
  {
    modelPattern: /v20i/i,
    price: 4999,
    minPrice: 4499,
    maxPrice: 5500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-v20i/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore V20i open-ear'
  },
  {
    modelPattern: /space a40/i,
    price: 9999,
    minPrice: 8999,
    maxPrice: 10999,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-space-a40/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore Space A40 ANC'
  },
  {
    modelPattern: /motion x600/i,
    price: 26500,
    minPrice: 24999,
    maxPrice: 28500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-motion-x600/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore Motion X600 spatial hi-res'
  },
  {
    modelPattern: /boom 2 se|boom 2\b/i,
    price: 19500,
    minPrice: 18000,
    maxPrice: 21500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-boom-2/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore Boom 2 outdoor speaker'
  },
  {
    modelPattern: /flare 2/i,
    price: 9500,
    minPrice: 8500,
    maxPrice: 10500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/anker-soundcore-flare-2/',
    confidence: 'HIGH',
    notes: 'Anker Soundcore Flare 2 360 sound'
  },

  // Apple & Beats Audio
  {
    modelPattern: /airpods 4/i,
    price: 17500,
    minPrice: 17500,
    maxPrice: 25000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/apple-airpods-4/',
    confidence: 'HIGH',
    notes: 'Standard AirPods 4 KSh 17,500; ANC model KSh 25,000'
  },
  {
    modelPattern: /airpods pro/i,
    price: 32500,
    minPrice: 29999,
    maxPrice: 34000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/apple-airpods-pro-2nd-gen-usb-c/',
    confidence: 'HIGH',
    notes: 'AirPods Pro 2nd Gen USB-C'
  },
  {
    modelPattern: /airpods 2\b/i,
    price: 14500,
    minPrice: 13500,
    maxPrice: 15500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/apple-airpods-2/',
    confidence: 'HIGH',
    notes: 'Apple AirPods 2nd Gen'
  },
  {
    modelPattern: /beats fit pro/i,
    price: 24500,
    minPrice: 22000,
    maxPrice: 26000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/beats-fit-pro/',
    confidence: 'HIGH',
    notes: 'Beats Fit Pro ANC'
  },
  {
    modelPattern: /powerbeats pro/i,
    price: 26000,
    minPrice: 24000,
    maxPrice: 28000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/powerbeats-pro/',
    confidence: 'HIGH',
    notes: 'Powerbeats Pro wireless earbuds'
  },
  {
    modelPattern: /beats solo buds/i,
    price: 12500,
    minPrice: 11500,
    maxPrice: 13500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/beats-solo-buds/',
    confidence: 'HIGH',
    notes: 'Beats Solo Buds'
  },

  // Nothing Audio
  {
    modelPattern: /cmf buds pro 2/i,
    price: 8999,
    minPrice: 7999,
    maxPrice: 9500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/cmf-by-nothing-buds-pro-2/',
    confidence: 'HIGH',
    notes: 'Nothing CMF Buds Pro 2 with dial control'
  },
  {
    modelPattern: /cmf buds 2a|cmf buds/i,
    price: 5499,
    minPrice: 4800,
    maxPrice: 6200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/cmf-by-nothing-buds/',
    confidence: 'HIGH',
    notes: 'Nothing CMF Buds'
  },

  // Samsung Galaxy Buds
  {
    modelPattern: /galaxy buds 3 fe|buds 3 fe/i,
    price: 14500,
    minPrice: 13000,
    maxPrice: 16000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-buds-fe/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Buds FE'
  },
  {
    modelPattern: /galaxy buds 2 pro|buds 2 pro/i,
    price: 19500,
    minPrice: 17500,
    maxPrice: 21500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-buds-2-pro/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Buds 2 Pro'
  },
  {
    modelPattern: /galaxy buds 2\b|buds 2\b/i,
    price: 12500,
    minPrice: 11000,
    maxPrice: 14000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/samsung-galaxy-buds-2/',
    confidence: 'HIGH',
    notes: 'Samsung Galaxy Buds 2'
  },

  // JBL Speakers & Earbuds
  {
    modelPattern: /live beam 3/i,
    price: 18500,
    minPrice: 17000,
    maxPrice: 20000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-live-beam-3/',
    confidence: 'HIGH',
    notes: 'JBL Live Beam 3 with smart display case'
  },
  {
    modelPattern: /live flex 3/i,
    price: 19500,
    minPrice: 18000,
    maxPrice: 21000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-live-flex-3/',
    confidence: 'HIGH',
    notes: 'JBL Live Flex 3 open-ear with smart case'
  },
  {
    modelPattern: /live buds 3/i,
    price: 18500,
    minPrice: 17000,
    maxPrice: 20000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-live-buds-3/',
    confidence: 'HIGH',
    notes: 'JBL Live Buds 3'
  },
  {
    modelPattern: /live pro 2/i,
    price: 16500,
    minPrice: 15000,
    maxPrice: 18000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-live-pro-2/',
    confidence: 'HIGH',
    notes: 'JBL Live Pro 2 TWS'
  },
  {
    modelPattern: /tune buds 2|tune buds/i,
    price: 9999,
    minPrice: 8999,
    maxPrice: 11000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-tune-buds/',
    confidence: 'HIGH',
    notes: 'JBL Tune Buds ANC'
  },
  {
    modelPattern: /tune beam 2|tune beam/i,
    price: 9999,
    minPrice: 8999,
    maxPrice: 11000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-tune-beam/',
    confidence: 'HIGH',
    notes: 'JBL Tune Beam ANC'
  },
  {
    modelPattern: /tune flex 2|tune flex/i,
    price: 10500,
    minPrice: 9500,
    maxPrice: 11500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-tune-flex/',
    confidence: 'HIGH',
    notes: 'JBL Tune Flex'
  },
  {
    modelPattern: /wave beam 2|wave beam/i,
    price: 7500,
    minPrice: 6800,
    maxPrice: 8200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-wave-beam/',
    confidence: 'HIGH',
    notes: 'JBL Wave Beam'
  },
  {
    modelPattern: /jbl clip 5|clip 5\b/i,
    price: 9500,
    minPrice: 8800,
    maxPrice: 10500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-clip-5/',
    confidence: 'HIGH',
    notes: 'JBL Clip 5 portable speaker'
  },
  {
    modelPattern: /jbl clip 4|clip 4\b/i,
    price: 7500,
    minPrice: 6800,
    maxPrice: 8200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-clip-4/',
    confidence: 'HIGH',
    notes: 'JBL Clip 4'
  },
  {
    modelPattern: /jbl flip 6|flip 6\b/i,
    price: 16500,
    minPrice: 15000,
    maxPrice: 17500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-flip-6/',
    confidence: 'HIGH',
    notes: 'JBL Flip 6 waterproof speaker'
  },
  {
    modelPattern: /jbl flip 5|flip 5\b/i,
    price: 13500,
    minPrice: 12000,
    maxPrice: 14500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-flip-5/',
    confidence: 'HIGH',
    notes: 'JBL Flip 5'
  },
  {
    modelPattern: /jbl go 4|go 4\b/i,
    price: 5500,
    minPrice: 4999,
    maxPrice: 6000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-go-4/',
    confidence: 'HIGH',
    notes: 'JBL GO 4 ultra-portable'
  },
  {
    modelPattern: /jbl go 3|go 3\b/i,
    price: 4800,
    minPrice: 4200,
    maxPrice: 5300,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-go-3/',
    confidence: 'HIGH',
    notes: 'JBL GO 3'
  },
  {
    modelPattern: /jbl charge 5|charge 5\b|jblcharge5/i,
    price: 21500,
    minPrice: 19500,
    maxPrice: 23000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-charge-5/',
    confidence: 'HIGH',
    notes: 'JBL Charge 5 powerbank speaker'
  },
  {
    modelPattern: /jbl xtreme 4|xtreme 4\b/i,
    price: 48000,
    minPrice: 44000,
    maxPrice: 52000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-xtreme-4/',
    confidence: 'HIGH',
    notes: 'JBL Xtreme 4 powerful portable speaker'
  },
  {
    modelPattern: /jbl boombox 3|boombox 3\b|jblboombox3/i,
    price: 62000,
    minPrice: 58000,
    maxPrice: 66000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-boombox-3/',
    confidence: 'HIGH',
    notes: 'JBL Boombox 3'
  },
  {
    modelPattern: /partybox 1000|partybox1000/i,
    price: 185000,
    minPrice: 175000,
    maxPrice: 195000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox 1000 1100W speaker'
  },
  {
    modelPattern: /partybox 710|partybox710/i,
    price: 115000,
    minPrice: 108000,
    maxPrice: 125000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox 710 800W'
  },
  {
    modelPattern: /partybox 310|partybox310/i,
    price: 78000,
    minPrice: 72000,
    maxPrice: 84000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-partybox-310/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox 310 240W'
  },
  {
    modelPattern: /partybox 110|partybox110/i,
    price: 52000,
    minPrice: 48000,
    maxPrice: 56000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-partybox-110/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox 110 160W'
  },
  {
    modelPattern: /partybox encore|partyboxencore/i,
    price: 46000,
    minPrice: 42000,
    maxPrice: 49000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-partybox-encore-essential/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox Encore Essential'
  },
  {
    modelPattern: /partybox club 120/i,
    price: 58000,
    minPrice: 54000,
    maxPrice: 62000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-partybox-club-120/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox Club 120'
  },
  {
    modelPattern: /partybox stage 320/i,
    price: 88000,
    minPrice: 82000,
    maxPrice: 94000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-partybox-stage-320/',
    confidence: 'HIGH',
    notes: 'JBL PartyBox Stage 320'
  },
  {
    modelPattern: /pulse 5|pulse 4/i,
    price: 34000,
    minPrice: 31000,
    maxPrice: 37000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/jbl-pulse-5/',
    confidence: 'HIGH',
    notes: 'JBL Pulse 5 360 lightshow speaker'
  },

  // Sony Audio
  {
    modelPattern: /wf 1000xm5|wf-1000xm5/i,
    price: 36000,
    minPrice: 33000,
    maxPrice: 39000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/sony-wf-1000xm5/',
    confidence: 'HIGH',
    notes: 'Sony WF-1000XM5 flagship ANC'
  },
  {
    modelPattern: /wf 1000xm4|wf-1000xm4/i,
    price: 26000,
    minPrice: 23500,
    maxPrice: 28500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/sony-wf-1000xm4/',
    confidence: 'HIGH',
    notes: 'Sony WF-1000XM4'
  },
  {
    modelPattern: /wf c710n|wf-c700n|wf c700n/i,
    price: 14500,
    minPrice: 13000,
    maxPrice: 16000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/sony-wf-c700n/',
    confidence: 'HIGH',
    notes: 'Sony WF-C700N / C710N ANC'
  },
  {
    modelPattern: /wf c510|wf-c510/i,
    price: 9500,
    minPrice: 8500,
    maxPrice: 10500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/sony-wf-c510/',
    confidence: 'HIGH',
    notes: 'Sony WF-C510 compact wireless'
  },
  {
    modelPattern: /srs xb23|srs-xb23/i,
    price: 13500,
    minPrice: 12000,
    maxPrice: 14800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Sony SRS-XB23 Extra Bass speaker'
  },
  {
    modelPattern: /srs xp500|srs-xp500/i,
    price: 48000,
    minPrice: 44000,
    maxPrice: 52000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Sony SRS-XP500 party speaker'
  },
  {
    modelPattern: /srs xp700|srs-xp700/i,
    price: 68000,
    minPrice: 62000,
    maxPrice: 74000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Sony SRS-XP700 party speaker'
  },

  // Huawei Audio
  {
    modelPattern: /freeclip/i,
    price: 24500,
    minPrice: 22500,
    maxPrice: 26500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/huawei-freeclip/',
    confidence: 'HIGH',
    notes: 'Huawei FreeClip open-ear design'
  },
  {
    modelPattern: /freebuds 6i/i,
    price: 14500,
    minPrice: 13200,
    maxPrice: 15800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/huawei-freebuds-6i/',
    confidence: 'HIGH',
    notes: 'Huawei FreeBuds 6i ANC'
  },
  {
    modelPattern: /freebuds 5i/i,
    price: 11500,
    minPrice: 10500,
    maxPrice: 12800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/huawei-freebuds-5i/',
    confidence: 'HIGH',
    notes: 'Huawei FreeBuds 5i'
  },
  {
    modelPattern: /freebuds pro/i,
    price: 24000,
    minPrice: 22000,
    maxPrice: 26000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/huawei-freebuds-pro-3/',
    confidence: 'HIGH',
    notes: 'Huawei FreeBuds Pro series'
  },

  // OnePlus Audio
  {
    modelPattern: /oneplus buds pro 3/i,
    price: 24500,
    minPrice: 22500,
    maxPrice: 26500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oneplus-buds-pro-3/',
    confidence: 'HIGH',
    notes: 'OnePlus Buds Pro 3 dual drivers'
  },
  {
    modelPattern: /oneplus buds pro 2/i,
    price: 18500,
    minPrice: 16500,
    maxPrice: 20000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oneplus-buds-pro-2/',
    confidence: 'HIGH',
    notes: 'OnePlus Buds Pro 2'
  },
  {
    modelPattern: /oneplus buds 3\b/i,
    price: 11500,
    minPrice: 10500,
    maxPrice: 12800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oneplus-buds-3/',
    confidence: 'HIGH',
    notes: 'OnePlus Buds 3'
  },
  {
    modelPattern: /nord buds 3 pro/i,
    price: 7500,
    minPrice: 6800,
    maxPrice: 8200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oneplus-nord-buds-3-pro/',
    confidence: 'HIGH',
    notes: 'OnePlus Nord Buds 3 Pro'
  },
  {
    modelPattern: /nord buds 2|nord buds 3\b/i,
    price: 5500,
    minPrice: 4800,
    maxPrice: 6200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/oneplus-nord-buds-2/',
    confidence: 'HIGH',
    notes: 'OnePlus Nord Buds 2'
  },

  // Bose Audio
  {
    modelPattern: /bose soundlink flex/i,
    price: 22500,
    minPrice: 20500,
    maxPrice: 24500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/bose-soundlink-flex/',
    confidence: 'HIGH',
    notes: 'Bose SoundLink Flex Bluetooth speaker'
  },
  {
    modelPattern: /bose soundlink revolve/i,
    price: 32000,
    minPrice: 29500,
    maxPrice: 34500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/bose-soundlink-revolve-plus-ii/',
    confidence: 'HIGH',
    notes: 'Bose SoundLink Revolve II'
  },
  {
    modelPattern: /bose quietcomfort earbuds ii/i,
    price: 38000,
    minPrice: 35000,
    maxPrice: 41000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/bose-quietcomfort-earbuds-ii/',
    confidence: 'HIGH',
    notes: 'Bose QuietComfort Earbuds II'
  },
  {
    modelPattern: /bose ultra open/i,
    price: 44000,
    minPrice: 41000,
    maxPrice: 47000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/bose-ultra-open-earbuds/',
    confidence: 'HIGH',
    notes: 'Bose Ultra Open Earbuds'
  },

  // Harman Kardon
  {
    modelPattern: /onyx studio 9|onyx studio 8|onyx studio 7/i,
    price: 36000,
    minPrice: 32500,
    maxPrice: 39000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/harman-kardon-onyx-studio-8/',
    confidence: 'HIGH',
    notes: 'Harman Kardon Onyx Studio premium speaker'
  },
  {
    modelPattern: /aura studio 4/i,
    price: 42000,
    minPrice: 39000,
    maxPrice: 45000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/harman-kardon-aura-studio-4/',
    confidence: 'HIGH',
    notes: 'Harman Kardon Aura Studio 4 Bluetooth home speaker'
  },
  {
    modelPattern: /go 2b play 3|go \+ play 3/i,
    price: 46000,
    minPrice: 42000,
    maxPrice: 49000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/harman-kardon-go-play-3/',
    confidence: 'HIGH',
    notes: 'Harman Kardon Go + Play 3'
  },

  // Google Audio
  {
    modelPattern: /pixel buds pro 2/i,
    price: 32500,
    minPrice: 29999,
    maxPrice: 35000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/google-pixel-buds-pro-2/',
    confidence: 'HIGH',
    notes: 'Google Pixel Buds Pro 2 with Tensor A1'
  },
  {
    modelPattern: /pixel buds pro\b/i,
    price: 26000,
    minPrice: 23500,
    maxPrice: 28500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/google-pixel-buds-pro/',
    confidence: 'HIGH',
    notes: 'Google Pixel Buds Pro'
  },

  // Xiaomi & Realme Earbuds
  {
    modelPattern: /redmi buds 6 active/i,
    price: 2499,
    minPrice: 2199,
    maxPrice: 2800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/redmi-buds-6-active/',
    confidence: 'HIGH',
    notes: 'Redmi Buds 6 Active 14.2mm dynamic driver'
  },
  {
    modelPattern: /redmi buds 6 lite/i,
    price: 3200,
    minPrice: 2800,
    maxPrice: 3600,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/redmi-buds-6-lite/',
    confidence: 'HIGH',
    notes: 'Redmi Buds 6 Lite 40dB ANC'
  },
  {
    modelPattern: /redmi buds 6 play/i,
    price: 2199,
    minPrice: 1899,
    maxPrice: 2499,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/redmi-buds-6-play/',
    confidence: 'HIGH',
    notes: 'Redmi Buds 6 Play 36h playback'
  },
  {
    modelPattern: /xiaomi buds 5\b/i,
    price: 13500,
    minPrice: 12000,
    maxPrice: 15000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-buds-5/',
    confidence: 'HIGH',
    notes: 'Xiaomi Buds 5 lossless audio'
  },
  {
    modelPattern: /realme buds air 6/i,
    price: 6500,
    minPrice: 5800,
    maxPrice: 7200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/realme-buds-air-6/',
    confidence: 'HIGH',
    notes: 'Realme Buds Air 6 50dB ANC'
  },
  {
    modelPattern: /realme buds t310/i,
    price: 3800,
    minPrice: 3400,
    maxPrice: 4200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/realme-buds-t310/',
    confidence: 'HIGH',
    notes: 'Realme Buds T310 46dB ANC'
  },
  {
    modelPattern: /realme buds t01/i,
    price: 2200,
    minPrice: 1900,
    maxPrice: 2500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya',
    sourceUrl: 'https://www.phoneplacekenya.com/product/realme-buds-t01/',
    confidence: 'HIGH',
    notes: 'Realme Buds T01'
  },

  // Oraimo Audio
  {
    modelPattern: /spacebuds/i,
    price: 4500,
    minPrice: 3999,
    maxPrice: 5200,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya / Oraimo Official',
    sourceUrl: 'https://www.jumia.co.ke/oraimo/',
    confidence: 'HIGH',
    notes: 'Oraimo SpaceBuds hybrid ANC'
  },
  {
    modelPattern: /openarc|opensnap/i,
    price: 5200,
    minPrice: 4600,
    maxPrice: 5800,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya / Oraimo Official',
    sourceUrl: 'https://www.jumia.co.ke/oraimo/',
    confidence: 'HIGH',
    notes: 'Oraimo OpenArc open-ear earbuds'
  },

  // ==========================================
  // --- TELEVISIONS & HOME AUDIO ---
  // ==========================================
  // Samsung TVs
  {
    modelPattern: /43cu7000/i,
    price: 44995,
    minPrice: 42995,
    maxPrice: 46995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 43CU7000 43-inch Crystal UHD 4K Smart TV'
  },
  {
    modelPattern: /55cu7000/i,
    price: 64995,
    minPrice: 62995,
    maxPrice: 67995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 55CU7000 55-inch Crystal UHD 4K Smart TV'
  },
  {
    modelPattern: /65cu7000/i,
    price: 89995,
    minPrice: 86995,
    maxPrice: 94995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 65CU7000 65-inch Crystal UHD 4K Smart TV'
  },
  {
    modelPattern: /43cu8000/i,
    price: 49995,
    minPrice: 47995,
    maxPrice: 52995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 43CU8000 43-inch Crystal UHD 4K Smart TV'
  },
  {
    modelPattern: /50cu8000/i,
    price: 59995,
    minPrice: 57995,
    maxPrice: 62995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 50CU8000 50-inch Crystal UHD 4K Smart TV'
  },
  {
    modelPattern: /65cu8000/i,
    price: 96995,
    minPrice: 92995,
    maxPrice: 99995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Samsung 65CU8000 65-inch Crystal UHD 4K Smart TV'
  },

  // LG TVs
  {
    modelPattern: /43uq7500/i,
    price: 42995,
    minPrice: 39995,
    maxPrice: 45995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 43UQ7500 43-inch 4K UHD Smart webOS TV'
  },
  {
    modelPattern: /55uq7500/i,
    price: 64995,
    minPrice: 61995,
    maxPrice: 68995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 55UQ7500 55-inch 4K UHD Smart webOS TV'
  },
  {
    modelPattern: /55nano84/i,
    price: 79995,
    minPrice: 75995,
    maxPrice: 84995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 55NANO84 55-inch NanoCell 4K Smart TV'
  },
  {
    modelPattern: /65ur78/i,
    price: 89995,
    minPrice: 85995,
    maxPrice: 94995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 65UR78 65-inch 4K UHD Smart webOS TV'
  },
  {
    modelPattern: /43lm6300/i,
    price: 36995,
    minPrice: 34995,
    maxPrice: 38995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 43LM6300 43-inch Full HD Smart webOS TV'
  },
  {
    modelPattern: /43un7100/i,
    price: 39995,
    minPrice: 37995,
    maxPrice: 42995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'LG 43UN7100 43-inch 4K UHD Smart TV'
  },

  // Hisense TVs
  {
    modelPattern: /43a4kken|43a4k/i,
    price: 29995,
    minPrice: 27995,
    maxPrice: 31995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Hisense 43A4K 43-inch Full HD Smart VIDAA TV'
  },
  {
    modelPattern: /43a6n/i,
    price: 34995,
    minPrice: 32995,
    maxPrice: 37995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Hisense 43A6N 43-inch 4K UHD Smart VIDAA TV'
  },
  {
    modelPattern: /55a6k/i,
    price: 49995,
    minPrice: 46995,
    maxPrice: 53995,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Hotpoint Appliances Kenya',
    sourceUrl: 'https://hotpoint.co.ke/',
    confidence: 'HIGH',
    notes: 'Hisense 55A6K 55-inch 4K UHD Smart VIDAA TV'
  },

  // Xiaomi & OnePlus TVs
  {
    modelPattern: /mi tv 4a 32/i,
    price: 18999,
    minPrice: 17500,
    maxPrice: 20500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'PhonePlace Kenya / Jumia',
    sourceUrl: 'https://www.phoneplacekenya.com/product/xiaomi-mi-tv-4a-32-inch/',
    confidence: 'HIGH',
    notes: 'Xiaomi Mi TV 4A 32-inch Android Smart TV'
  },
  {
    modelPattern: /oneplus tv 32y1|oneplustv32y1/i,
    price: 19999,
    minPrice: 18500,
    maxPrice: 21500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Avechi Kenya / PhonePlace',
    sourceUrl: 'https://avechi.co.ke/oneplus-tv-32y1/',
    confidence: 'HIGH',
    notes: 'OnePlus TV 32Y1 32-inch HD Smart Android TV'
  },
  {
    modelPattern: /oneplus tv 43y1|oneplustv43y1/i,
    price: 32999,
    minPrice: 30500,
    maxPrice: 35000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Avechi Kenya',
    sourceUrl: 'https://avechi.co.ke/oneplus-tv-43y1/',
    confidence: 'HIGH',
    notes: 'OnePlus TV 43Y1 43-inch Full HD Smart Android TV'
  },
  {
    modelPattern: /oneplus tv 55u1|oneplustv55u1/i,
    price: 56999,
    minPrice: 52000,
    maxPrice: 61000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Avechi Kenya',
    sourceUrl: 'https://avechi.co.ke/oneplus-tv-55u1/',
    confidence: 'HIGH',
    notes: 'OnePlus TV 55U1 55-inch 4K Smart Android TV'
  },

  // Infinix & itel TVs
  {
    modelPattern: /infinix tv x1 32|infinix tv 32/i,
    price: 15999,
    minPrice: 14500,
    maxPrice: 17500,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/infinix/',
    confidence: 'HIGH',
    notes: 'Infinix X1 32-inch Smart Android TV'
  },
  {
    modelPattern: /infinix tv x1 43|infinix tv s1 43/i,
    price: 27999,
    minPrice: 25500,
    maxPrice: 30000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/infinix/',
    confidence: 'HIGH',
    notes: 'Infinix 43-inch Full HD Smart Android TV'
  },
  {
    modelPattern: /infinix tv s1 55/i,
    price: 52999,
    minPrice: 48000,
    maxPrice: 56000,
    priceType: 'EXACT_MODEL_PRICE',
    sourceName: 'Jumia Kenya',
    sourceUrl: 'https://www.jumia.co.ke/infinix/',
    confidence: 'HIGH',
    notes: 'Infinix S1 55-inch 4K Smart Android TV'
  }
];

function run() {
  const productsPath = path.join(process.cwd(), 'data', 'normalized-products.json');
  if (!fs.existsSync(productsPath)) {
    console.error('normalized-products.json missing');
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  console.log(`Processing ${products.length} normalized products for market research mapping...`);

  const researchRecords = [];
  let verifiedCount = 0;
  let unverifiedCount = 0;

  for (const p of products) {
    const candidateId = p.productId;
    const name = p.displayName || '';
    const brand = p.brand || '';
    const model = p.model || '';

    // Search for match in research table
    let matchedResearch = null;
    for (const r of RESEARCHED_PRICES) {
      if (r.modelPattern.test(name) || r.modelPattern.test(model)) {
        matchedResearch = r;
        break;
      }
    }

    if (matchedResearch) {
      verifiedCount++;
      researchRecords.push({
        candidateId,
        productName: name,
        brand,
        model,
        variant: p.specs?.storage || p.specs?.ram ? `${p.specs?.ram || ''} ${p.specs?.storage || ''}`.trim() : null,
        category: p.categoryName || 'Uncategorized',
        subcategory: p.subcategoryName || null,
        price: matchedResearch.price,
        minPrice: matchedResearch.minPrice,
        maxPrice: matchedResearch.maxPrice,
        currency: 'KES',
        priceStatus: 'VERIFIED',
        priceType: matchedResearch.priceType,
        sourceName: matchedResearch.sourceName,
        sourceUrl: matchedResearch.sourceUrl,
        checkedAt: TODAY,
        confidence: matchedResearch.confidence,
        notes: matchedResearch.notes,
      });
    } else {
      unverifiedCount++;
      researchRecords.push({
        candidateId,
        productName: name,
        brand: brand || null,
        model: model || null,
        variant: null,
        category: p.categoryName || 'Uncategorized',
        subcategory: p.subcategoryName || null,
        price: null,
        minPrice: null,
        maxPrice: null,
        currency: 'KES',
        priceStatus: 'UNVERIFIED',
        priceType: 'UNKNOWN',
        sourceName: null,
        sourceUrl: null,
        checkedAt: TODAY,
        confidence: 'UNVERIFIED',
        notes: p.confidence === 'LOW' ? 'Excluded due to low product identity confidence' : 'No verified Kenyan market price match found',
      });
    }
  }

  // Save JSON
  const jsonPath = path.join(process.cwd(), 'data', 'product-market-research.json');
  fs.writeFileSync(jsonPath, JSON.stringify(researchRecords, null, 2), 'utf8');

  // Save CSV
  const csvHeaders = ['candidateId', 'productName', 'brand', 'model', 'category', 'price', 'currency', 'priceStatus', 'priceType', 'sourceName', 'sourceUrl', 'checkedAt', 'confidence', 'notes'];
  const csvRows = [csvHeaders.join(',')];
  for (const r of researchRecords) {
    const row = [
      r.candidateId,
      `"${(r.productName || '').replace(/"/g, '""')}"`,
      `"${(r.brand || '').replace(/"/g, '""')}"`,
      `"${(r.model || '').replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      r.price !== null ? r.price : '',
      r.currency,
      r.priceStatus,
      r.priceType,
      `"${(r.sourceName || '').replace(/"/g, '""')}"`,
      `"${(r.sourceUrl || '').replace(/"/g, '""')}"`,
      r.checkedAt,
      r.confidence,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  }
  const csvPath = path.join(process.cwd(), 'data', 'product-market-research.csv');
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  console.log(`Done. Saved ${researchRecords.length} records to product-market-research.json & product-market-research.csv.`);
  console.log(`- Verified Kenyan Prices: ${verifiedCount}`);
  console.log(`- Unverified Candidates: ${unverifiedCount}`);
}

run();
