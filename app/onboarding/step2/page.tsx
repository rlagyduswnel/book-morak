"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { Book, Post } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { fetchPostsByBookIds } from "@/lib/posts";

export default function Step2Page() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [previewPosts, setPreviewPosts] = useState<Post[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedBookIds");
    const bookIds: string[] = saved ? JSON.parse(saved) : [];
    setSelectedBookIds(bookIds);

    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => setBooks(parseCSV(csv)));

    fetchPostsByBookIds(bookIds).then((posts) => {
      setPreviewPosts(posts.slice(0, 2));
    });
  }, []);

  const selectedBooks = books.filter((book) =>
    selectedBookIds.includes(book.isbn13)
  );

  const visibleBooks = isExpanded ? selectedBooks : selectedBooks.slice(0, 3);

  const rowCount = Math.max(1, Math.ceil(visibleBooks.length / 3));
  const visibleRowCount = isExpanded ? Math.min(rowCount, 3) : 1;
  const bookAreaHeight = visibleRowCount * 155;
  const toggleButtonTop = 198 + bookAreaHeight;

  const getBook = (bookId: string) => {
    return books.find((book) => book.isbn13 === bookId);
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] z-40 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image
            src="/images/onboarding/back.svg"
            alt=""
            width={11}
            height={20}
            priority
          />
        </button>

        <Image
          src="/images/onboarding/step2.svg"
          alt=""
          width={190}
          height={3}
          className="absolute left-[106px] top-[88px]"
          priority
        />

        <h1 className="absolute left-[110px] top-[113px] whitespace-pre-line text-center text-[22px] font-bold leading-[26px] text-[#795121]">
          선택한 책으로 채운{"\n"}피드를 미리 만나보세요
        </h1>

        <Image
          src="/images/onboarding/line2.svg"
          alt=""
          width={55}
          height={6.7}
          className="absolute left-[110px] top-[155px]"
          priority
        />

        <p className="absolute left-[100px] top-[166px] text-[17px] text-[#9A9A9A]">
          이 책들에 대한 이야기들이 모여요.
        </p>

        <div
          className={`hide-scrollbar absolute left-[14px] top-[198px] z-20 w-[374px] overflow-x-hidden bg-white ${
            isExpanded ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
          style={{ height: `${bookAreaHeight}px` }}
        >
          <div className="grid grid-cols-3 gap-x-[33px] gap-y-[20px] px-[19px] py-[10.5px]">
            {visibleBooks.map((book) => (
              <div key={book.isbn13} className="relative h-[134px] w-[77px]">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-[92px] w-[77px] rounded-[4px] object-cover"
                />

                <p className="mt-[6px] w-[77px] truncate text-center text-[16px] font-normal text-black">
                  {book.title}
                </p>

                <p className="mt-[2px] w-[77px] truncate text-center text-[12px] font-normal text-[#9A9A9A]">
                  {book.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="absolute left-[14px] z-30 flex h-[44px] w-[374px] cursor-pointer items-center justify-center gap-[10px] rounded-b-[10px] bg-[#E0E0E0] text-[16px] font-normal text-black transition-transform active:scale-[0.98]"
          style={{ top: `${toggleButtonTop}px` }}
        >
          {isExpanded ? "접기" : "선택한 책 모두 보기"}
          <Image
            src={
              isExpanded
                ? "/images/onboarding/up.svg"
                : "/images/onboarding/down.svg"
            }
            alt=""
            width={14}
            height={8}
            priority
          />
        </button>

        <div className="absolute left-[14px] top-[411px] z-0 h-[361px] w-[374px] overflow-hidden bg-white">
          {previewPosts.map((post) => {
            const book = getBook(post.bookId);
            if (!book) return null;

            return (
              <PostCard
                key={post.id}
                post={post}
                book={book}
                interactive={false}
              />
            );
          })}
        </div>

        <button
          onClick={() => router.push("/onboarding/step3")}
          className="absolute left-[14px] top-[776px] z-40 flex h-[59px] w-[374px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[18px] font-normal text-white transition-transform active:scale-[0.98]"
        >
          시작하기
        </button>
      </section>
    </main>
  );
}