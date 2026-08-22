import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Ensures a Supabase storage bucket exists.
 */
export async function ensureStorageBucket(bucketName: string, isPublic: boolean = false): Promise<boolean> {
  const supabase = createAdminClient();
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn(`[storage] Could not list buckets: ${error.message}`);
      return false;
    }

    const exists = buckets.some((b) => b.name === bucketName);
    if (!exists) {
      const { error: createErr } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'],
      });
      if (createErr) {
        console.warn(`[storage] Could not create bucket ${bucketName}: ${createErr.message}`);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error(`[storage] Exception in ensureStorageBucket (${bucketName}):`, err);
    return false;
  }
}

/**
 * Uploads a file buffer to a Supabase Storage bucket and returns the accessible URL.
 */
export async function uploadBufferToStorage(
  bucketName: string,
  filePath: string,
  buffer: Buffer | Uint8Array,
  contentType: string,
  isPublic: boolean = false
): Promise<{ url: string | null; error?: string }> {
  const supabase = createAdminClient();
  try {
    await ensureStorageBucket(bucketName, isPublic);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`[storage] Upload error to ${bucketName}/${filePath}:`, error.message);
      return { url: null, error: error.message };
    }

    if (isPublic) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      return { url: publicUrlData.publicUrl };
    } else {
      // For private documents like KYC, generate a signed URL with 7-day validity
      const { data: signedUrlData, error: signErr } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60 * 24 * 7);

      if (signErr || !signedUrlData) {
        // Fallback to public URL format if signed URL fails
        const { data: fallbackUrl } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        return { url: fallbackUrl.publicUrl };
      }
      return { url: signedUrlData.signedUrl };
    }
  } catch (err: any) {
    console.error(`[storage] Upload exception:`, err);
    return { url: null, error: err.message || 'File upload failed' };
  }
}
