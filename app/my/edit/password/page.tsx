"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { updatePassword } from "@/lib/auth";

const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;

export default function ChangePasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;

      if (!user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");
    };

    load();
  }, [router]);

  const isFormatValid = PASSWORD_PATTERN.test(newPassword);
  const isMatched =
    newPassword.length > 0 && newPassword === newPasswordConfirm;
  const isDifferentFromCurrent =
    currentPassword.length === 0 || newPassword !== currentPassword;

  const canSubmit =
    currentPassword.trim().length > 0 &&
    isFormatValid &&
    isMatched &&
    isDifferentFromCurrent &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await updatePassword({
        email,
        currentPassword,
        newPassword,
      });

      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        router.back();
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "비밀번호 변경에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setIsSubmitting(false);
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
            비밀번호 변경
          </h1>
        </header>

        <div className="absolute left-[14px] top-[115px] w-[374px]">
          <p className="text-[16px] text-black">현재 비밀번호</p>
          <PasswordField
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="현재 비밀번호를 입력해 주세요."
          />

          <p className="mt-[24px] text-[16px] text-black">새 비밀번호</p>
          <PasswordField
            value={newPassword}
            onChange={setNewPassword}
            placeholder="새 비밀번호를 입력해 주세요."
            active={newPassword.length > 0 && isFormatValid}
          />
          <p className="mt-[4px] text-[13px] text-[#9A9A9A]">
            비밀번호는 영어, 숫자, 특수문자를 포함하여, 8~16자 이내로
            가능합니다.
          </p>

          <p className="mt-[24px] text-[16px] text-black">
            새 비밀번호 확인
          </p>
          <PasswordField
            value={newPasswordConfirm}
            onChange={setNewPasswordConfirm}
            placeholder="새 비밀번호를 다시 입력해 주세요."
            active={isMatched}
          />

          <div className="mt-[24px] rounded-[8px] bg-[#F5F5F5] p-[16px]">
            <p className="text-[13px] font-bold text-black">안내사항</p>
            <ul className="mt-[8px] list-disc pl-[18px] text-[13px] text-[#9A9A9A]">
              <li>이전과 동일한 비밀번호는 사용할 수 없습니다.</li>
              <li>
                비밀번호는 영어, 숫자, 특수문자를 포함하여, 8~16자 이내로
                가능합니다.
              </li>
            </ul>
          </div>

          {errorMessage && (
            <p className="mt-[16px] text-center text-[13px] font-normal text-red-500">
              {errorMessage}
            </p>
          )}
        </div>

        {showToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[13px] text-white">
            변경되었습니다.
          </div>
        )}

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`absolute left-[14px] top-[788px] flex h-[59px] w-[374px] items-center justify-center rounded-[8px] text-[18px] font-bold text-white transition-transform ${
            canSubmit
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          {isSubmitting ? "변경 중..." : "변경하기"}
        </button>
      </section>
    </main>
  );
}

function PasswordField({
  value,
  onChange,
  placeholder,
  active = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  active?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border bg-white ${
        active ? "border-[#FFBA1A]" : "border-[#E0E0E0]"
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 16))}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        className="absolute left-[14px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[17px] text-black outline-none placeholder:text-[#9A9A9A]"
      />

      <button
        onClick={() => setIsVisible((prev) => !prev)}
        className="absolute right-[14px] top-1/2 flex h-[20px] w-[20px] -translate-y-1/2 cursor-pointer items-center justify-center"
      >
        <Image
          src={
            isVisible ? "/images/signup/eyea.svg" : "/images/signup/eye.svg"
          }
          alt=""
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}
