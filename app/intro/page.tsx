
"use client";

import { useState, useEffect } from "react";
import RocketLogoAnimation from "@/components/rocket-logo-animation";
import { useRouter } from "next/navigation";

interface IntroPageProps {
  onFinish?: () => void;
}

export default function IntroPage({ onFinish }: IntroPageProps) {
  const [animationStarted, setAnimationStarted] = useState(false);
  const router = useRouter();

  // Starfield effect - hooks must be before any conditional returns
  useEffect(() => {
    const canvas = document.getElementById("stars-intro") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random() * 0.7 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }));

    let animationId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.x += s.dx;
        s.y += s.dy;
        if (s.x < 0 || s.x > canvas.width) s.dx = -s.dx;
        if (s.y < 0 || s.y > canvas.height) s.dy = -s.dy;
      });
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleAnimationComplete = () => {
    // Mark intro as shown and navigate after a brief delay
    sessionStorage.setItem("introShown", "true");
    
    setTimeout(() => {
      if (onFinish) {
        onFinish();
      } else {
        router.push("/starters");
      }
    }, 800);
  };

  const handleStart = () => {
    setAnimationStarted(true);
  };

  // Conditional rendering based on animation state
  if (animationStarted) {
    return (
      <RocketLogoAnimation onComplete={handleAnimationComplete} autoStart={true} />
    );
  }

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <canvas
        id="stars-intro"
        className="absolute inset-0 w-full h-full"
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <button
          onClick={handleStart}
          className="text-6xl font-extrabold text-white transition-all duration-300 hover:text-gray-300 hover:scale-110 cursor-pointer"
        >
          <span className="animate-pulse">FLY IN!</span>
        </button>
        <p className="text-sm text-gray-400 tracking-wider">Click to Start!</p>
      </div>
    </div>
  );
}