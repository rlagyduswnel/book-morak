"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchAverageRatingsByBook } from "@/lib/posts";
import { fetchFollowedBookIds, unfollowBook } from "@/lib/follows";

export default function FollowingListPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [followedBookIds, setFollowedBookIds] = useState<string[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>(
    {}
  );

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

      const [csv, followedIds, ratings] = await Promise.all([
        fetch("/data/books.csv").then((res) => res.text()),
        fetchFollowedBookIds(user.id),
        fetchAverageRatingsByBook(),
      ]);

      if (!isMounted) return;

      setBooks(parseCSV(csv));
      setFollowedBookIds(followedIds);
      setAverageRatings(ratings);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const getAverageRating = (bookId: string) => {
    const average = averageRatings[bookId];
    return average ? average.toFixed(1) : "0.0";
  };

  const getBook = (bookId: string) => {
    return books.find((book) => book.isbn13 === bookId);
  };

  const followedBooks = followedBookIds
    .map((bookId) => getBook(bookId))
    .filter((book): book is Book => Boolean(book));

  const handleUnfollow = async (bookId: string) => {
    if (!userId) return;

    setFollowedBookIds((prev) => prev.filter((id) => id !== bookId));

    try {
      await unfollowBook(userId, bookId);
    } catch {
      setFollowedBookIds((prev) => [...prev, bookId]);
    }
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
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

          <h1 className="pointer-events-none absolute bottom-0 left-0 w-full text-center text-[20px] font-bold text-black">
            팔로잉 목록
          </h1>
        </header>

        <p className="absolute left-[14px] top-[115px] text-[18px] font-bold text-black">
          팔로잉 도서 총 <span className="text-[#FFBA1A]">{followedBooks.length}</span>개
        </p>

        <section className="hide-scrollbar absolute left-[14px] top-[160px] h-[634px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex w-[374px] flex-col gap-[15px]">
            {followedBooks.map((book) => (
              <div
                key={book.isbn13}
                onClick={() => router.push(`/books/${book.isbn13}`)}
                className="relative h-[110px] w-[374px] shrink-0 cursor-pointer transition-transform active:scale-[0.98]"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="absolute left-0 top-0 h-[110px] w-[86px] rounded-[4px] object-cover"
                />

                <div className="absolute left-[101px] top-1/2 flex w-[190px] -translate-y-1/2 flex-col gap-[8px]">
                  <p className="w-[190px] truncate text-[16px] font-normal text-black">
                    {book.title}
                  </p>

                  <p className="w-[190px] truncate text-[12px] font-normal text-[#9A9A9A]">
                    {book.author}
                  </p>

                  <div className="flex items-center gap-[4px]">
                    <Image
                      src="/images/home/starb.svg"
                      alt=""
                      width={12}
                      height={12}
                    />
                    <span className="text-[12px] font-normal text-black">
                      {getAverageRating(book.isbn13)}
                    </span>
                  </div>

                  <p className="w-fit rounded-[5px] border border-[#E0E0E0] px-[6px] py-[2px] text-[12px] font-normal text-[#9A9A9A]">
                    {book.genre}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfollow(book.isbn13);
                  }}
                  className="absolute right-0 top-1/2 flex h-[36px] w-[66px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] bg-[#E0E0E0] text-[13px] font-normal text-[#9A9A9A] transition-transform active:scale-[0.98]"
                >
                  팔로잉
                </button>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
