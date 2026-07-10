import { supabase } from "./supabaseClient";

export async function fetchFollowedBookIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("follows")
    .select("book_id")
    .eq("user_id", userId);

  if (error || !data) return [];

  return data.map((row) => row.book_id);
}

export async function followBook(userId: string, bookId: string) {
  const { error } = await supabase
    .from("follows")
    .insert({ user_id: userId, book_id: bookId });

  if (error) throw error;
}

export async function followBooks(userId: string, bookIds: string[]) {
  if (bookIds.length === 0) return;

  const rows = bookIds.map((bookId) => ({
    user_id: userId,
    book_id: bookId,
  }));

  const { error } = await supabase.from("follows").insert(rows);
  if (error) throw error;
}

export async function unfollowBook(userId: string, bookId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
}
