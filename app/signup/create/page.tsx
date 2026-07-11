"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail } from "@/lib/auth";
import { followBooks } from "@/lib/follows";

const adjectives = ["똑똑한", "귀여운", "밝은", "수줍은", "상냥한"];
const nouns = ["나무늘보", "고양이", "강아지", "티라노", "프린세스", "드래곤", "흑염룡", "프린스", "곰돌이", "독서광"];

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function makeRandomNickname() {
  return `${getRandomItem(adjectives)}${getRandomItem(nouns)}`;
}

function makeRandomTag() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function CreateAccountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [tag] = useState(makeRandomTag);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

 const [recommendedNickname, setRecommendedNickname] = useState("");
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [errorMessage, setErrorMessage] = useState("");
 const [showDuplicateEmailToast, setShowDuplicateEmailToast] = useState(false);

useEffect(() => {
  setRecommendedNickname(makeRandomNickname());
}, []);
  const finalNickname = nickname.trim() || recommendedNickname;

  const isPasswordMatched =
  password.trim().length > 0 &&
  password === passwordConfirm;

  const canCreateAccount = isPasswordMatched && !isSubmitting;

  const handleNicknameChange = (value: string) => {
    const onlyKorean = value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setNickname(onlyKorean.slice(0, 10));
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result as string);
   };

    reader.readAsDataURL(file);
  };

  const handleCreateAccount = async () => {
  if (!canCreateAccount) return;

  setIsSubmitting(true);
  setErrorMessage("");

  try {
    const signupEmail = localStorage.getItem("bookmorakSignupEmail") ?? "";

    const selectedBookIds: string[] = JSON.parse(
      localStorage.getItem("selectedBookIds") ?? "[]"
    );

    const user = await signUpWithEmail({
      email: signupEmail,
      password,
      nickname: finalNickname,
      tag,
      profileImage,
    });

    await followBooks(user.id, selectedBookIds);

    router.push("/home");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.toLowerCase().includes("already registered")) {
      setShowDuplicateEmailToast(true);

      setTimeout(() => {
        setShowDuplicateEmailToast(false);
      }, 1800);
    } else {
      setErrorMessage(message || "계정 생성에 실패했습니다. 다시 시도해 주세요.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image src="/images/onboarding/back.svg" alt="" width={11} height={20} priority />
        </button>

        <h1 className="absolute left-0 top-[79px] w-full text-center text-[20px] font-bold leading-[24px] tracking-[-0.025em] text-black">
          계정 생성
        </h1>

        <p className="absolute left-[82px] top-[123px] text-[16px] text-[#9A9A9A]">
          책모락에서 이용할 계정을 만들어 주세요.
        </p>

        <p className="absolute left-[30px] top-[172px] text-[16px] font-bold text-black">
          프로필 사진 등록
        </p>

        <div className="absolute left-[131px] top-[205px] h-[142px] w-[142px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[142px] w-[142px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FEF6E4] text-[17px] text-[#FFBA1A] transition-transform active:scale-[0.98]"
          >
            {profileImage ? (
              <img src={profileImage} alt="프로필 이미지" className="h-full w-full object-cover" />
            ) : (
              "사진 추가"
            )}
          </button>

          {profileImage && (
            <button
              onClick={() => setProfileImage(null)}
              className="absolute right-[-4px] top-[-4px] z-10 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <Image src="/images/onboarding/X.svg" alt="" width={22} height={22} priority />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
        />

        <div className="absolute left-[14px] top-[366px] h-[373px] w-[374px]">
          <p className="text-[16px] text-black">닉네임</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder={recommendedNickname}
              className="absolute left-[14px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[17px] text-black outline-none placeholder:text-[#9A9A9A]"
            />
          </div>

          <div className="mt-[4px] flex w-full items-center justify-between">
            <p className="text-[13px] text-[#9A9A9A]">
              닉네임은 10자 이내로 한글로만 가능합니다.
            </p>
            <p className="text-[12px] text-[#9A9A9A]">{nickname.length}/10</p>
          </div>

          <p className="mt-[24px] text-[16px] text-black">태그</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={`# ${tag}`}
              readOnly
              tabIndex={-1}
              className="absolute left-[14px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[17px] text-[#9A9A9A] outline-none"
            />
          </div>

          <p className="mt-[24px] text-[16px] text-black">비밀번호</p>

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="비밀번호를 입력해 주세요."
            active={isPasswordMatched}
          />

          <div className="mt-[8px]">
            <PasswordInput
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              placeholder="비밀번호를 다시 입력해 주세요."
              active={isPasswordMatched}
            />
          </div>

          <p className="mt-[4px] text-[13px] text-[#9A9A9A]">
            비밀번호는 영어, 숫자, 특수문화를 포함하여, 8~16자 이내로 가능합니다.
          </p>
        </div>

        {showDuplicateEmailToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[13px] text-white">
            이미 가입된 이메일이에요. 다른 이메일을 입력해 주세요.
          </div>
        )}

        {errorMessage && (
          <p className="absolute left-[14px] top-[770px] w-[374px] text-center text-[13px] font-normal text-red-500">
            {errorMessage}
          </p>
        )}

        <button
          disabled={!canCreateAccount}
          onClick={handleCreateAccount}
          className={`absolute left-[14px] top-[788px] flex h-[59px] w-[374px] items-center justify-center rounded-[8px] text-[18px] font-bold text-white transition-transform ${
            canCreateAccount
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          {isSubmitting ? "계정 생성 중..." : "계정 생성하기"}
        </button>
      </section>
    </main>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
  active,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  active: boolean;
}) {
  return (
    <div
      className={`relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border bg-white ${
        active ? "border-[#FFBA1A]" : "border-[#E0E0E0]"
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 16))}
        type="password"
        placeholder={placeholder}
        className="absolute left-[14px] top-1/2 h-[24px] w-[330px] -translate-y-1/2 bg-transparent text-[17px] text-black outline-none placeholder:text-[#9A9A9A]"
      />
    </div>
  );
}