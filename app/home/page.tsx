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

export default function HomePage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [openedMenuId, setOpenedMenuId] = useState<string | null>(null);

  useEffect(() => {
    const savedBookIds = localStorage.getItem("selectedBookIds");
    if (savedBookIds) setSelectedBookIds(JSON.parse(savedBookIds));

    const savedPosts = localStorage.getItem("bookmorakPosts");
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => setBooks(parseCSV(csv)));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => selectedBookIds.includes(post.bookId))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [posts, selectedBookIds]);

  const getBook = (bookId: string) => {
    return books.find((book) => book.isbn13 === bookId);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
          <Image
            src="/images/landing/logo.svg"
            alt="책모락"
            width={63}
            height={24}
            className="absolute bottom-0 left-[14px]"
            priority
          />

          <button
            onClick={() => router.push("/notifications")}
            className="absolute bottom-0 right-[14px] h-[18px] w-[16px] cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Image src="/images/home/alram.svg" alt="" width={16} height={18} />
          </button>
        </header>

        <section className="hide-scrollbar absolute left-[14px] top-[115px] h-[678px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-[15px]">
            {filteredPosts.map((post) => {
              const book = getBook(post.bookId);
              if (!book) return null;

              const liked = likedPosts.includes(post.id);
              const displayLikeCount = liked ? post.likeCount + 1 : post.likeCount;
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

                    <button
                      onClick={() =>
                        setOpenedMenuId(openedMenuId === post.id ? null : post.id)
                      }
                      className="ml-auto h-[18px] w-[18px] cursor-pointer transition-transform active:scale-[0.98]"
                    >
                      <Image src="/images/home/more.svg" alt="" width={18} height={18} />
                    </button>

                    {openedMenuId === post.id && (
                      <div className="absolute right-0 top-[24px] z-20 w-[82px] rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
                        {post.isMine ? (
                          <>
                            <button className="h-[34px] w-full cursor-pointer text-[12px] font-normal text-black">
                              수정하기
                            </button>
                            <button className="h-[34px] w-full cursor-pointer text-[12px] font-normal text-black">
                              삭제하기
                            </button>
                          </>
                        ) : (
                          <button className="h-[34px] w-full cursor-pointer text-[12px] font-normal text-black">
                            신고하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/posts/${post.id}`)}
                    className="mt-[10px] w-full cursor-pointer text-left text-[14px] font-normal leading-[21px] text-black"
                  >
                    {shortened}
                    {isLong && (
                      <span className="font-normal text-[#9A9A9A]">... 더보기</span>
                    )}
                  </button>

                  <div className="relative mt-[10px] h-[12px] w-full">
                    <button
                      onClick={() => toggleLike(post.id)}
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

                    <p className="absolute left-[17px] top-1/2 -translate-y-1/2 text-[11px] font-normal text-[#9A9A9A]">
                      {formatCount(displayLikeCount)}
                    </p>

                    <button
                      onClick={() => router.push(`/posts/${post.id}#comments`)}
                      className="absolute left-[54px] top-1/2 flex -translate-y-1/2 cursor-pointer items-center transition-transform active:scale-[0.98]"
                    >
                      <Image src="/images/home/chat.svg" alt="" width={12} height={12} />
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
            })}
          </div>
        </section>

        <nav className="absolute bottom-0 left-0 h-[80px] w-[402px] border-t border-[#E0E0E0] bg-white px-[22px] pb-[24px] pt-[16px]">
          <div className="flex items-start gap-[70px]">
            <NavItem
              active
              icon="/images/nav/home.svg"
              activeIcon="/images/nav/homea.svg"
              label="홈"
              href="/home"
            />
            <NavItem
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
        className={`whitespace-nowrap text-[8px] font-normal ${
          active ? "text-[#FFBA1A]" : "text-[#9A9A9A]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}