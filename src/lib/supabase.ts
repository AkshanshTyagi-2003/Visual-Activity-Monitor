import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const bucketName = process.env.SUPABASE_BUCKET_NAME || 'screenshots';

export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

/**
 * Uploads a base64 encoded image string to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadScreenshotToStorage(
  base64Data: string,
  userId: string,
  filename: string
): Promise<string> {
  // Extract base64 content if prefixed with data URI scheme
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const filePath = `user_${userId}/${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}.png`;

  if (!supabase) {
    console.warn('Supabase is not configured. Falling back to data URI representation.');
    // Fallback: Return standard data URI if Supabase storage isn't connected
    return base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      return base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase:', err);
    return base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;
  }
}
