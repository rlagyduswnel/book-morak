"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!isValidEmail) return;

    if (!sent) {
      setSent(true);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 1800);

      return;
    }

    localStorage.setItem("bookmorakSignupEmail", email);
    router.push("/signup/create");
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image
            src="/images/onboarding/back.svg"
            alt=""
            width={11}
            height={20}
            priority
          />
        </button>

        <h1 className="absolute left-0 top-[79px] w-full text-center text-[18px] font-bold leading-[24px] tracking-[-0.025em] text-black">
          이메일 인증하기
        </h1>

        <p className="absolute left-[14px] top-[136px] text-[14px] text-black">
          이메일
        </p>

        <div
          className={`absolute left-[14px] top-[161px] h-[52px] w-[374px] rounded-[8px] border bg-white ${
            isValidEmail ? "border-[#FFBA1A]" : "border-[#E0E0E0]"
          }`}
        >
          <Image
            src={
              isValidEmail
                ? "/images/signup/emaila.svg"
                : "/images/signup/email.svg"
            }
            alt=""
            width={20}
            height={20}
            className="absolute left-[10px] top-1/2 -translate-y-1/2"
            priority
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력해 주세요."
            className="absolute left-[55px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[15px] text-black outline-none placeholder:text-[#9A9A9A]"
          />
        </div>

        {showToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[12px] text-white">
            인증 메일이 전송되었습니다.
          </div>
        )}

        <button
          disabled={!isValidEmail}
          onClick={handleSubmit}
          className={`absolute left-[14px] top-[795px] flex h-[52px] w-[374px] items-center justify-center rounded-[8px] text-[16px] font-bold text-white transition-transform ${
            isValidEmail
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          {sent ? "인증 메일 확인 완료" : "인증 메일 보내기"}
        </button>
      </section>
    </main>
  );
}