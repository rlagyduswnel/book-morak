"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { fetchProfileById, updateProfile } from "@/lib/auth";

const DEFAULT_BIO = "책 이야기가 모락모락 피어나는 곳";

export default function MyEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

      const profile = await fetchProfileById(user.id);
      if (!isMounted) return;

      setUserId(user.id);
      setEmail(user.email ?? "");
      setNickname(profile?.nickname ?? "");
      setBio(profile?.bio ?? DEFAULT_BIO);
      setProfileImage(profile?.profileImage ?? null);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [router]);

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
    setIsPhotoMenuOpen(false);
  };

  const canSave = nickname.trim().length > 0 && !isSubmitting;

  const handleSave = async () => {
    if (!userId || !canSave) return;

    setIsSubmitting(true);

    try {
      await updateProfile({
        userId,
        nickname: nickname.trim(),
        bio: bio.trim() || DEFAULT_BIO,
        profileImage,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex justify-center bg-white">
      <section className="relative h-[874px] w-full max-w-[402px] overflow-hidden bg-white">
        {/* 상단 영역 */}
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
            프로필 편집
          </h1>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`absolute bottom-0 right-[14px] text-[16px] font-bold transition-transform active:scale-[0.98] ${
              canSave
                ? "cursor-pointer text-[#FFBA1A]"
                : "cursor-not-allowed text-[#9A9A9A]"
            }`}
          >
            완료
          </button>
        </header>

        {/* 프로필 사진 */}
        <div className="absolute left-1/2 top-[115px] h-[142px] w-[142px] -translate-x-1/2">
          <div className="h-[142px] w-[142px] overflow-hidden rounded-full bg-[#FEF6E4]">
            <img
              src={profileImage || "/images/home/normal.svg"}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <button
            onClick={() => setIsPhotoMenuOpen((prev) => !prev)}
            className="absolute bottom-0 right-0 flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#FFBA1A] transition-transform active:scale-[0.98]"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-[18px] w-[18px] text-white"
            >
              <path
                d="M7 4l-1 2H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-3l-1-2H7z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="12" r="3" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>

          {isPhotoMenuOpen && (
            <div className="absolute left-[110px] top-[90px] z-30 w-[104px] overflow-hidden rounded-[8px] border border-[#E0E0E0] bg-white shadow-sm">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-[34px] w-full cursor-pointer text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
              >
                변경하기
              </button>

              <button
                onClick={() => {
                  setProfileImage(null);
                  setIsPhotoMenuOpen(false);
                }}
                className="h-[34px] w-full cursor-pointer border-t border-[#E0E0E0] text-[13px] font-normal text-black transition-colors hover:bg-[#FAFAFA]"
              >
                기본 프로필
              </button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageChange(e.target.files?.[0])}
        />

        {/* 소개 */}
        <div className="absolute left-[14px] top-[272px] w-[374px]">
          <p className="text-[16px] text-black">소개</p>

          <div className="relative mt-[4px] h-[52px] w-[374px] rounded-[8px] border border-[#E0E0E0] bg-white">
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 15))}
              placeholder={DEFAULT_BIO}
              className="absolute left-[14px] top-1/2 h-[24px] w-[280px] -translate-y-1/2 bg-transparent text-[16px] text-black outline-none placeholder:text-[#9A9A9A]"
            />

            <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-normal text-[#9A9A9A]">
              {bio.length}/15
            </span>
          </div>
        </div>

        {/* 설정 리스트 */}
        <div className="absolute left-0 top-[362px] w-[402px]">
          <div className="border-t border-[#E0E0E0] px-[14px] py-[16px]">
            <div className="flex items-center gap-[16px]">
              <p className="w-[62px] shrink-0 text-[16px] text-black">
                닉네임
              </p>

              <div className="relative h-[44px] flex-1 rounded-[8px] border border-[#E0E0E0] bg-white">
                <input
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  className="absolute left-[14px] top-1/2 h-[24px] w-[calc(100%-72px)] -translate-y-1/2 bg-transparent text-[16px] text-black outline-none"
                />

                <span className="absolute right-[34px] top-1/2 -translate-y-1/2 text-[12px] font-normal text-[#9A9A9A]">
                  {nickname.length}/10
                </span>

                {nickname.length > 0 && (
                  <button
                    onClick={() => setNickname("")}
                    className="absolute right-[10px] top-1/2 flex h-[16px] w-[16px] -translate-y-1/2 cursor-pointer items-center justify-center"
                  >
                    <Image
                      src="/images/onboarding/X.svg"
                      alt=""
                      width={16}
                      height={16}
                    />
                  </button>
                )}
              </div>
            </div>

            {nickname.trim().length > 0 && (
              <p className="mt-[6px] pl-[78px] text-[12px] font-normal text-[#FFBA1A]">
                사용 가능한 닉네임이에요.
              </p>
            )}
          </div>

          <div className="border-t border-[#E0E0E0] px-[14px] py-[16px]">
            <div className="flex items-center gap-[16px]">
              <p className="w-[62px] shrink-0 text-[16px] text-black">
                이메일
              </p>
              <p className="flex-1 truncate text-[16px] text-black">
                {email}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/my/edit/password")}
            className="flex w-full cursor-pointer items-center gap-[16px] border-t border-b border-[#E0E0E0] px-[14px] py-[16px] text-left transition-transform active:scale-[0.98]"
          >
            <p className="w-[62px] shrink-0 text-[16px] text-black">
              비밀번호
            </p>
            <p className="flex-1 text-[16px] text-[#FFBA1A]">
              비밀번호 변경
            </p>
            <Image
              src="/images/home/next.svg"
              alt=""
              width={6.36}
              height={12.71}
            />
          </button>
        </div>

        {showToast && (
          <div className="absolute left-[24px] top-[724px] z-30 flex h-[48px] w-[355px] items-center justify-center rounded-[24px] bg-black/75 text-[13px] text-white">
            변경되었습니다.
          </div>
        )}
      </section>
    </main>
  );
}
