"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";

const genres = [
  { id: "all", label: "전체", x: 14, w: 46 },
  { id: "소설", label: "소설", x: 69, w: 46 },
  { id: "에세이", label: "에세이", x: 124, w: 59 },
  { id: "인문학", label: "인문학", x: 192, w: 59 },
  { id: "자기계발", label: "자기계발", x: 260, w: 72 },
];

export default function BooksPage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  useEffect(() => {
    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => {
        setBooks(parseCSV(csv));
      });
  }, []);

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

  const toggleBook = (isbn13: string) => {
    setSelectedBooks((prev) =>
      prev.includes(isbn13)
        ? prev.filter((id) => id !== isbn13)
        : [...prev, isbn13]
    );
  };

  const isCompleteActive = selectedBooks.length >= 2;

  const handleComplete = () => {
  if (!isCompleteActive) return;

  localStorage.setItem(
    "selectedBookIds",
    JSON.stringify(selectedBooks)
  );

  router.push("/onboarding/step2");
};

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image src="/images/onboarding/back.svg" alt="" width={11} height={20} priority />
        </button>

        <Image
          src="/images/onboarding/step1.svg"
          alt=""
          width={190}
          height={3}
          className="absolute left-[106px] top-[88px]"
          priority
        />

        <h1 className="absolute left-[84px] top-[113px] text-[22px] font-bold text-[#795121]">
          관심 있는 책을 선택해주세요
        </h1>

        <Image
          src="/images/onboarding/line.svg"
          alt=""
          width={76.36}
          height={6.76}
          className="absolute left-[84px] top-[133px]"
          priority
        />

        <p className="absolute left-[142px] top-[143px] text-[17px] text-[#9A9A9A]">
          최소 <span className="text-[#FFBA1A]">2권</span> 이상 선택
        </p>

        <div className="absolute left-[14px] top-[172px] h-[52px] w-[374px] rounded-[10px] border border-[#FFBA1A] bg-white">
          <button className="absolute left-[11px] top-1/2 -translate-y-1/2 cursor-pointer transition-transform active:scale-[0.98]">
            <Image src="/images/onboarding/Q.svg" alt="" width={18} height={18} priority />
          </button>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="책 제목, 저자 검색"
            className="absolute left-[41px] top-1/2 h-[24px] w-[310px] -translate-y-1/2 bg-transparent text-[17px] text-[#795121] outline-none placeholder:text-[#9A9A9A]"
          />
        </div>

        {genres.map((genre) => {
          const selected = selectedGenre === genre.id;

          return (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              style={{ left: genre.x, width: genre.w }}
              className={`absolute top-[240px] h-[25px] cursor-pointer rounded-[41px] text-[16px] transition-transform active:scale-[0.98] ${
                selected
                  ? "bg-[#FFBA1A] text-white"
                  : "border border-[#E0E0E0] bg-white text-[#9A9A9A]"
              }`}
            >
              {genre.label}
            </button>
          );
        })}

        <p className="absolute left-[325px] top-[281px] text-[13px] text-[#9A9A9A]">
          <span className="text-[#FFBA1A]">{selectedBooks.length}</span>권 선택중
        </p>

        <div className="hide-scrollbar absolute left-[14px] top-[299px] h-[467px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex w-[374px] flex-col gap-[7px]">
            {filteredBooks.map((book) => {
              const selected = selectedBooks.includes(book.isbn13);

              return (
                <button
                  key={book.isbn13}
                  onClick={() => toggleBook(book.isbn13)}
                  className="relative h-[80px] w-[374px] shrink-0 cursor-pointer rounded-[10px] border border-[#E0E0E0] bg-white text-left transition-transform active:scale-[0.98]"
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="absolute left-[11px] top-[8px] h-[64px] w-[47px] rounded-[4px] object-cover"
                  />

                  <p className="absolute left-[73px] top-[12.5px] w-[230px] truncate text-[16px] text-black">
                    {book.title}
                  </p>

                  <p className="absolute left-[73px] top-[34px] w-[230px] truncate text-[12px] text-[#9A9A9A]">
                    {book.author}
                  </p>

                  <p className="absolute left-[73px] top-[51px] w-[230px] truncate text-[12px] text-[#9A9A9A]">
                    {book.genre}
                  </p>

                  <div className="absolute left-[339px] top-[28px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-[#E0E0E0]">
                    {selected && (
                      <Image
                        src="/images/onboarding/check.svg"
                        alt=""
                        width={24}
                        height={24}
                        priority
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={!isCompleteActive}
          className={`absolute left-[14px] top-[776px] flex h-[59px] w-[374px] items-center justify-center rounded-[8px] text-[18px] text-white transition-transform ${
            isCompleteActive
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-default bg-[#9A9A9A]"
          }`}
        >
          선택 완료
        </button>
      </section>
    </main>
  );
}