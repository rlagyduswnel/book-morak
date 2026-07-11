"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PostCard, { Book, Post } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchProfileById, type Profile } from "@/lib/auth";
import { fetchFollowedBookIds } from "@/lib/follows";
import { fetchMyPosts } from "@/lib/posts";
import { fetchLikedPostIds } from "@/lib/likes";

export default function MyPage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followingCount, setFollowingCount] = useState(0);

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

      const [currentProfile, followedBookIds, likedIds, csv, fetchedMyPosts] =
        await Promise.all([
          fetchProfileById(user.id),
          fetchFollowedBookIds(user.id),
          fetchLikedPostIds(user.id),
          fetch("/data/books.csv").then((res) => res.text()),
          fetchMyPosts(user.id),
        ]);

      if (!isMounted) return;

      setProfile(currentProfile);
      setFollowingCount(followedBookIds.length);
      setLikedPostIds(likedIds);
      setBooks(parseCSV(csv));
      setMyPosts(fetchedMyPosts);
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
    setMyPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const nickname = profile?.nickname ?? "";
  const tag = profile?.tag ?? "";
  const bio = profile?.bio ?? "책 이야기가 모락모락 피어나는 곳";
  const postCount = myPosts.length;

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        {/* 상단 영역 */}
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
          <h1 className="absolute bottom-0 left-0 w-full text-center text-[20px] font-bold text-black">
            마이페이지
          </h1>

          <button
            onClick={() => router.push("/settings")}
            className="absolute bottom-1 right-[14px] h-[25px] w-[25px] cursor-pointer transition-transform active:scale-[0.98]"
          >
            <Image src="/images/my/set.svg" alt="" width={25} height={25} />
          </button>
        </header>

        {/* 마이 정보 영역 */}
        <section className="absolute left-0 top-[115px] h-[165px] w-[402px] border-b border-[#E0E0E0] px-[8px] py-[15px]">
          <img
            src={profile?.profileImage || "/images/home/normal.svg"}
            alt=""
            className="absolute left-0 top-0 h-[93px] w-[93px] rounded-full object-cover"
          />

          <button
            onClick={() => router.push("/my/edit")}
            className="absolute left-[8px] top-[99px] flex h-[36px] w-[78px] cursor-pointer items-center justify-center rounded-[8px] border border-[#E0E0E0] text-[12px] font-normal text-[#9A9A9A] transition-transform active:scale-[0.98]"
          >
            프로필 편집
          </button>

          <p className="absolute left-[109px] top-0 text-[16px] font-normal text-black">
            {nickname}
            {tag ? `#${tag}` : ""}
          </p>

          <div className="absolute left-[109px] top-[33px] flex h-[39px] w-[239px] items-center rounded-tr-[8px] rounded-br-[8px] rounded-bl-[8px] border border-[#E0E0E0] px-[10px]">
            <p className="text-left text-[13px] font-normal text-black">
              {bio}
            </p>
          </div>

          <div className="absolute left-[228.5px] top-[102px] flex -translate-x-1/2 items-end gap-[80px]">
            <div className="flex flex-col items-center">
              <span className="text-[16px] font-normal leading-none text-[#FFBA1A]">
                {postCount}
              </span>
              <span className="mt-[5px] text-[12px] font-normal leading-none text-[#9A9A9A]">
                게시글
              </span>
            </div>

            <button
              onClick={() => router.push("/my/following")}
              className="flex cursor-pointer flex-col items-center transition-transform active:scale-[0.98]"
            >
              <span className="text-[16px] font-normal leading-none text-[#FFBA1A]">
                {followingCount}
              </span>
              <span className="mt-[5px] text-[12px] font-normal leading-none text-[#9A9A9A]">
                팔로잉
              </span>
            </button>
          </div>
        </section>

        {/* 게시글 영역 */}
        <section className="hide-scrollbar absolute left-[14px] top-[295px] h-[499px] w-[374px] overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-[15px]">
            {myPosts.map((post) => {
              const book = getBook(post.bookId);
              if (!book) return null;

              return (
                <PostCard
                  key={post.id}
                  post={post}
                  book={book}
                  currentUserId={profile?.id ?? null}
                  initiallyLiked={likedPostIds.includes(post.id)}
                  onDelete={handleDeletePost}
                />
              );
            })}
          </div>
        </section>

        {/* 하단 네비게이션 */}
        <nav className="absolute bottom-0 left-0 h-[80px] w-[402px] border-t border-[#E0E0E0] bg-white px-[22px] pb-[24px] pt-[16px]">
          <div className="flex items-start gap-[70px]">
            <NavItem
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
              active
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
