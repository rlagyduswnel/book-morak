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
  rating: number;
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

export default function WriteBookSelectPage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => setBooks(parseCSV(csv)));

    const savedPosts = localStorage.getItem("bookmorakPosts");
    if (savedPosts) setPosts(JSON.parse(savedPosts));
  }, []);

  const getAverageRating = (bookId: string) => {
    const bookPosts = posts.filter((post) => post.bookId === bookId);

    if (bookPosts.length === 0) return "0.0";

    const sum = bookPosts.reduce((acc, post) => acc + post.rating, 0);
    return (sum / bookPosts.length).toFixed(1);
  };

  const filteredBooks = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    if (!search) return books;

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
    );
  }, [books, keyword]);

  const handleSelectBook = (book: Book) => {
    localStorage.setItem("selectedWriteBookId", book.isbn13);
    router.push("/write");
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
          <button
          onClick={() => router.back()}
          className="absolute bottom-0 left-[28px] z-20 cursor-pointer flex h-[20px] w-[20px] items-center justify-center active:scale-[0.98]"
        >
            <Image
              src="/images/onboarding/back.svg"
              alt=""
              width={11}
              height={20}
              priority
            />
          </button>

          <h1
            className="pointer-events-none absolute bottom-0 left-0 w-full text-center text-[18px] leading-[24px]"
          >
            작성할 책 선택
          </h1>
        </header>

        <div className="absolute left-[14px] top-[115px] h-[40px] w-[374px] rounded-[10px] border border-[#FFBA1A] bg-white">
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
            className="absolute left-[41px] top-1/2 h-[24px] w-[310px] -translate-y-1/2 bg-transparent text-[14px] font-normal text-black outline-none placeholder:text-[#9A9A9A]"
          />
        </div>

        <section className="hide-scrollbar absolute left-[14px] top-[170px] h-[690px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-[15px]">
            {filteredBooks.map((book) => (
              <button
                key={book.isbn13}
                onClick={() => handleSelectBook(book)}
                className="relative h-[110px] w-[374px] cursor-pointer text-left transition-transform active:scale-[0.98]"
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="absolute left-0 top-0 h-[110px] w-[86px] rounded-[4px] object-cover"
                />

                <div className="absolute left-[101px] top-1/2 flex -translate-y-1/2 flex-col gap-[8px]">
                  <p className="w-[240px] truncate text-[14px] font-normal text-black">
                    {book.title}
                  </p>

                  <p className="w-[240px] truncate text-[10px] font-normal text-[#9A9A9A]">
                    {book.author}
                  </p>

                  <div className="flex items-center gap-[4px]">
                    <Image
                      src="/images/home/starb.svg"
                      alt=""
                      width={10}
                      height={10}
                    />
                    <span className="text-[10px] font-normal text-black">
                      {getAverageRating(book.isbn13)}
                    </span>
                  </div>

                  <p className="w-fit rounded-[5px] border border-[#E0E0E0] px-[6px] py-[2px] text-[10px] font-normal text-[#9A9A9A]">
                    {book.genre}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}