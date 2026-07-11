"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchAverageRatingsByBook } from "@/lib/posts";
import {
  fetchFollowedBookIds,
  followBook,
  unfollowBook,
} from "@/lib/follows";

const genres = [
  { id: "all", label: "전체", x: 14, w: 46 },
  { id: "소설", label: "소설", x: 69, w: 46 },
  { id: "에세이", label: "에세이", x: 124, w: 59 },
  { id: "인문학", label: "인문학", x: 192, w: 59 },
  { id: "자기계발", label: "자기계발", x: 260, w: 72 },
];

export default function ExplorePage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>(
    {}
  );
  const [followedBookIds, setFollowedBookIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

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

      const [csv, ratings, followed] = await Promise.all([
        fetch("/data/books.csv").then((res) => res.text()),
        fetchAverageRatingsByBook(),
        fetchFollowedBookIds(user.id),
      ]);

      if (!isMounted) return;

      setBooks(parseCSV(csv));
      setAverageRatings(ratings);
      setFollowedBookIds(followed);
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

  const filteredBooks = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return books.filter((book) => {
      const genreMatched =
        selectedGenre === "all" || book.genre === selectedGenre;

      const keywordMatched =
        search === "" ||
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search);

      return genreMatched && keywordMatched;
    });
  }, [books, keyword, selectedGenre]);

  const handleToggleFollow = async (bookId: string) => {
    if (!userId) return;

    const isFollowing = followedBookIds.includes(bookId);

    if (isFollowing) {
      setFollowedBookIds((prev) => prev.filter((id) => id !== bookId));

      try {
        await unfollowBook(userId, bookId);
      } catch {
        setFollowedBookIds((prev) => [...prev, bookId]);
      }
    } else {
      setFollowedBookIds((prev) => [...prev, bookId]);

      try {
        await followBook(userId, bookId);
      } catch {
        setFollowedBookIds((prev) => prev.filter((id) => id !== bookId));
      }
    }
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
          <h1 className="absolute bottom-0 left-0 w-full text-center text-[20px] font-bold text-black">
            책 검색
          </h1>
        </header>

        <div className="absolute left-[14px] top-[115px] h-[52px] w-[374px] rounded-[10px] border border-[#FFBA1A] bg-white">
          <Image
            src="/images/onboarding/Q.svg"
            alt=""
            width={18}
            height={18}
            className="absolute left-[11px] top-1/2 -translate-y-1/2"
            priority
          />

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="검색어를 입력해 주세요."
            className="absolute left-[41px] top-1/2 h-[24px] w-[310px] -translate-y-1/2 bg-transparent text-[17px] font-normal text-black outline-none placeholder:text-[#9A9A9A]"
          />
        </div>

        {genres.map((genre) => {
          const selected = selectedGenre === genre.id;

          return (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              style={{ left: genre.x, width: genre.w }}
              className={`absolute top-[182px] h-[25px] cursor-pointer rounded-[41px] text-[16px] transition-transform active:scale-[0.98] ${
                selected
                  ? "bg-[#FFBA1A] text-white"
                  : "border border-[#E0E0E0] bg-white text-[#9A9A9A]"
              }`}
            >
              {genre.label}
            </button>
          );
        })}

        <section className="hide-scrollbar absolute left-[14px] top-[222px] h-[572px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex w-[374px] flex-col gap-[15px]">
            {filteredBooks.map((book) => {
              const isFollowing = followedBookIds.includes(book.isbn13);

              return (
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
                      handleToggleFollow(book.isbn13);
                    }}
                    className={`absolute right-0 top-1/2 flex h-[36px] w-[66px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] text-[13px] font-normal transition-transform active:scale-[0.98] ${
                      isFollowing
                        ? "bg-[#E0E0E0] text-[#9A9A9A]"
                        : "border border-[#FFBA1A] text-[#FFBA1A]"
                    }`}
                  >
                    {isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <nav className="absolute bottom-0 left-0 h-[80px] w-[402px] border-t border-[#E0E0E0] bg-white px-[22px] pb-[24px] pt-[16px]">
          <div className="flex items-start gap-[70px]">
            <NavItem
              icon="/images/nav/home.svg"
              activeIcon="/images/nav/homea.svg"
              label="홈"
              href="/home"
            />

            <NavItem
              active
              icon="/images/nav/search.svg"
              activeIcon="/images/nav/searcha.svg"
              label="둘러보기"
              href="/explore"
            />

            <NavItem
              icon="/images/nav/create.svg"
              activeIcon="/images/nav/createa.svg"
              label="게시글 작성"
              href="/write/select-book"
            />

            <NavItem
              icon="/images/nav/my.svg"
              activeIcon="/images/nav/mya.svg"
              label="마이페이지"
              href="/my"
            />
          </div>
        </nav>
      </section>
    </main>
  );
}

function NavItem({
  active = false,
  icon,
  activeIcon,
  label,
  href,
}: {
  active?: boolean;
  icon: string;
  activeIcon: string;
  label: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex w-[38px] cursor-pointer flex-col items-center gap-[3px] transition-transform active:scale-[0.98]"
    >
      <Image src={active ? activeIcon : icon} alt="" width={24} height={24} />

      <span
        className={`whitespace-nowrap text-[10px] font-normal ${
          active ? "text-[#FFBA1A]" : "text-[#9A9A9A]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
