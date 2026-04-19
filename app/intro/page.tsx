"use client";

import { useEffect, useRef, useState } from "react";
import RocketLogoAnimation from "@/components/rocket-logo-animation";
import { useRouter } from "next/navigation";
import { playIntroAudio } from "@/lib/intro-audio";

interface IntroPageProps {
  onFinish?: () => void;
}

export default function IntroPage({ onFinish }: IntroPageProps) {
  const router = useRouter();
  const [animationStarted, setAnimationStarted] = useState(false);
  const [gateVisible, setGateVisible] = useState(true);
  const swooshAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const canvas = document.getElementById("stars-intro") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.2,
      alpha: Math.random() * 0.6 + 0.25,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    }));

    let animationId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();
        star.x += star.dx;
        star.y += star.dy;
        if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleAnimationComplete = () => {
    sessionStorage.setItem("introShown", "true");

    setTimeout(() => {
      stopSwooshAudio();
      if (onFinish) {
        onFinish();
      } else {
        router.push("/starters");
      }
    }, 380);
  };

  const handleStart = () => {
    if (animationStarted) return;
    void playIntroAudio({ loop: true, volume: 0.58, restart: true });
    setAnimationStarted(true);
    requestAnimationFrame(() => {
      setGateVisible(false);
    });
  };

  const playMergeSwoosh = () => {
    try {
      let swoosh = swooshAudioRef.current;
      if (!swoosh) {
        swoosh = new Audio("/rocket_whoosh.wav");
        swooshAudioRef.current = swoosh;
      }
      swoosh.currentTime = 0;
      swoosh.volume = 0.62;
      void swoosh.play();
    } catch {
      // Ignore playback errors from browser policies.
    }
  };

  const stopSwooshAudio = () => {
    try {
      if (swooshAudioRef.current) {
        swooshAudioRef.current.pause();
        swooshAudioRef.current.currentTime = 0;
      }
    } catch {
      // best-effort cleanup
    }
  };

  useEffect(() => {
    return () => {
      stopSwooshAudio();
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${animationStarted ? "opacity-100" : "opacity-0"}`}
      >
        {animationStarted && (
          <RocketLogoAnimation
            onComplete={handleAnimationComplete}
            onMergeSwoosh={playMergeSwoosh}
            autoStart={true}
          />
        )}
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-in-out ${gateVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <canvas id="stars-intro" className="absolute inset-0 w-full h-full" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-3">
          <button
            onClick={handleStart}
            className="fly-in-flash text-6xl font-extrabold text-white transition-all duration-300 hover:text-gray-300 hover:scale-110 cursor-pointer"
          >
            <span>FLY IN!</span>
          </button>
          <p className="text-sm text-gray-400 tracking-wider">Click Fly In to start</p>
        </div>
      </div>
    </div>
  );
}
