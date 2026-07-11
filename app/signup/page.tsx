"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailSignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDuplicateToast, setShowDuplicateToast] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    if (!isValidEmail || isChecking) return;

    setIsChecking(true);

    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.exists) {
        setShowDuplicateToast(true);

        setTimeout(() => {
          setShowDuplicateToast(false);
        }, 1800);

        return;
      }

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
    } finally {
      setIsChecking(false);
    }
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

        <h1 className="absolute left-0 top-[79px] w-full text-center text-[20px] font-bold leading-[24px] tracking-[-0.025em] text-black">
          이메일 인증하기
        </h1>

        <p className="absolute left-[14px] top-[136px] text-[16px] text-black">
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
            className="absolute left-[55px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[17px] text-black outline-none placeholder:text-[#9A9A9A]"
          />
        </div>

        {showToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[13px] text-white">
            인증 메일이 전송되었습니다.
          </div>
        )}

        {showDuplicateToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[13px] text-white">
            이미 가입된 이메일이에요. 다른 이메일을 입력해 주세요.
          </div>
        )}

        <button
          disabled={!isValidEmail || isChecking}
          onClick={handleSubmit}
          className={`absolute left-[14px] top-[788px] flex h-[59px] w-[374px] items-center justify-center rounded-[8px] text-[18px] font-bold text-white transition-transform ${
            isValidEmail && !isChecking
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