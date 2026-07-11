"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Book } from "@/components/PostCard";
import { parseCSV } from "@/lib/parseCSV";
import { supabase } from "@/lib/supabaseClient";
import { createPost } from "@/lib/posts";

export default function WritePage() {
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [showExitModal, setShowExitModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDirty = rating > 0 || content.trim().length > 0;
  const canSubmit = rating >= 1 && content.trim().length >= 30 && !isSubmitting;

  useEffect(() => {
    const selectedBookId = localStorage.getItem("selectedWriteBookId");

    fetch("/data/books.csv")
      .then((res) => res.text())
      .then((csv) => {
        const books = parseCSV(csv);
        const selected = books.find((item) => item.isbn13 === selectedBookId);
        setBook(selected ?? null);
      });
  }, []);

  const handleBack = () => {
    if (isDirty) {
      setShowExitModal(true);
      return;
    }

    router.back();
  };

  const handleContentChange = (value: string) => {
    setContent(value.slice(0, 1000));
  };

  const handleSubmit = async () => {
    if (!canSubmit || !book) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;

    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        userId: user.id,
        bookId: book.isbn13,
        rating,
        content: content.trim(),
      });

      router.push("/home");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <header className="absolute left-0 top-0 h-[100px] w-[402px] px-[14px]">
          <button
            onClick={handleBack}
            className="absolute bottom-0 left-[28px] z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
          >
            <Image
              src="/images/onboarding/back.svg"
              alt=""
              width={11}
              height={20}
              priority
            />
          </button>

          <h1 className="pointer-events-none absolute bottom-0 left-0 w-full text-center text-[20px] font-bold leading-[24px] text-black">
            게시글 작성하기
          </h1>
        </header>

        <section className="absolute left-[14px] top-[115px] w-[374px]">
          {book && (
            <button className="relative h-[50px] w-full rounded-[10px] border border-[#E0E0E0] text-left">
              <img
                src={book.cover}
                alt={book.title}
                className="absolute left-[20px] top-1/2 h-[34px] w-[21px] -translate-y-1/2 object-cover"
              />

              <p className="absolute left-[51px] top-[8px] w-[290px] truncate text-[16px] font-normal text-black">
                {book.title}
              </p>

              <p className="absolute left-[51px] top-[27px] w-[290px] truncate text-[12px] font-normal text-[#9A9A9A]">
                {book.author}
              </p>
            </button>
          )}

          <p className="mt-[15px] text-[16px] font-normal text-[#9A9A9A]">
            이 책은 어떠셨나요?
          </p>

          <div className="mt-[15px] flex h-[28px] items-center">
            <div className="flex gap-[10px]">
              {Array.from({ length: 5 }).map((_, index) => {
                const score = index + 1;

                return (
                  <button
                    key={score}
                    onClick={() => setRating(score)}
                    className="cursor-pointer transition-transform active:scale-[0.98]"
                  >
                    <Image
                      src={
                        score <= rating
                          ? "/images/home/star.svg"
                          : "/images/home/stara.svg"
                      }
                      alt=""
                      width={24}
                      height={24}
                    />
                  </button>
                );
              })}
            </div>

            <p className="ml-auto text-[22px] font-normal text-[#FFBA1A]">
              {rating} / 5
            </p>
          </div>

          <p className="mt-[15px] text-[12px] font-normal text-[#9A9A9A]">
            별점을 탭 해주세요.
          </p>

          <div className="mt-[15px] rounded-[8px] bg-[#FAFAFA] p-[5px]">
            <p className="text-[12px] font-normal text-[#9A9A9A]">
              리뷰 작성 가이드
            </p>
            <p className="mt-[5px] whitespace-pre-line text-[12px] font-normal leading-[16px] text-[#9A9A9A]">
              - 다른 사용자를 존중하는 표현을 사용해주세요.{"\n"}- 스포일러가 될 수 있는 내용은 주의해주세요.{"\n"}- 부적절한 내용은 사전 안내 없이 삭제 될 수 있습니다.
            </p>
          </div>

          <div className="relative mt-[15px] h-[250px] w-[374px] rounded-[8px] border border-[#E0E0E0] p-[10px]">
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={
                "이 책을 읽으며 떠오른 질문, 감상,\n남기고 싶은 문장을 자유롭게 적어보세요."
              }
              className="h-[200px] w-full resize-none bg-transparent text-[14px] font-normal leading-[20px] text-black outline-none placeholder:text-[#9A9A9A]"
            />

            <p className="absolute bottom-[10px] right-[10px] text-[12px] font-normal text-[#9A9A9A]">
              {content.length}/1000
            </p>
          </div>

          <p className="mt-0 text-[12px] font-normal text-[#9A9A9A]">
            최소 30자, 최대 1,000자까지 입력할 수 있습니다. (띄어쓰기 포함)
          </p>
        </section>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`absolute left-[14px] top-[788px] flex h-[59px] w-[374px] items-center justify-center rounded-[8px] text-[18px] font-normal text-white transition-transform ${
            canSubmit
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          {isSubmitting ? "등록 중..." : "등록하기"}
        </button>

        {showExitModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-[34px]">
            <div className="w-full rounded-[16px] bg-white p-[20px]">
              <p className="text-center text-[18px] font-normal leading-[24px] text-black">
                작성 중인 내용이 저장되지 않습니다.
              </p>

              <div className="mt-[20px] flex gap-[10px]">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[8px] border border-[#E0E0E0] text-[16px] font-normal text-black transition-transform active:scale-[0.98]"
                >
                  취소
                </button>

                <button
                  onClick={() => router.back()}
                  className="flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[16px] font-normal text-white transition-transform active:scale-[0.98]"
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}