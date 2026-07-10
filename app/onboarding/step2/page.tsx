"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Book = {
  isbn13: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
};

type Post = {
  id: string;
  bookId: string;
  authorName: string;
  authorImage?: string;
  rating: number;
  content: string;
  likeCount: number;
  commentCount: number;
  date: string;
  createdAt: string;
  isMine: boolean;
};

function parseCSV(csv: string): Book[] {
  const lines = csv.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values =
      line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map((v) =>
        v.replace(/^"|"$/g, "").trim()
      ) ?? [];

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return {
      isbn13: row.isbn13,
      title: row.title,
      author: row.author,
      genre: row.genre,
      cover: row.cover,
    };
  });
}

function formatCount(count: number) {
  return count >= 100 ? "99+" : String(count);
}

function truncateContent(content: string) {
  if (content.length < 151) return content;
  return content.slice(0, 151);
}

export default function Step2Page() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedBookIds");
    if (saved) setSelectedBookIds(JSON.parse(saved));

    const savedPosts = localStorage.getItem("bookmorakPosts");
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => setBooks(parseCSV(csv)));
  }, []);

  const selectedBooks = books.filter((book) =>
    selectedBookIds.includes(book.isbn13)
  );

  const visibleBooks = isExpanded ? selectedBooks : selectedBooks.slice(0, 3);

  const rowCount = Math.max(1, Math.ceil(visibleBooks.length / 3));
  const visibleRowCount = isExpanded ? Math.min(rowCount, 3) : 1;
  const bookAreaHeight = visibleRowCount * 155;
  const toggleButtonTop = 198 + bookAreaHeight;

  const previewPosts = useMemo(() => {
    return posts
      .filter((post) => selectedBookIds.includes(post.bookId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 2);
  }, [posts, selectedBookIds]);

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

        <h1 className="absolute left-[110px] top-[113px] whitespace-pre-line text-center text-[20px] font-bold leading-[26px] text-[#795121]">
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

        <p className="absolute left-[100px] top-[166px] text-[15px] text-[#9A9A9A]">
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

                <p className="mt-[6px] w-[77px] truncate text-center text-[14px] font-normal text-black">
                  {book.title}
                </p>

                <p className="mt-[2px] w-[77px] truncate text-center text-[10px] font-normal text-[#9A9A9A]">
                  {book.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="absolute left-[14px] z-30 flex h-[44px] w-[374px] cursor-pointer items-center justify-center gap-[10px] rounded-b-[10px] bg-[#E0E0E0] text-[14px] font-normal text-black transition-transform active:scale-[0.98]"
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

            const shortened = truncateContent(post.content);
            const isLong = post.content.length >= 151;

            return (
              <article
                key={post.id}
                className="relative w-[374px] border-b border-[#E0E0E0] px-[5px] py-[10px]"
              >
                <button
                  onClick={() => router.push(`/books/${book.isbn13}`)}
                  className="relative h-[50px] w-full cursor-pointer rounded-[10px] border border-[#FFBA1A] text-left transition-transform active:scale-[0.98]"
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

                  <Image
                    src="/images/home/more.svg"
                    alt=""
                    width={18}
                    height={18}
                    className="ml-auto"
                  />
                </div>

                <button
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="mt-[10px] w-full cursor-pointer text-left text-[14px] font-normal leading-[21px] text-black"
                >
                  {shortened}
                  {isLong && (
                    <span className="font-normal text-[#9A9A9A]">
                      ... 더보기
                    </span>
                  )}
                </button>

                <div className="relative mt-[10px] h-[12px] w-full">
                  <Image
                    src="/images/home/heart.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="absolute left-0 top-1/2 -translate-y-1/2"
                  />

                  <p className="absolute left-[17px] top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
                    {formatCount(post.likeCount)}
                  </p>

                  <Image
                    src="/images/home/chat.svg"
                    alt=""
                    width={12}
                    height={12}
                    className="absolute left-[54px] top-1/2 -translate-y-1/2"
                  />

                  <p className="absolute left-[71px] top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
                    {formatCount(post.commentCount)}
                  </p>

                  <p className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
                    {post.date}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/onboarding/step3")}
          className="absolute left-[14px] top-[776px] z-40 flex h-[59px] w-[374px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[16px] font-normal text-white transition-transform active:scale-[0.98]"
        >
          시작하기
        </button>
      </section>
    </main>
  );
}