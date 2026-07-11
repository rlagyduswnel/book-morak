import { supabase } from "./supabaseClient";

export async function fetchLikedCommentIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => row.comment_id);
}

export async function likeComment(userId: string, commentId: string) {
  const { error } = await supabase
    .from("comment_likes")
    .insert({ user_id: userId, comment_id: commentId });

  if (error) throw error;
}

export async function unlikeComment(userId: string, commentId: string) {
  const { error } = await supabase
    .from("comment_likes")
    .delete()
    .eq("user_id", userId)
    .eq("comment_id", commentId);

  if (error) throw error;
}
