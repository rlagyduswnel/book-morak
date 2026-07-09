import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex justify-center bg-white">
      <section className="relative w-full max-w-[403px] h-[874px] overflow-hidden bg-white">
        <Image
          src="/images/landing/background.svg"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <Image
          src="/images/landing/morak.svg"
          alt="모락이"
          width={240}
          height={210}
          priority
          className="absolute left-[81px] top-[213px]"
        />

        <Image
          src="/images/landing/logo.svg"
          alt="책모락"
          width={222}
          height={86}
          priority
          className="absolute left-[90px] top-[431px]"
        />

        <Image
          src="/images/landing/slogan.svg"
          alt="책 이야기가 모락모락 피어나는 곳"
          width={248}
          height={21}
          priority
          className="absolute left-[77px] top-[525px]"
        />

        <Link
          href="/onboarding/books"
          className="absolute left-[14px] top-[658px] flex h-[59px] w-[374px] cursor-pointer items-center justify-center rounded-[8px] bg-[#FFBA1A] text-[16px] font-normal text-white transition-transform active:scale-[0.98]"
        >
          시작하기
        </Link>

        <button className="absolute left-[14px] top-[729px] flex h-[59px] w-[374px] cursor-pointer items-center justify-center rounded-[8px] border border-[#FFBA1A] bg-white text-[16px] font-normal text-[#FFBA1A] transition-transform active:scale-[0.98]">
          로그인
        </button>
      </section>
    </main>
  );
}