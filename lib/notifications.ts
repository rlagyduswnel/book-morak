import { supabase } from "./supabaseClient";

export type NotificationType = "like" | "comment" | "reply";

export type Notification = {
  id: string;
  type: NotificationType;
  postId: string;
  bookId: string;
  actorName: string;
  commentContent: string | null;
  date: string;
  createdAt: string;
};

type NotificationRow = {
  id: string;
  type: NotificationType;
  post_id: string;
  comment_content: string | null;
  created_at: string;
  profiles: { nickname: string } | null;
  posts: { book_id: string } | null;
};

function formatDate(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    postId: row.post_id,
    bookId: row.posts?.book_id ?? "",
    actorName: row.profiles?.nickname ?? "책모락이",
    commentContent: row.comment_content,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(
  userId: string
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select(
      "id, type, post_id, comment_content, created_at, profiles!notifications_actor_id_fkey(nickname), posts(book_id)"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as NotificationRow[]).map(mapNotification);
}

export async function fetchNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count === null) return 0;

  return count;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAllNotifications(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
