"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { likePost, unlikePost } from "@/lib/likes";
import { deletePost } from "@/lib/posts";

export type Book = {
  isbn13: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  description: string;
};

export type Post = {
  id: string;
  bookId: string;
  authorName: string;
  authorImage?: string | null;
  rating: number;
  content: string;
  likeCount: number;
  commentCount: number;
  date: string;
  createdAt: string;
  isMine: boolean;
};

type PostCardProps = {
  post: Post;
  book: Book;
  /** 현재 로그인된 계정의 id. 좋아요/삭제 처리에 필요해요. */
  currentUserId?: string | null;
  /** 이 계정이 이 게시글을 이미 좋아요 눌렀는지 (부모에서 미리 조회해 전달) */
  initiallyLiked?: boolean;
  onDelete?: (postId: string) => void;
  /** false면 카드 상단의 책 정보(표지/제목/저자) 블록을 숨겨요. 기본값 true. */
  showBookInfo?: boolean;
  /** true면 본문을 자르지 않고 전부 보여주고 '더보기'도 없어요 (게시글 상세페이지용). */
  fullContent?: boolean;
  /**
   * true(기본값): 홈 등에서 쓰는 완전 인터랙티브 카드
   * false: 온보딩 등에서 쓰는 미리보기 카드
   *   - 좋아요 토글 X
   *   - 더보기(수정/삭제/신고) 메뉴 X
   *   - 책/본문/댓글 클릭 시 페이지 이동 X
   */
  interactive?: boolean;
};

function formatCount(count: number) {
  return count >= 100 ? "99+" : String(count);
}

function truncateContent(content: string) {
  if (content.length <= 100) return content;

  return content.slice(0, 100);
}

export default function PostCard({
  post,
  book,
  currentUserId,
  initiallyLiked = false,
  onDelete,
  showBookInfo = true,
  fullContent = false,
  interactive = true,
}: PostCardProps) {
  const router = useRouter();

  const [liked, setLiked] = useState(initiallyLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [menuOpened, setMenuOpened] = useState(false);

  const handleToggleLike = async () => {
    if (!currentUserId) return;

    const nextLiked = !liked;
    const nextLikeCount = likeCount + (nextLiked ? 1 : -1);

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    try {
      if (nextLiked) {
        await likePost(currentUserId, post.id);
      } else {
        await unlikePost(currentUserId, post.id);
      }
    } catch {
      // 실패하면 화면 상태를 원래대로 되돌려요.
      setLiked(!nextLiked);
      setLikeCount(likeCount);
    }
  };

  const shortenedContent = truncateContent(post.content);
  const isLongContent = post.content.length > 100;

  const handleDelete = async () => {
    setMenuOpened(false);

    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch {
      // 삭제 실패 시 별도 처리 없이 메뉴만 닫아요.
    }
  };

  return (
    <article className="relative w-[374px] border-b border-[#E0E0E0] px-[5px] py-[10px]">
      {/* 책 정보 */}
      {showBookInfo && (
      <button
        type="button"
        onClick={
          interactive
            ? () => router.push(`/books/${book.isbn13}`)
            : undefined
        }
        tabIndex={interactive ? 0 : -1}
        className={`relative h-[50px] w-full rounded-[10px] border border-[#FFBA1A] text-left ${
          interactive
            ? "cursor-pointer transition-transform active:scale-[0.98]"
            : "cursor-default"
        }`}
      >
        <img
          src={book.cover}
          alt={book.title}
          className="absolute left-[20px] top-1/2 h-[34px] w-[21px] -translate-y-1/2 object-cover"
        />

        <p className="absolute left-[51px] top-[8px] w-[250px] truncate text-[16px] font-normal text-black">
          {book.title}
        </p>

        <p className="absolute left-[51px] top-[27px] w-[250px] truncate text-[12px] font-normal text-[#9A9A9A]">
          {book.author}
        </p>

        <Image
          src="/images/home/next.svg"
          alt=""
          width={6.36}
          height={12.71}
          className="absolute right-[20px] top-1/2 -translate-y-1/2"
        />
      </button>
      )}

      {/* 작성자 정보 */}
      <div
        className={`relative flex h-[28px] w-full items-center ${
          showBookInfo ? "mt-[10px]" : "mt-0"
        }`}
      >
        <img
          src={post.authorImage || "/images/home/normal.svg"}
          alt=""
          className="h-[28px] w-[28px] rounded-full object-cover"
        />

        <span className="ml-[5px] text-[14px] font-normal text-black">
          {post.authorName}
        </span>

        <div className="ml-[5px] flex gap-[2px]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              src={
                index < post.rating
                  ? "/images/home/star.svg"
                  : "/images/home/stara.svg"
              }
              alt=""
              width={14}
              height={14}
            />
          ))}
        </div>

        {interactive ? (
          <button
            type="button"
            onClick={() => setMenuOpened((prev) => !prev)}
            className="ml-auto h-[18px] w-[18px] cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Image
              src="/images/home/more.svg"
              alt=""
              width={18}
              height={18}
            />
          </button>
        ) : (
          <Image
            src="/images/home/more.svg"
            alt=""
            width={18}
            height={18}
            className="ml-auto"
          />
        )}

        {interactive && menuOpened && (
          <div className="absolute right-0 top-[24px] z-30 w-[82px] overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
            {post.isMine ? (
              <>
                <button
                  onClick={() => router.push(`/posts/${post.id}/edit`)}
                  className="h-[34px] w-full cursor-pointer text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  수정하기
                </button>

                <button
                  onClick={handleDelete}
                  className="h-[34px] w-full cursor-pointer border-t border-[#E0E0E0] text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  삭제하기
                </button>
              </>
            ) : (
              <button
                onClick={() => setMenuOpened(false)}
                className="h-[34px] w-full cursor-pointer text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
              >
                신고하기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="relative mt-[10px] w-full">
        <button
          type="button"
          onClick={
            interactive
              ? () => router.push(`/posts/${post.id}`)
              : undefined
          }
          tabIndex={interactive ? 0 : -1}
          className={`w-full whitespace-pre-line text-left text-[16px] font-normal leading-[21px] text-black ${
            interactive ? "cursor-pointer" : "cursor-default"
          }`}
        >
          {fullContent ? post.content : shortenedContent}

          {!fullContent && isLongContent && (
            <span className="font-normal text-[#9A9A9A]"> ... 더보기</span>
          )}
        </button>
      </div>

      {/* 게시글 정보 */}
      <div className="relative mt-[10px] h-[16px] w-full">
        {interactive ? (
          <button
            type="button"
            onClick={handleToggleLike}
            className="absolute left-0 top-1/2 flex -translate-y-1/2 cursor-pointer items-center transition-transform active:scale-[0.98]"
          >
            <Image
              src={
                liked
                  ? "/images/home/hearta.svg"
                  : "/images/home/heart.svg"
              }
              alt=""
              width={16}
              height={16}
            />
          </button>
        ) : (
          <Image
            src="/images/home/heart.svg"
            alt=""
            width={16}
            height={16}
            className="absolute left-0 top-1/2 -translate-y-1/2"
          />
        )}

        <p className="absolute left-[21px] top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#9A9A9A]">
          {formatCount(likeCount)}
        </p>

        <button
          type="button"
          onClick={
            interactive
              ? () => router.push(`/posts/${post.id}#comments`)
              : undefined
          }
          tabIndex={interactive ? 0 : -1}
          className={`absolute left-[64px] top-1/2 flex -translate-y-1/2 items-center ${
            interactive
              ? "cursor-pointer transition-transform active:scale-[0.98]"
              : "cursor-default"
          }`}
        >
          <Image
            src="/images/home/chat.svg"
            alt=""
            width={16}
            height={16}
          />
        </button>

        <p className="absolute left-[85px] top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#9A9A9A]">
          {formatCount(post.commentCount)}
        </p>

        <p className="absolute right-0 top-1/2 -translate-y-1/2 text-[14px] font-normal text-[#9A9A9A]">
          {post.date}
        </p>
      </div>
    </article>
  );
}
