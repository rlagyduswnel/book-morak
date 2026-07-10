"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmail } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showToast, setShowToast] = useState(false);

  const canLogin = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canLogin) return;

    try {
      await signInWithEmail(email.trim(), password);
      router.push("/home");
    } catch {
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 1800);
    }
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-[402px] overflow-hidden bg-white">
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
          이메일로 로그인
        </h1>

        <div className="absolute left-[14px] top-[136px] h-[209px] w-[374px]">
          <p className="text-[14px] text-black">이메일</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <Image
              src="/images/signup/email.svg"
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

          <p className="mt-[36px] text-[14px] text-black">비밀번호</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="비밀번호를 입력해 주세요."
              className="absolute left-[14px] top-1/2 h-[24px] w-[330px] -translate-y-1/2 bg-transparent text-[15px] text-black outline-none placeholder:text-[#9A9A9A]"
            />
          </div>

          <p className="mt-[4px] text-[12px] text-[#9A9A9A]">
            이메일 또는 비밀번호를 확인해주세요.
          </p>
        </div>

        {showToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[12px] text-white">
            이메일과 비밀번호를 확인해주세요.
          </div>
        )}

        <button
          disabled={!canLogin}
          onClick={handleLogin}
          className={`absolute left-[14px] top-[795px] flex h-[52px] w-[374px] items-center justify-center rounded-[8px] text-[16px] font-bold text-white transition-transform ${
            canLogin
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          로그인
        </button>
      </section>
    </main>
  );
}