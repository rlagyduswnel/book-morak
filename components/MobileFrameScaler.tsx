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
      const widthScale = window.innerWidth / FRAME_WIDTH;
      const heightScale = window.innerHeight / FRAME_HEIGHT;
      // 화면이 프레임보다 작을 때만 줄이고, 데스크탑처럼 큰 화면에서는
      // 원래 크기(1배) 그대로 두어요.
      // 양옆(또는 위아래) 여백을 살짝 줄이기 위해 약간만 더 확대해요.
      const rawScale = Math.min(widthScale, heightScale);
      setScale(Math.min(1, rawScale * 1.05));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
      window.removeEventListener("orientationchange", updateScale);
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
