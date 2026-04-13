"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface RocketLogoAnimationProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function RocketLogoAnimation({
  onComplete,
  autoStart = true,
}: RocketLogoAnimationProps) {
  const [phase, setPhase] = useState<"idle" | "orbit" | "return" | "merge" | "complete">("idle");
  const [starfield, setStarfield] = useState<boolean>(true);

  useEffect(() => {
    if (!autoStart) return;
    
    // Start animation automatically
    const timer = setTimeout(() => {
      setPhase("orbit");
    }, 500);
    
    return () => clearTimeout(timer);
  }, [autoStart]);

  useEffect(() => {
    if (phase !== "orbit") return;

    // After orbit completes (1s), start return phase
    const timer = setTimeout(() => {
      setPhase("return");
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "return") return;

    // After return completes (0.75s), merge phase
    const timer = setTimeout(() => {
      setPhase("merge");
    }, 750);

    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "merge") return;

    // After merge completes (1.2s), complete phase
    const timer = setTimeout(() => {
      setPhase("complete");
      if (onComplete) {
        onComplete();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  // Starfield effect
  useEffect(() => {
    const canvas = document.getElementById("stars-animation") as HTMLCanvasElement;
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

  // Play audio when orbit starts
  useEffect(() => {
    if (phase === "orbit") {
      const audio = new Audio("/rocket_whoosh.wav");
      audio.volume = 0.4;
      audio.play().catch(() => {
        // Audio play might fail in some browsers, that's okay
      });
    }
  }, [phase]);

  const baseOpacity = phase === "complete" ? "opacity-0" : "opacity-100";
  const canvasOpacity = starfield && phase !== "complete" ? "opacity-100" : "opacity-0";

  return (
    <div
      className={`w-full h-screen bg-black flex items-center justify-center relative overflow-hidden transition-opacity duration-1000 ${baseOpacity}`}
    >
      <canvas
        id="stars-animation"
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${canvasOpacity}`}
      />

      {/* Visible content during animation phases */}
      {phase !== "complete" && (
        <>
          {/* Rocket - Different animation phases */}
          <div
            className={`absolute w-32 h-32 transition-all duration-500 ${
              phase === "orbit"
                ? "rocket-circular-orbit"
                : phase === "return"
                  ? "rocket-return-center"
                  : phase === "merge"
                    ? "rocket-glow-pulse"
                    : "rocket-final-center"
            }`}
            style={{
              top: "50%",
              left: "50%",
              filter: "drop-shadow(0 0 20px #ff6f61) drop-shadow(0 0 30px #ff6f61)",
            }}
          >
            <Image
              src="/rocket.png"
              alt="Rocket"
              width={120}
              height={120}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Heart - Fades in during return phase */}
          <div
            className={`absolute w-40 h-40 transition-all duration-700 ${
              phase === "return" || phase === "merge"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            }`}
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 40,
            }}
          >
            <Image
              src="/heart.png"
              alt="Heart"
              width={160}
              height={160}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Glow effect during merge */}
          <div
            className={`absolute w-48 h-48 rounded-full blur-3xl transition-all duration-700 ${
              phase === "merge" ? "opacity-60 scale-100" : "opacity-0 scale-50"
            }`}
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255, 111, 97, 0.4) 0%, rgba(255, 111, 97, 0.1) 100%)",
              zIndex: 35,
            }}
          />
        </>
      )}

      {/* Final Logo (complete phase, visible in next screen) */}
      {phase === "complete" && (
        <div className="absolute w-40 h-40">
          <Image
            src="/logo.png"
            alt="Logo"
            width={160}
            height={160}
            priority
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
