import { supabase } from "./supabaseClient";

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split(".").pop() ?? "jpg";
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // 같은 경로로 덮어쓰기 때문에 캐시된 옛날 이미지가 보이지 않도록
  // 타임스탬프를 붙여 매번 새 URL을 만들어요.
  return `${publicUrl}?t=${Date.now()}`;
}
