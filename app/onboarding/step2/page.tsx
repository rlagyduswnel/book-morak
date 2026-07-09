"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Book = {
  isbn13: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
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

export default function Step2Page() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedBookIds");

    if (saved) {
      setSelectedBookIds(JSON.parse(saved));
    }

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

  const removeBook = (isbn13: string) => {
    const next = selectedBookIds.filter((id) => id !== isbn13);
    setSelectedBookIds(next);
    localStorage.setItem("selectedBookIds", JSON.stringify(next));
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

        <div className="absolute left-[14px] top-[411px] z-0 h-[361px] w-[374px] rounded-[10px] bg-white">
          {/* 홈 게시글 미리보기 영역 */}
        </div>

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

                <button
                  onClick={() => removeBook(book.isbn13)}
                  className="absolute right-[-8px] top-[-8px] cursor-pointer transition-transform active:scale-[0.98]"
                >
                  <Image
                    src="/images/onboarding/X.svg"
                    alt=""
                    width={18}
                    height={18}
                    priority
                  />
                </button>

                <p className="mt-[6px] w-[77px] truncate text-center text-[14px] font-bold text-black">
                  {book.title}
                </p>

                <p className="mt-[2px] w-[77px] truncate text-center text-[10px] text-[#9A9A9A]">
                  {book.author}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="absolute left-[14px] z-30 flex h-[44px] w-[374px] cursor-pointer items-center justify-center gap-[10px] rounded-b-[10px] bg-[#E0E0E0] text-[14px] text-black transition-transform active:scale-[0.98]"
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

        <button
          onClick={() => router.push("/onboarding/step3")}
          className="absolute left-[14px] top-[776px] z-40 flex h-[59px] w-[374px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[16px] text-white transition-transform active:scale-[0.98]"
        >
          시작하기
        </button>
      </section>
    </main>
  );
}