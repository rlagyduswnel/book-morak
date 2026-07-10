import { supabase } from "./supabaseClient";

export async function fetchLikedPostIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("likes")
    .select("post_id")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => row.post_id);
}

export async function likePost(userId: string, postId: string) {
  const { error } = await supabase
    .from("likes")
    .insert({ user_id: userId, post_id: postId });

  if (error) throw error;
}

export async function unlikePost(userId: string, postId: string) {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("user_id", userId)
    .eq("post_id", postId);

  if (error) throw error;
}
