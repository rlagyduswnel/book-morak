import { supabase } from "./supabaseClient";
import type { Post } from "@/components/PostCard";

type PostRow = {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: {
    nickname: string;
    profile_image: string | null;
  } | null;
};

const POST_SELECT_COLUMNS =
  "id, user_id, book_id, rating, content, like_count, comment_count, created_at, profiles!posts_user_id_fkey(nickname, profile_image)";

function formatDate(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function mapPost(row: PostRow, currentUserId?: string | null): Post {
  return {
    id: row.id,
    bookId: row.book_id,
    authorName: row.profiles?.nickname ?? "책모락이",
    authorImage: row.profiles?.profile_image ?? null,
    rating: row.rating,
    content: row.content,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    isMine: currentUserId ? row.user_id === currentUserId : false,
  };
}

export async function fetchPostsByBookIds(
  bookIds: string[],
  currentUserId?: string | null
): Promise<Post[]> {
  if (bookIds.length === 0) return [];

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_COLUMNS)
    .in("book_id", bookIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchPostsByBookIds error:", error.message, error.details, error.hint, error.code);
    return [];
  }
  if (!data) return [];

  return (data as unknown as PostRow[]).map((row) =>
    mapPost(row, currentUserId)
  );
}

export async function fetchMyPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchMyPosts error:", error.message, error.details, error.hint, error.code);
    return [];
  }
  if (!data) return [];

  return (data as unknown as PostRow[]).map((row) => mapPost(row, userId));
}

export async function fetchAverageRatingsByBook(): Promise<
  Record<string, number>
> {
  const { data, error } = await supabase.from("posts").select("book_id, rating");

  if (error || !data) return {};

  const totals: Record<string, { sum: number; count: number }> = {};

  data.forEach((row) => {
    const entry = totals[row.book_id] ?? { sum: 0, count: 0 };
    entry.sum += row.rating;
    entry.count += 1;
    totals[row.book_id] = entry;
  });

  const averages: Record<string, number> = {};

  Object.entries(totals).forEach(([bookId, { sum, count }]) => {
    averages[bookId] = sum / count;
  });

  return averages;
}

export async function fetchPostById(
  postId: string,
  currentUserId?: string | null
): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT_COLUMNS)
    .eq("id", postId)
    .single();

  if (error) {
    console.error("fetchPostById error:", error.message, error.details, error.hint, error.code);
    return null;
  }
  if (!data) return null;

  return mapPost(data as unknown as PostRow, currentUserId);
}

export async function createPost({
  userId,
  bookId,
  rating,
  content,
}: {
  userId: string;
  bookId: string;
  rating: number;
  content: string;
}) {
  const { error } = await supabase.from("posts").insert({
    user_id: userId,
    book_id: bookId,
    rating,
    content,
  });

  if (error) throw error;
}

export async function deletePost(postId: string) {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw error;
}
