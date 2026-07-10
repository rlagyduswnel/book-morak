"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type Book = {
  isbn13: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
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
  onDelete?: (postId: string) => void;
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
  if (content.length < 151) return content;

  return content.slice(0, 151);
}

export default function PostCard({
  post,
  book,
  onDelete,
  interactive = true,
}: PostCardProps) {
  const router = useRouter();

  const [liked, setLiked] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  const displayLikeCount = liked
    ? post.likeCount + 1
    : post.likeCount;

  const shortenedContent = truncateContent(post.content);
  const isLongContent = post.content.length >= 151;

  const handleDelete = () => {
    const savedPosts: Post[] = JSON.parse(
      localStorage.getItem("bookmorakPosts") ?? "[]"
    );

    const nextPosts = savedPosts.filter(
      (savedPost) => savedPost.id !== post.id
    );

    localStorage.setItem(
      "bookmorakPosts",
      JSON.stringify(nextPosts)
    );

    setMenuOpened(false);
    onDelete?.(post.id);
  };

  return (
    <article className="relative w-[374px] border-b border-[#E0E0E0] px-[5px] py-[10px]">
      {/* 책 정보 */}
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

        <p className="absolute left-[51px] top-[8px] w-[250px] truncate text-[13.5px] font-normal text-black">
          {book.title}
        </p>

        <p className="absolute left-[51px] top-[27px] w-[250px] truncate text-[10px] font-normal text-[#9A9A9A]">
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

      {/* 작성자 정보 */}
      <div className="relative mt-[10px] flex h-[22px] w-full items-center">
        <img
          src={post.authorImage || "/images/home/normal.svg"}
          alt=""
          className="h-[22px] w-[22px] rounded-full object-cover"
        />

        <span className="ml-[5px] text-[12px] font-normal text-black">
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
              width={12}
              height={12}
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
                  className="h-[34px] w-full cursor-pointer text-[12px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  수정하기
                </button>

                <button
                  onClick={handleDelete}
                  className="h-[34px] w-full cursor-pointer border-t border-[#E0E0E0] text-[12px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  삭제하기
                </button>
              </>
            ) : (
              <button
                onClick={() => setMenuOpened(false)}
                className="h-[34px] w-full cursor-pointer text-[12px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
              >
                신고하기
              </button>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      <button
        type="button"
        onClick={
          interactive
            ? () => router.push(`/posts/${post.id}`)
            : undefined
        }
        tabIndex={interactive ? 0 : -1}
        className={`mt-[10px] w-full text-left text-[14px] font-normal leading-[21px] text-black ${
          interactive ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {shortenedContent}

        {isLongContent && (
          <span className="font-normal text-[#9A9A9A]">
            ... 더보기
          </span>
        )}
      </button>

      {/* 게시글 정보 */}
      <div className="relative mt-[10px] h-[12px] w-full">
        {interactive ? (
          <button
            type="button"
            onClick={() => setLiked((prev) => !prev)}
            className="absolute left-0 top-1/2 flex -translate-y-1/2 cursor-pointer items-center transition-transform active:scale-[0.98]"
          >
            <Image
              src={
                liked
                  ? "/images/home/hearta.svg"
                  : "/images/home/heart.svg"
              }
              alt=""
              width={12}
              height={12}
            />
          </button>
        ) : (
          <Image
            src="/images/home/heart.svg"
            alt=""
            width={12}
            height={12}
            className="absolute left-0 top-1/2 -translate-y-1/2"
          />
        )}

        <p className="absolute left-[17px] top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
          {formatCount(displayLikeCount)}
        </p>

        <button
          type="button"
          onClick={
            interactive
              ? () => router.push(`/posts/${post.id}#comments`)
              : undefined
          }
          tabIndex={interactive ? 0 : -1}
          className={`absolute left-[54px] top-1/2 flex -translate-y-1/2 items-center ${
            interactive
              ? "cursor-pointer transition-transform active:scale-[0.98]"
              : "cursor-default"
          }`}
        >
          <Image
            src="/images/home/chat.svg"
            alt=""
            width={12}
            height={12}
          />
        </button>

        <p className="absolute left-[71px] top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
          {formatCount(post.commentCount)}
        </p>

        <p className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
          {post.date}
        </p>
      </div>
    </article>
  );
}
