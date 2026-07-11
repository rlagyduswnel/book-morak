"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard, { Book, Post } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { fetchPostsByBookIds } from "@/lib/posts";
import { fetchLikedPostIds } from "@/lib/likes";
import {
  fetchFollowedBookIds,
  fetchFollowerCount,
  followBook,
  unfollowBook,
} from "@/lib/follows";

type SortOption = "latest" | "popular";

function truncateDescription(description: string) {
  if (description.length < 151) return description;
  return description.slice(0, 151);
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams<{ isbn13: string }>();
  const isbn13 = params.isbn13;

  const [userId, setUserId] = useState<string | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("latest");
  const [isSortOpen, setIsSortOpen] = useState(false);

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

      const [csv, followedBookIds, likedIds, count, fetchedPosts] =
        await Promise.all([
          fetch("/data/books.csv").then((res) => res.text()),
          fetchFollowedBookIds(user.id),
          fetchLikedPostIds(user.id),
          fetchFollowerCount(isbn13),
          fetchPostsByBookIds([isbn13], user.id),
        ]);

      if (!isMounted) return;

      const books = parseCSV(csv);
      const foundBook = books.find((item) => item.isbn13 === isbn13) ?? null;

      setBook(foundBook);
      setIsFollowing(followedBookIds.includes(isbn13));
      setLikedPostIds(likedIds);
      setFollowerCount(count);
      setPosts(fetchedPosts);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router, isbn13]);

  const averageRating = useMemo(() => {
    if (posts.length === 0) return "0.0";
    const sum = posts.reduce((acc, post) => acc + post.rating, 0);
    return (sum / posts.length).toFixed(1);
  }, [posts]);

  const sortedPosts = useMemo(() => {
    const next = [...posts];

    if (sortOption === "popular") {
      next.sort((a, b) => {
        if (b.likeCount !== a.likeCount) return b.likeCount - a.likeCount;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } else {
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return next;
  }, [posts, sortOption]);

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleToggleFollow = async () => {
    if (!userId) return;

    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(prev - 1, 0));

      try {
        await unfollowBook(userId, isbn13);
      } catch {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } else {
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);

      try {
        await followBook(userId, isbn13);
      } catch {
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const handleWrite = () => {
    localStorage.setItem("selectedWriteBookId", isbn13);
    router.push("/write");
  };

  const handleSelectSort = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  if (!book) return null;

  const shortenedDescription = truncateDescription(book.description);
  const isLongDescription = book.description.length >= 151;

  return (
    <main className="flex justify-center bg-white">
      <section className="relative flex h-[874px] w-full max-w-[402px] flex-col overflow-hidden bg-white">
        <header className="relative h-[100px] w-full shrink-0 px-[14px]">
          <button
            onClick={() => router.back()}
            className="absolute bottom-0 left-[14px] z-10 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
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
            책 상세페이지
          </h1>
        </header>

        <div className="hide-scrollbar flex-1 overflow-y-auto overflow-x-hidden">
          {/* 책 정보 영역 */}
          <section className="mt-[15px] border-b border-[#E0E0E0] px-[14px] pb-[15px]">
            <div className="flex gap-[30px]">
              <img
                src={book.cover}
                alt={book.title}
                className="h-[158px] w-[106px] shrink-0 rounded-[4px] object-cover"
              />

              <div className="flex flex-1 flex-col justify-center">
                <p className="text-[16px] font-normal text-black">
                  {book.title}
                </p>

                <p className="mt-[4px] text-[13px] font-normal text-black">
                  {book.author}
                </p>

                <div className="mt-[4px] flex items-center gap-[4px]">
                  <Image
                    src="/images/home/star.svg"
                    alt=""
                    width={12}
                    height={12}
                  />
                  <span className="text-[12px] font-normal text-black">
                    {averageRating}
                  </span>
                </div>

                <p className="mt-[4px] w-fit rounded-[5px] border border-[#E0E0E0] px-[6px] py-[2px] text-[12px] font-normal text-[#9A9A9A]">
                  {book.genre}
                </p>

                <div className="mt-[4px] flex items-center justify-between">
                  <p className="text-[13px] font-normal">
                    <span className="text-[#FFBA1A]">{followerCount}</span>
                    <span className="text-[#9A9A9A]"> 팔로워</span>
                  </p>

                  <button
                    onClick={handleToggleFollow}
                    className={`flex h-[36px] w-[66px] cursor-pointer items-center justify-center rounded-[8px] text-[13px] font-normal transition-transform active:scale-[0.98] ${
                      isFollowing
                        ? "bg-[#E0E0E0] text-[#9A9A9A]"
                        : "border border-[#FFBA1A] text-[#FFBA1A]"
                    }`}
                  >
                    {isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                </div>

                <button
                  onClick={handleWrite}
                  className="mt-[4px] flex h-[35px] w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#FFBA1A] text-[16px] font-normal text-white transition-transform active:scale-[0.98]"
                >
                  작성하기
                </button>
              </div>
            </div>
          </section>

          {/* 책 소개 영역 */}
          <section className="mt-[15px] border-b border-[#E0E0E0] px-[5px] py-[15px]">
            <p className="text-left text-[16px] font-normal text-black">
              책 소개
            </p>

            <p className="mt-[10px] text-left text-[14px] font-normal leading-[20px] text-black">
              {isDescriptionExpanded ? book.description : shortenedDescription}

              {isLongDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="cursor-pointer font-normal text-[#9A9A9A]"
                >
                  {isDescriptionExpanded ? "... 접기" : "... 더보기"}
                </button>
              )}
            </p>
          </section>

          {/* 정렬 필터 */}
          <div className="relative mt-[15px] px-[14px]">
            <button
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="flex cursor-pointer items-center gap-[4px] text-[13px] font-normal text-black"
            >
              {sortOption === "latest" ? "최신순" : "인기순"}
              <Image
                src={
                  isSortOpen
                    ? "/images/onboarding/down.svg"
                    : "/images/onboarding/up.svg"
                }
                alt=""
                width={14}
                height={8}
              />
            </button>

            {isSortOpen && (
              <div className="absolute left-[14px] top-[24px] z-20 w-[82px] overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
                <button
                  onClick={() => handleSelectSort("latest")}
                  className="h-[34px] w-full cursor-pointer text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  최신순
                </button>

                <button
                  onClick={() => handleSelectSort("popular")}
                  className="h-[34px] w-full cursor-pointer border-t border-[#E0E0E0] text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
                >
                  인기순
                </button>
              </div>
            )}
          </div>

          {/* 게시물 영역 */}
          <div className="px-[14px] pt-[15px] pb-[15px]">
            <div className="flex flex-col gap-[15px]">
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  book={book}
                  currentUserId={userId}
                  initiallyLiked={likedPostIds.includes(post.id)}
                  showBookInfo={false}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          </div>
        </div>

        <nav className="h-[80px] w-full shrink-0 border-t border-[#E0E0E0] bg-white px-[22px] pb-[24px] pt-[16px]">
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
