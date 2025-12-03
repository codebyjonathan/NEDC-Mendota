"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import of IntroPage to avoid SSR issues
const IntroPage = dynamic(() => import("../intro/page"), { ssr: false });
// Dynamic import of HomePage now in home/page.tsx
const HomePage = dynamic(() => import("../home/page"), { ssr: false });

export default function Starters() {
  const [showHome, setShowHome] = useState(false);
  const [fadeInHome, setFadeInHome] = useState(false);

  // Trigger fade-in when HomePage mounts
  useEffect(() => {
    if (showHome) {
      const timer = setTimeout(() => setFadeInHome(true), 50);
      return () => clearTimeout(timer);
    }
  }, [showHome]);

  return (
    <>
      {!showHome && <IntroPage onFinish={() => setShowHome(true)} />}

      {showHome && (
        <div className={`transition-opacity duration-700 ${fadeInHome ? "opacity-100" : "opacity-0"}`}>
          <HomePage />
        </div>
      )}
    </>
  );
}