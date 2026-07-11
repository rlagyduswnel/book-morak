"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard, { Book, Post } from "@/components/PostCard";
import CommentItem from "@/components/CommentItem";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchPostById } from "@/lib/posts";
import { fetchLikedPostIds } from "@/lib/likes";
import {
  Comment,
  createComment,
  deleteComment,
  fetchComments,
} from "@/lib/comments";
import {
  fetchLikedCommentIds,
  likeComment,
  unlikeComment,
} from "@/lib/commentLikes";

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams<{ postId: string }>();
  const postId = params.postId;

  const [userId, setUserId] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likedCommentIds, setLikedCommentIds] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) {
        router.replace("/login");
        return;
      }

      if (!isMounted) return;
      setUserId(user.id);

      const [fetchedPost, csv, likedIds, fetchedComments, likedCommentIdsRes] =
        await Promise.all([
          fetchPostById(postId, user.id),
          fetch("/data/books.csv").then((res) => res.text()),
          fetchLikedPostIds(user.id),
          fetchComments(postId, user.id),
          fetchLikedCommentIds(user.id),
        ]);

      if (!isMounted) return;

      setPost(fetchedPost);
      setLikedPostIds(likedIds);
      setComments(fetchedComments);
      setLikedCommentIds(likedCommentIdsRes);

      if (fetchedPost) {
        const books = parseCSV(csv);
        setBook(
          books.find((item) => item.isbn13 === fetchedPost.bookId) ?? null
        );
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router, postId]);

  const topLevelComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments]
  );

  const repliesByParentId = useMemo(() => {
    const map: Record<string, Comment[]> = {};

    comments.forEach((comment) => {
      if (!comment.parentCommentId) return;
      const list = map[comment.parentCommentId] ?? [];
      list.push(comment);
      map[comment.parentCommentId] = list;
    });

    return map;
  }, [comments]);

  const handleDeletePost = () => {
    router.back();
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!userId) return;

    const isLiked = likedCommentIds.includes(commentId);

    setLikedCommentIds((prev) =>
      isLiked ? prev.filter((id) => id !== commentId) : [...prev, commentId]
    );

    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              likeCount: comment.likeCount + (isLiked ? -1 : 1),
            }
          : comment
      )
    );

    try {
      if (isLiked) {
        await unlikeComment(userId, commentId);
      } else {
        await likeComment(userId, commentId);
      }
    } catch {
      setLikedCommentIds((prev) =>
        isLiked ? [...prev, commentId] : prev.filter((id) => id !== commentId)
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likeCount: comment.likeCount + (isLiked ? 1 : -1),
              }
            : comment
        )
      );
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const target = comments.find((comment) => comment.id === commentId);
    if (!target) return;

    setComments((prev) =>
      prev.filter(
        (comment) =>
          comment.id !== commentId && comment.parentCommentId !== commentId
      )
    );

    try {
      await deleteComment(commentId);
    } catch {
      setComments((prev) => [...prev, target]);
    }
  };

  const handleSubmitComment = async () => {
    if (!userId || !post) return;

    const content = commentInput.trim();
    if (!content) return;

    try {
      await createComment({
        postId: post.id,
        userId,
        content,
        parentCommentId: replyTarget?.id ?? null,
      });

      const refreshed = await fetchComments(post.id, userId);
      setComments(refreshed);
      setCommentInput("");
      setReplyTarget(null);
    } catch {
      // 등록 실패 시 입력값은 유지해서 다시 시도할 수 있게 해요.
    }
  };

  if (!post || !book) return null;

  return (
    <main className="flex justify-center bg-white">
      <section className="relative flex h-[874px] w-full max-w-[402px] flex-col overflow-hidden bg-white">
        <header className="relative h-[100px] w-full shrink-0 px-[14px]">
          <button
            onClick={() => router.back()}
            className="absolute bottom-0 left-[14px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
          >
            <Image
              src="/images/onboarding/back.svg"
              alt=""
              width={11}
              height={20}
              priority
            />
          </button>
        </header>

        <div className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mt-[15px] px-[14px]">
            <PostCard
              post={post}
              book={book}
              currentUserId={userId}
              initiallyLiked={likedPostIds.includes(post.id)}
              fullContent
              onDelete={handleDeletePost}
            />
          </div>

          <div className="mt-[15px] px-[14px]">
            <p className="text-[13px] font-normal text-black">
              댓글 {comments.length}
            </p>
          </div>

          <div className="mt-[10px] flex flex-col gap-[15px] px-[14px] pb-[15px]">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="flex flex-col gap-[15px]">
                <CommentItem
                  comment={comment}
                  liked={likedCommentIds.includes(comment.id)}
                  onToggleLike={handleToggleCommentLike}
                  onDelete={handleDeleteComment}
                  onReply={setReplyTarget}
                />

                {(repliesByParentId[comment.id] ?? []).map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    liked={likedCommentIds.includes(reply.id)}
                    isReply
                    onToggleLike={handleToggleCommentLike}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {replyTarget && (
          <div className="flex h-[28px] shrink-0 items-center justify-between border-t border-[#E0E0E0] bg-[#FAFAFA] px-[14px]">
            <p className="text-[12px] font-normal text-[#9A9A9A]">
              {replyTarget.authorName}님에게 답글 남기는 중
            </p>

            <button
              onClick={() => setReplyTarget(null)}
              className="cursor-pointer text-[12px] font-normal text-[#9A9A9A]"
            >
              취소
            </button>
          </div>
        )}

        <div className="h-[80px] w-full shrink-0 border-t border-[#E0E0E0] bg-white px-[22px] pb-[14px] pt-[14px]">
          <div className="flex h-full items-center gap-[10px]">
            <input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="h-[52px] flex-1 rounded-[8px] border border-[#E0E0E0] bg-white px-[14px] text-[17px] font-normal text-black outline-none placeholder:text-[#9A9A9A]"
            />

            <button
              onClick={handleSubmitComment}
              disabled={!commentInput.trim()}
              className={`h-[52px] w-[70px] shrink-0 rounded-[8px] text-[17px] font-normal text-white transition-transform ${
                commentInput.trim()
                  ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
                  : "cursor-not-allowed bg-[#9A9A9A]"
              }`}
            >
              등록
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
