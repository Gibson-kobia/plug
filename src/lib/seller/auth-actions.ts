'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  error?: string;
}

/**
 * Creates or signs in a test seller for frictionless local testing and verification.
 */
export async function setupDemoSellerSession(sellerPreset: 'verified' | 'pending' | 'new' = 'verified'): Promise<{
  success: boolean;
  email: string;
  password: string;
  message: string;
}> {
  const admin = createAdminClient();
  const email = `seller.${sellerPreset}@kenyaelectronics.co.ke`;
  const password = 'SellerPassword123!';

  try {
    // Check if user exists
    const { data: usersData } = await admin.auth.admin.listUsers();
    let user = usersData?.users.find((u) => u.email === email);

    if (!user) {
      // Create user
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: 'seller' },
        user_metadata: { full_name: `${sellerPreset.toUpperCase()} Demo Seller` },
      });

      if (createErr || !created.user) {
        throw new Error(`Failed to create demo seller: ${createErr?.message}`);
      }
      user = created.user;
    }

    // Ensure role in roles table
    const { data: roleRow } = await admin.from('roles').select('id').eq('slug', 'seller').maybeSingle();
    const roleId = roleRow?.id || '00000000-0000-0000-0000-000000000002';

    // Ensure profile
    await admin.from('profiles').upsert({
      id: user.id,
      role_id: roleId,
      full_name: `${sellerPreset.toUpperCase()} Demo Seller`,
      phone: '+254712345678',
    });

    // Setup seller profile according to preset
    if (sellerPreset === 'verified') {
      const { data: sp } = await admin
        .from('seller_profiles')
        .upsert({
          profile_id: user.id,
          display_name: 'Nairobi Gadgets Hub',
          whatsapp_number: '+254712345678',
          location: 'Luthuli Avenue, Electronic Plaza 2nd Floor, Shop 14',
          county: 'Nairobi',
          verified: true,
          kyc_status: 'approved',
          rating_avg: 4.9,
          listings_count: 5,
          total_reviews: 24,
        })
        .select('id')
        .single();

      if (sp?.id) {
        await admin.from('seller_verification_documents').upsert({
          seller_profile_id: sp.id,
          document_type: 'national_id',
          front_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
          selfie_with_id_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        });
      }
    } else if (sellerPreset === 'pending') {
      const { data: sp } = await admin
        .from('seller_profiles')
        .upsert({
          profile_id: user.id,
          display_name: 'Kisumu Electronics Corner',
          whatsapp_number: '+254722998877',
          location: 'Oginga Odinga Street, Kisumu',
          county: 'Kisumu',
          verified: false,
          kyc_status: 'pending',
          rating_avg: 5.0,
          listings_count: 1,
        })
        .select('id')
        .single();

      if (sp?.id) {
        await admin.from('seller_verification_documents').upsert({
          seller_profile_id: sp.id,
          document_type: 'national_id',
          front_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
          selfie_with_id_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
          status: 'pending',
          submitted_at: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      email,
      password,
      message: `Demo seller (${sellerPreset}) configured`,
    };
  } catch (err: any) {
    console.error('[setupDemoSellerSession] Error:', err);
    return {
      success: false,
      email,
      password,
      message: err.message || 'Failed to setup demo seller',
    };
  }
}

/**
 * Server-side Sign out
 */
export async function signOutSellerAction(): Promise<{ success: boolean }> {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
    revalidatePath('/seller');
    return { success: true };
  } catch {
    return { success: true };
  }
}
