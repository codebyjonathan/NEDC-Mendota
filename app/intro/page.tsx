"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface IntroPageProps {
  onFinish?: () => void;
}

export default function IntroPage({ onFinish }: IntroPageProps) {
  const [started, setStarted] = useState(false);
  const [fadeText, setFadeText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const handleStart = () => {
    setStarted(true);
    setFadeText(true);

    const audio = new Audio("/rocket_whoosh.wav");
    audio.volume = 0.4;
    audio.play();

    setTimeout(() => setFadeOut(true), 3200);

    setTimeout(() => {
      sessionStorage.setItem("introShown", "true");
      if (onFinish) onFinish();
    }, 3500);
  };

  // Starfield effect
  useEffect(() => {
    const canvas = document.getElementById("stars") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
    }));

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
      requestAnimationFrame(draw);
    };

    draw();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`w-full h-screen bg-black flex items-center justify-center relative overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <canvas id="stars" className="absolute inset-0 w-full h-full" />

      {!started && (
        <button
          onClick={handleStart}
          className={`text-6xl font-extrabold text-white transition-opacity duration-500 hover:text-gray-300 ${
            fadeText ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="animate-pulse">FLY IN!</span>
        </button>
      )}

      {started && (
        <Image
          src="/rocket.png"
          alt="Rocket"
          width={300}
          height={300}
          className="rocket-glow rocket-loop"
          priority
        />
      )}
    </div>
  );
}