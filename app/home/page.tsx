"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { Book, Post } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchFollowedBookIds } from "@/lib/follows";
import { fetchPostsByBookIds } from "@/lib/posts";
import { fetchLikedPostIds } from "@/lib/likes";

export default function HomePage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      if (!isMounted) return;
      setUserId(user.id);

      const [followedBookIds, likedIds, csv] = await Promise.all([
        fetchFollowedBookIds(user.id),
        fetchLikedPostIds(user.id),
        fetch("/data/books.csv").then((res) => res.text()),
      ]);

      if (!isMounted) return;

      setBooks(parseCSV(csv));
      setLikedPostIds(likedIds);

      const fetchedPosts = await fetchPostsByBookIds(
        followedBookIds,
        user.id
      );

      if (!isMounted) return;
      setPosts(fetchedPosts);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const getBook = (bookId: string) => {
    return books.find((book) => book.isbn13 === bookId);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
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
            onClick={() =>
              router.push("/notifications")
            }
            className="absolute bottom-0 right-[14px] h-[18px] w-[16px] cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Image
              src="/images/home/alram.svg"
              alt=""
              width={16}
              height={18}
            />
          </button>
        </header>

        <section className="hide-scrollbar absolute left-[14px] top-[115px] h-[678px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-[15px]">
            {posts.map((post) => {
              const book = getBook(post.bookId);

              if (!book) return null;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  book={book}
                  currentUserId={userId}
                  initiallyLiked={likedPostIds.includes(post.id)}
                  onDelete={handleDeletePost}
                />
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
      <Image
        src={active ? activeIcon : icon}
        alt=""
        width={24}
        height={24}
      />

      <span
        className={`whitespace-nowrap text-[8px] font-normal ${
          active
            ? "text-[#FFBA1A]"
            : "text-[#9A9A9A]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
