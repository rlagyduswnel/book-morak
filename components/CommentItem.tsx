"use client";

import Image from "next/image";
import { useState } from "react";
import type { Comment } from "@/lib/comments";

type CommentItemProps = {
  comment: Comment;
  liked: boolean;
  isReply?: boolean;
  onToggleLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onReply?: (comment: Comment) => void;
};

export default function CommentItem({
  comment,
  liked,
  isReply = false,
  onToggleLike,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <div className={isReply ? "ml-[24px] flex gap-[6px]" : "flex gap-[6px]"}>
      {isReply && (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="mt-[8px] h-[14px] w-[14px] shrink-0 text-[#9A9A9A]"
        >
          <path
            d="M4 2v6a2 2 0 0 0 2 2h6M9 7l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      <div className="min-w-0 flex-1">
        <div className="relative flex items-center">
          <img
            src={comment.authorImage || "/images/home/normal.svg"}
            alt=""
            className="h-[28px] w-[28px] rounded-full object-cover"
          />

          <span className="ml-[8px] text-[14px] font-normal text-black">
            {comment.authorName}
          </span>

          <span className="ml-[8px] text-[12px] font-normal text-[#9A9A9A]">
            {comment.date}
          </span>

          <button
            onClick={() => setMenuOpened((prev) => !prev)}
            className="ml-auto h-[18px] w-[18px] cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Image src="/images/home/more.svg" alt="" width={18} height={18} />
          </button>

          {menuOpened && (
            <div className="absolute right-0 top-[26px] z-30 w-[82px] overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
              {comment.isMine ? (
                <button
                  onClick={() => {
                    setMenuOpened(false);
                    onDelete(comment.id);
                  }}
                  className="h-[34px] w-full cursor-pointer text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  삭제하기
                </button>
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

        <p className="mt-[6px] break-words text-[14px] font-normal leading-[19px] text-black">
          {comment.content}
        </p>

        <div className="mt-[6px] flex items-center gap-[8px]">
          <button
            onClick={() => onToggleLike(comment.id)}
            className="flex cursor-pointer items-center gap-[4px] transition-transform active:scale-[0.98]"
          >
            <Image
              src={
                liked ? "/images/home/hearta.svg" : "/images/home/heart.svg"
              }
              alt=""
              width={12}
              height={12}
            />
            <span className="text-[12px] font-normal text-[#9A9A9A]">
              {comment.likeCount}
            </span>
          </button>

          {!isReply && (
            <button
              onClick={() => onReply?.(comment)}
              className="cursor-pointer text-[12px] font-normal text-[#9A9A9A]"
            >
              답글달기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
