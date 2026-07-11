"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import {
  Notification,
  deleteAllNotifications,
  deleteNotification,
  fetchNotifications,
} from "@/lib/notifications";

export default function NotificationsPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [books, setBooks] = useState<Book[]>([]);

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

      const [csv, fetchedNotifications] = await Promise.all([
        fetch("/data/books.csv").then((res) => res.text()),
        fetchNotifications(user.id),
      ]);

      if (!isMounted) return;

      setBooks(parseCSV(csv));
      setNotifications(fetchedNotifications);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const getBookCover = (bookId: string) => {
    return books.find((book) => book.isbn13 === bookId)?.cover ?? "";
  };

  const getMessage = (notification: Notification) => {
    if (notification.type === "like") {
      return `${notification.actorName}님이 회원님의 게시물에 좋아요를 눌렀어요.`;
    }
    if (notification.type === "comment") {
      return `${notification.actorName}님이 회원님의 게시물에 댓글을 남겼어요.`;
    }
    return `${notification.actorName}님이 회원님의 게시물에 대댓글을 남겼어요.`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    setNotifications((prev) =>
      prev.filter((item) => item.id !== notification.id)
    );

    deleteNotification(notification.id).catch(() => {});

    router.push(`/posts/${notification.postId}`);
  };

  const handleReadAll = async () => {
    if (!userId || notifications.length === 0) return;

    setNotifications([]);

    try {
      await deleteAllNotifications(userId);
    } catch {
      // 실패해도 화면은 이미 비워둔 상태로 유지해요.
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
            알림
          </h1>
        </header>

        <button
          onClick={handleReadAll}
          className="absolute right-[14px] top-[115px] cursor-pointer text-[16px] font-normal text-[#FFBA1A] transition-transform active:scale-[0.98]"
        >
          모두 읽기
        </button>

        {notifications.length === 0 ? (
          <div className="absolute left-[14px] top-[150px] flex h-[510px] w-[374px] flex-col items-center justify-center">
            <Image
              src="/images/home/sleep.svg"
              alt=""
              width={180}
              height={180}
              priority
            />

            <p className="mt-[15px] text-[20px] font-bold text-black">
              아직 도착한 알림이 없어요
            </p>

            <p className="mt-[8px] text-center text-[16px] font-normal leading-[22px] text-[#9A9A9A]">
              게시물에 좋아요나 댓글이 달리면
              <br />
              여기에서 알려드릴게요.
            </p>
          </div>
        ) : (
          <section className="hide-scrollbar absolute left-[14px] top-[150px] h-[709px] w-[374px] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-[15px]">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className="relative flex w-full cursor-pointer items-start gap-[10px] rounded-[12px] border border-[#E0E0E0] p-[16px] text-left transition-transform active:scale-[0.98]"
                >
                  <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#FEF6E4]">
                    <Image
                      src={
                        notification.type === "like"
                          ? "/images/home/heartb.svg"
                          : "/images/home/chatb.svg"
                      }
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-normal leading-[22px] text-black">
                      {getMessage(notification)}
                    </p>

                    {notification.commentContent && (
                      <p className="mt-[8px] truncate rounded-[8px] bg-[#F5F5F5] px-[12px] py-[8px] text-[13px] font-normal text-[#9A9A9A]">
                        {notification.commentContent}
                      </p>
                    )}

                    <p className="mt-[8px] text-[12px] font-normal text-[#9A9A9A]">
                      {notification.date}
                    </p>
                  </div>

                  {getBookCover(notification.bookId) && (
                    <img
                      src={getBookCover(notification.bookId)}
                      alt=""
                      className="h-[80px] w-[60px] shrink-0 rounded-[4px] object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
