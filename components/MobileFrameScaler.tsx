"use client";

import { useEffect, useRef, useState } from "react";

const FRAME_WIDTH = 402;
const FRAME_HEIGHT = 874;

export default function MobileFrameScaler({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;

      const widthScale = window.innerWidth / FRAME_WIDTH;
      const heightScale = viewportHeight / FRAME_HEIGHT;
      // 화면이 프레임보다 작을 때만 줄이고, 데스크탑처럼 큰 화면에서는
      // 원래 크기(1배) 그대로 두어요. 잘리는 부분이 없도록 정확히 맞는
      // 비율만 사용해요 (일부러 더 키우지 않음).
      setScale(Math.min(1, widthScale, heightScale));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100vw",
        height: "100dvh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          width: `${FRAME_WIDTH}px`,
          height: `${FRAME_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
