# Supabase Setup Guide

This guide walks you through importing all product data and images into your Supabase database.

---

### Step 1: Run the SQL Script in Supabase

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Click on the **SQL Editor** tab in the left sidebar.
3. Open the file `supabase_schema_and_seed.sql` generated in this project root.
4. Copy and paste the entire script into the Supabase SQL Editor and click **Run**.

This will:
- Create the `public.products` table with all fields (`product_id`, `slug`, `display_name`, `brand`, `category_id`, `price_kes`, `market_ref_price_kes`, `primary_image_url`, `images`, `specs`, etc.).
- Set up Row Level Security (RLS) allowing public read access.
- Create performance indexes on `category_id`, `slug`, and `brand`.
- Insert all 1,219+ product rows with their image links.

---

### Step 2: Configure Environment Variables

Add your Supabase credentials to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

### Step 3: Verifying the Connection

Once the credentials are configured in your environment:
- The app will automatically connect to Supabase via `@supabase/supabase-js`.
- All product metadata and image URLs will be served directly from your Supabase PostgreSQL database.
