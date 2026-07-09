"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ModalType = "terms" | "privacy" | null;

export default function Step3Page() {
  const router = useRouter();

  const [ageChecked, setAgeChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [termsText, setTermsText] = useState("");
  const [privacyText, setPrivacyText] = useState("");

  const allChecked = ageChecked && termsChecked && privacyChecked;
  const canSignUp = ageChecked && termsChecked && privacyChecked;

  useEffect(() => {
    fetch("/data/terms.txt")
      .then((res) => res.text())
      .then(setTermsText);

    fetch("/data/privacy.txt")
      .then((res) => res.text())
      .then(setPrivacyText);
  }, []);

  const toggleAll = () => {
    const next = !allChecked;
    setAgeChecked(next);
    setTermsChecked(next);
    setPrivacyChecked(next);
  };

  const modalTitle =
    modalType === "terms"
      ? "이용약관"
      : modalType === "privacy"
      ? "개인정보 수집 및 이용 동의"
      : "";

  const modalContent =
    modalType === "terms"
      ? termsText
      : modalType === "privacy"
      ? privacyText
      : "";

  return (
    <main className="flex justify-center bg-white">
      <section className="relative w-full max-w-[403px] h-[874px] overflow-hidden bg-white">
        <button
          onClick={() => router.back()}
          className="absolute left-[28px] top-[81px] z-20 flex h-[20px] w-[20px] cursor-pointer items-center justify-center transition-transform active:scale-[0.98]"
        >
          <Image src="/images/onboarding/back.svg" alt="" width={11} height={20} priority />
        </button>

        <Image
          src="/images/onboarding/step3.svg"
          alt=""
          width={190}
          height={3}
          className="absolute left-[106px] top-[88px]"
          priority
        />

        <Image
          src="/images/onboarding/smile.svg"
          alt=""
          width={95}
          height={83}
          className="absolute left-[153px] top-[170px]"
          priority
        />

        <h1 className="absolute left-[70px] top-[282px] whitespace-pre-line text-[25px] font-bold leading-[35px] tracking-[0.02em] text-black">
          <span className="text-[#FFBA1A]">책</span>모락에서{"\n"}계속 이야기 나눠볼까요?
        </h1>

        <p className="absolute left-[70px] top-[362px] whitespace-pre-line text-[15px] leading-[18px] tracking-[0.02em] text-[#9A9A9A]">
          관심있는 책을 선택하고{"\n"}나만의 책 피드를 만들어보세요.
        </p>

        <div className="absolute left-[56px] top-[545px] flex h-[120px] w-[310px] flex-col gap-[8px]">
          <AgreementRow
            checked={allChecked}
            label="전체 동의합니다"
            onClick={toggleAll}
          />

          <AgreementRow
            checked={ageChecked}
            label="[필수] 만 14세 이상입니다"
            onClick={() => setAgeChecked((prev) => !prev)}
          />

          <AgreementRow
            checked={termsChecked}
            label="[필수] 이용약관 동의"
            linkText="[보기 >]"
            onClick={() => setTermsChecked((prev) => !prev)}
            onLinkClick={() => setModalType("terms")}
          />

          <AgreementRow
            checked={privacyChecked}
            label="[필수] 개인정보 수집 및 이용 동의"
            linkText="[보기 >]"
            onClick={() => setPrivacyChecked((prev) => !prev)}
            onLinkClick={() => setModalType("privacy")}
          />
        </div>

        <button
          disabled={!canSignUp}
          onClick={() => router.push("/signup")}
            className={`absolute left-[14px] top-[695px] flex h-[52px] w-[374px] items-center justify-center rounded-[8px] border text-[15px] font-bold transition-transform
         ${
           canSignUp
              ? "cursor-pointer border-[#FFBA1A] bg-[#FFBA1A] text-white active:scale-[0.98]"
               : "cursor-not-allowed border-[#E0E0E0] bg-white text-[#9A9A9A]"
            }`}
          >
            회원가입
          </button>

        {modalType && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 px-[24px]">
            <div className="relative h-[620px] w-full rounded-[16px] bg-white p-[20px]">
              <h2 className="text-[18px] font-bold text-black">{modalTitle}</h2>

              <div className="hide-scrollbar mt-[16px] h-[510px] overflow-y-auto whitespace-pre-wrap text-[12px] leading-[20px] text-[#555555]">
                {modalContent}
              </div>

              <button
                onClick={() => setModalType(null)}
                className="absolute bottom-[16px] left-[20px] flex h-[42px] w-[315px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[15px] text-white transition-transform active:scale-[0.98]"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function AgreementRow({
  checked,
  label,
  linkText,
  onClick,
  onLinkClick,
}: {
  checked: boolean;
  label: string;
  linkText?: string;
  onClick: () => void;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex h-[18px] items-center">
      <button
        onClick={onClick}
        className="relative h-[18px] w-[18px] shrink-0 cursor-pointer rounded-[5px] border border-[#E0E0E0] transition-transform active:scale-[0.98]"
      >
        {checked && (
          <Image
          src="/images/onboarding/checka.svg"
          alt=""
          width={12}
          height={12}
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          priority
          />
        )}
      </button>

      <span className="ml-[8px] whitespace-nowrap text-[14px] leading-[18px] text-[#9A9A9A]">
        {label}
      </span>

      {linkText && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLinkClick?.();
          }}
          className="ml-[4px] cursor-pointer whitespace-nowrap text-[14px] leading-[18px] text-[#9A9A9A] transition-transform active:scale-[0.98]"
        >
          {linkText}
        </button>
      )}
    </div>
  );
}