import { supabase } from "./supabaseClient";

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  authorName: string;
  authorImage: string | null;
  content: string;
  likeCount: number;
  date: string;
  createdAt: string;
  isMine: boolean;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  profiles: {
    nickname: string;
    profile_image: string | null;
  } | null;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function mapComment(row: CommentRow, currentUserId?: string | null): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    parentCommentId: row.parent_comment_id,
    authorName: row.profiles?.nickname ?? "책모락이",
    authorImage: row.profiles?.profile_image ?? null,
    content: row.content,
    likeCount: row.like_count,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    isMine: currentUserId ? row.user_id === currentUserId : false,
  };
}

export async function fetchComments(
  postId: string,
  currentUserId?: string | null
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select(
      "id, post_id, user_id, parent_comment_id, content, like_count, created_at, profiles!comments_user_id_fkey(nickname, profile_image)"
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "fetchComments error:",
      error.message,
      error.details,
      error.hint,
      error.code
    );
    return [];
  }
  if (!data) return [];

  return (data as unknown as CommentRow[]).map((row) =>
    mapComment(row, currentUserId)
  );
}

export async function createComment({
  postId,
  userId,
  content,
  parentCommentId,
}: {
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
}) {
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: userId,
    content,
    parent_comment_id: parentCommentId ?? null,
  });

  if (error) throw error;
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
}
