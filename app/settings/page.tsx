"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { deleteAccount, signOut } from "@/lib/auth";

const APP_VERSION = "1.0.0";

type InfoModalType = "terms" | "privacy" | null;
type ConfirmType = "logout" | "delete" | null;

export default function SettingsPage() {
  const router = useRouter();

  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);
  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");

  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }
    };

    load();

    fetch("/data/terms.txt")
      .then((res) => res.text())
      .then(setTermsText);

    fetch("/data/privacy.txt")
      .then((res) => res.text())
      .then(setPrivacyText);
  }, [router]);

  const infoModalTitle =
    infoModalType === "terms"
      ? "이용약관"
      : infoModalType === "privacy"
      ? "개인정보 처리방침"
      : "";

  const infoModalContent =
    infoModalType === "terms"
      ? termsText
      : infoModalType === "privacy"
      ? privacyText
      : "";

  const handleLogout = async () => {
    setIsProcessing(true);

    try {
      await signOut();
      router.push("/");
    } finally {
      setIsProcessing(false);
      setConfirmType(null);
    }
  };

  const handleDeleteAccount = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      await deleteAccount();
      router.push("/");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "계정 삭제에 실패했습니다. 다시 시도해 주세요."
      );
      setIsProcessing(false);
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
            설정
          </h1>
        </header>

        <div className="absolute left-[14px] top-[115px] w-[374px]">
          <p className="text-[18px] font-bold text-black">서비스 정보</p>

          <div className="mt-[15px] rounded-[12px] border border-[#E0E0E0] p-[16px]">
            <p className="text-[16px] text-black">현재 버전</p>
            <p className="mt-[4px] text-[16px] text-[#FFBA1A]">
              버전 {APP_VERSION}
            </p>
          </div>

          <button
            onClick={() => setInfoModalType("terms")}
            className="relative mt-[12px] flex w-full cursor-pointer items-center rounded-[12px] border border-[#E0E0E0] p-[16px] text-left transition-transform active:scale-[0.98]"
          >
            <div>
              <p className="text-[16px] text-black">이용약관 정보</p>
              <p className="mt-[4px] text-[16px] text-[#FFBA1A]">
                서비스 이용약관을 확인할 수 있어요
              </p>
            </div>

            <Image
              src="/images/home/next.svg"
              alt=""
              width={6.36}
              height={12.71}
              className="absolute right-[16px] top-1/2 -translate-y-1/2"
            />
          </button>

          <button
            onClick={() => setInfoModalType("privacy")}
            className="relative mt-[12px] flex w-full cursor-pointer items-center rounded-[12px] border border-[#E0E0E0] p-[16px] text-left transition-transform active:scale-[0.98]"
          >
            <div>
              <p className="text-[16px] text-black">개인정보 정보</p>
              <p className="mt-[4px] text-[16px] text-[#FFBA1A]">
                개인정보 처리방침을 확인할 수 있어요
              </p>
            </div>

            <Image
              src="/images/home/next.svg"
              alt=""
              width={6.36}
              height={12.71}
              className="absolute right-[16px] top-1/2 -translate-y-1/2"
            />
          </button>

          <p className="mt-[30px] text-[18px] font-bold text-black">
            계정 관리
          </p>

          <button
            onClick={() => setConfirmType("logout")}
            className="relative mt-[15px] flex w-full cursor-pointer items-center rounded-[12px] border border-[#E0E0E0] p-[16px] text-left transition-transform active:scale-[0.98]"
          >
            <div>
              <p className="text-[16px] text-black">로그아웃</p>
              <p className="mt-[4px] text-[16px] text-[#FFBA1A]">
                현재 계정에서 로그아웃 됩니다
              </p>
            </div>

            <Image
              src="/images/home/next.svg"
              alt=""
              width={6.36}
              height={12.71}
              className="absolute right-[16px] top-1/2 -translate-y-1/2"
            />
          </button>

          <button
            onClick={() => setConfirmType("delete")}
            className="relative mt-[12px] flex w-full cursor-pointer items-center rounded-[12px] border border-[#E0E0E0] p-[16px] text-left transition-transform active:scale-[0.98]"
          >
            <div>
              <p className="text-[16px] text-black">계정 삭제</p>
              <p className="mt-[4px] text-[16px] text-[#FFBA1A]">
                계정과 모든 데이터가 삭제됩니다
              </p>
            </div>

            <Image
              src="/images/home/next.svg"
              alt=""
              width={6.36}
              height={12.71}
              className="absolute right-[16px] top-1/2 -translate-y-1/2"
            />
          </button>

          {errorMessage && (
            <p className="mt-[16px] text-center text-[13px] font-normal text-red-500">
              {errorMessage}
            </p>
          )}
        </div>

        {/* 이용약관 / 개인정보 모달 */}
        {infoModalType && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-[24px]">
            <div className="relative h-[620px] w-full rounded-[16px] bg-white p-[20px]">
              <h2 className="text-[20px] font-bold text-black">
                {infoModalTitle}
              </h2>

              <div className="hide-scrollbar mt-[16px] h-[510px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-[20px] text-[#555555]">
                {infoModalContent}
              </div>

              <button
                onClick={() => setInfoModalType(null)}
                className="absolute bottom-[16px] left-[20px] flex h-[42px] w-[315px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[17px] text-white transition-transform active:scale-[0.98]"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* 로그아웃 / 계정삭제 확인 팝업 */}
        {confirmType && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-[24px]">
            <div className="w-full rounded-[16px] bg-white p-[24px]">
              <p className="text-center text-[16px] font-bold text-black">
                {confirmType === "logout"
                  ? "로그아웃 하시겠습니까?"
                  : "계정을 삭제하시겠습니까?"}
              </p>

              {confirmType === "delete" && (
                <p className="mt-[8px] text-center text-[13px] font-normal text-[#9A9A9A]">
                  복구하실 수 없습니다.
                </p>
              )}

              <div className="mt-[20px] flex gap-[10px]">
                <button
                  onClick={() => setConfirmType(null)}
                  disabled={isProcessing}
                  className="h-[48px] flex-1 cursor-pointer rounded-[8px] border border-[#E0E0E0] text-[16px] font-normal text-black transition-transform active:scale-[0.98]"
                >
                  취소
                </button>

                <button
                  onClick={
                    confirmType === "logout"
                      ? handleLogout
                      : handleDeleteAccount
                  }
                  disabled={isProcessing}
                  className="h-[48px] flex-1 cursor-pointer rounded-[8px] bg-[#FFBA1A] text-[16px] font-bold text-white transition-transform active:scale-[0.98]"
                >
                  {isProcessing
                    ? "처리 중..."
                    : confirmType === "logout"
                    ? "로그아웃"
                    : "계정 삭제"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
