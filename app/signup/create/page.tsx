"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  const recommendedNickname = useMemo(() => makeRandomNickname(), []);
  const finalNickname = nickname.trim() || recommendedNickname;

  const isPasswordMatched =
  password.trim().length > 0 &&
  password === passwordConfirm;

  const canCreateAccount = isPasswordMatched;

  const handleNicknameChange = (value: string) => {
    const onlyKorean = value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, "");
    setNickname(onlyKorean.slice(0, 10));
  };

  const handleImageChange = (file?: File) => {
    if (!file) return;
    setProfileImage(URL.createObjectURL(file));
  };

  const handleCreateAccount = () => {
    if (!canCreateAccount) return;

    localStorage.setItem(
      "bookmorakUser",
      JSON.stringify({
        nickname: finalNickname,
        tag,
        profileImage,
      })
    );

    router.push("/home");
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative w-full max-w-[403px] h-[874px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image src="/images/onboarding/back.svg" alt="" width={11} height={20} priority />
        </button>

        <h1 className="absolute left-0 top-[79px] w-full text-center text-[18px] font-bold leading-[24px] tracking-[-0.025em] text-black">
          계정 생성
        </h1>

        <p className="absolute left-[82px] top-[123px] text-[14px] text-[#9A9A9A]">
          책모락에서 이용할 계정을 만들어 주세요.
        </p>

        <p className="absolute left-[30px] top-[172px] text-[14px] font-bold text-black">
          프로필 사진 등록
        </p>

        <div className="absolute left-[131px] top-[205px] h-[142px] w-[142px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[142px] w-[142px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#FEF6E4] text-[15px] text-[#FFBA1A] transition-transform active:scale-[0.98]"
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
          <p className="text-[14px] font-bold text-black">닉네임</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={nickname}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder={recommendedNickname}
              className="absolute left-[14px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[15px] text-black outline-none placeholder:text-[#9A9A9A]"
            />
          </div>

          <div className="mt-[4px] flex w-full items-center justify-between">
            <p className="text-[12px] text-[#9A9A9A]">
              닉네임은 10자 이내로 한글로만 가능합니다.
            </p>
            <p className="text-[10px] text-[#9A9A9A]">{nickname.length}/10</p>
          </div>

          <p className="mt-[24px] text-[14px] font-bold text-black">태그</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={`# ${tag}`}
              readOnly
              tabIndex={-1}
              className="absolute left-[14px] top-1/2 h-[24px] w-[300px] -translate-y-1/2 bg-transparent text-[15px] text-[#9A9A9A] outline-none"
            />
          </div>

          <p className="mt-[24px] text-[14px] font-bold text-black">비밀번호</p>

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

          <p className="mt-[4px] text-[12px] text-[#9A9A9A]">
            비밀번호는 영어, 숫자, 특수문화를 포함하여, 8~16자 이내로 가능합니다.
          </p>
        </div>

        <button
          disabled={!canCreateAccount}
          onClick={handleCreateAccount}
          className={`absolute left-[14px] top-[795px] flex h-[52px] w-[374px] items-center justify-center rounded-[8px] text-[16px] font-bold text-white transition-transform ${
            canCreateAccount
              ? "cursor-pointer bg-[#FFBA1A] active:scale-[0.98]"
              : "cursor-not-allowed bg-[#9A9A9A]"
          }`}
        >
          계정 생성하기
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
        className="absolute left-[14px] top-1/2 h-[24px] w-[330px] -translate-y-1/2 bg-transparent text-[15px] text-black outline-none placeholder:text-[#9A9A9A]"
      />
    </div>
  );
}