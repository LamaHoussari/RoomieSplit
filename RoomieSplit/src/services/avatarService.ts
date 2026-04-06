import { supabase } from "../lib/supabaseClient";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

const BUCKET = "profile_images";

export async function generateAndUploadAvatar(
  userId: string,
  seed: string
): Promise<string | null> {
  const avatar = createAvatar(thumbs, { seed, size: 128 });
  const svg = avatar.toString();
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const filePath = `${userId}/${Date.now()}.svg`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, blob, { contentType: "image/svg+xml", upsert: true });

  if (uploadError) {
    console.error("Avatar upload failed:", uploadError.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  return publicUrl;
}

export function getAvatarUrl(filePath: string): string {
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return publicUrl;
}
