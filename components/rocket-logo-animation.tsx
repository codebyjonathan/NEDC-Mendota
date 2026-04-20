"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

interface RocketLogoAnimationProps {
  onComplete?: () => void;
  autoStart?: boolean;
  onMergeSwoosh?: () => void;
}

type Viewport = {
  width: number;
  height: number;
};

type Point = {
  x: number;
  y: number;
};

const ANIMATION_SPEED_MULTIPLIER = 0.58;

const TIMING = {
  starDrop: 1450 * ANIMATION_SPEED_MULTIPLIER,
  starGlow: 1000 * ANIMATION_SPEED_MULTIPLIER,
  travel: 4600 * ANIMATION_SPEED_MULTIPLIER,
  loop: 3200 * ANIMATION_SPEED_MULTIPLIER,
  merge: 1400 * ANIMATION_SPEED_MULTIPLIER,
  hold: 600 * ANIMATION_SPEED_MULTIPLIER,
};

const T = {
  starStart: 0,
  glowStart: TIMING.starDrop,
  travelStart: TIMING.starDrop + TIMING.starGlow,
  loopStart: TIMING.starDrop + TIMING.starGlow + TIMING.travel,
  mergeStart: TIMING.starDrop + TIMING.starGlow + TIMING.travel + TIMING.loop,
};

const TOTAL_DURATION =
  TIMING.starDrop +
  TIMING.starGlow +
  TIMING.travel +
  TIMING.loop +
  TIMING.merge +
  TIMING.hold;

const PLANETS = [
  { size: 180, y: -0.34, colorA: "#ffe9b8", colorB: "#be7d2e", ring: true, depth: 0.42 },
  { size: 128, y: 0.23, colorA: "#d8f0ff", colorB: "#4a7ac9", ring: false, depth: 0.7 },
  { size: 220, y: 0.07, colorA: "#ffd9ef", colorB: "#8750cc", ring: true, depth: 0.34 },
  { size: 142, y: -0.16, colorA: "#d7ffe2", colorB: "#2b9f77", ring: false, depth: 0.62 },
  { size: 260, y: 0.33, colorA: "#ffe1d1", colorB: "#b25b53", ring: true, depth: 0.24 },
  { size: 154, y: -0.28, colorA: "#ffecc7", colorB: "#9f6e2e", ring: false, depth: 0.56 },
  { size: 198, y: 0.18, colorA: "#e1dcff", colorB: "#5f51ba", ring: true, depth: 0.38 },
  { size: 116, y: -0.02, colorA: "#d4fff4", colorB: "#2a9a8f", ring: false, depth: 0.76 },
];

const DUST = [
  { x: 8, y: 20, size: 2, delay: 0, dur: 12 },
  { x: 14, y: 62, size: 3, delay: 0.8, dur: 10 },
  { x: 23, y: 42, size: 2, delay: 1.1, dur: 11 },
  { x: 32, y: 76, size: 1, delay: 0.4, dur: 9 },
  { x: 46, y: 30, size: 2, delay: 1.5, dur: 13 },
  { x: 58, y: 55, size: 3, delay: 0.2, dur: 9 },
  { x: 63, y: 15, size: 1, delay: 0.9, dur: 14 },
  { x: 72, y: 70, size: 2, delay: 1.6, dur: 10 },
  { x: 84, y: 38, size: 2, delay: 0.6, dur: 11 },
  { x: 91, y: 60, size: 3, delay: 1.2, dur: 12 },
];

// Relative heart anchor inside the logo image.
// x: horizontal shift from logo center, y: vertical shift from logo center.
const HEART_ANCHOR = {
  x: 0,
  y: -0.12,
};

// Angle of the rocket drawn inside the heart logo (screen-space degrees).
// 0deg = pointing right, negative = tilting up.
const HEART_ROCKET_ANGLE = -50;
const HEART_ROCKET_ANGLE_CONTINUOUS = 360 + HEART_ROCKET_ANGLE;

// Fine-tune how the flying sprite center lands into the heart rocket center.
const HEART_MERGE_OFFSET = {
  x: 12,
  y: -42,
};

// Final scale of the flying rocket when it overlays the logo rocket.
const HEART_MERGE_SCALE = 0.9;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * Math.pow(t, 4) : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function segmentProgress(elapsed: number, start: number, duration: number) {
  return clamp01((elapsed - start) / duration);
}

function blendAngleDeg(current: number, target: number, t: number) {
  let adjusted = target;
  while (adjusted - current > 180) adjusted -= 360;
  while (adjusted - current < -180) adjusted += 360;
  return lerp(current, adjusted, t);
}

export default function RocketLogoAnimation({
  onComplete,
  autoStart = true,
  onMergeSwoosh,
}: RocketLogoAnimationProps) {
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ width: 1280, height: 720 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hasCompletedRef = useRef(false);
  const hasPlayedMergeSwooshRef = useRef(false);
  const motionRef = useRef({ warp: 1, travelPulse: 0 });

  useEffect(() => {
    if (!autoStart) return;
    const timer = setTimeout(() => setStarted(true), 90);
    return () => clearTimeout(timer);
  }, [autoStart]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const applySize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    applySize();
    window.addEventListener("resize", applySize);

    return () => {
      window.removeEventListener("resize", applySize);
    };
  }, []);

  useEffect(() => {
    if (!started) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setElapsed(TOTAL_DURATION);
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.();
      }
      return;
    }

    let raf = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const nextElapsed = Math.min(now - start, TOTAL_DURATION);
      setElapsed(nextElapsed);

      if (nextElapsed < TOTAL_DURATION) {
        raf = window.requestAnimationFrame(tick);
      } else if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onComplete?.();
      }
    };

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [started, onComplete]);

  useEffect(() => {
    if (!started) return;
    if (hasPlayedMergeSwooshRef.current) return;

    const swooshTriggerAt = Math.max(0, T.mergeStart + TIMING.merge * 0.78 - 1500);
    if (elapsed >= swooshTriggerAt) {
      hasPlayedMergeSwooshRef.current = true;
      onMergeSwoosh?.();
    }
  }, [elapsed, started, onMergeSwoosh]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.65 + 0.25,
      alpha: Math.random() * 0.55 + 0.25,
      speed: Math.random() * 0.85 + 0.2,
    }));

    let raf = 0;

    const render = () => {
      const { width, height } = viewport;
      const ratio = window.devicePixelRatio || 1;
      const renderWidth = Math.max(1, Math.floor(width * ratio));
      const renderHeight = Math.max(1, Math.floor(height * ratio));

      if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
        canvas.width = renderWidth;
        canvas.height = renderHeight;
      }

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const speed = motionRef.current.warp;

      for (const star of stars) {
        const sx = star.x * width;
        const sy = star.y * height;

        if (speed > 2.2) {
          const streakLength = Math.max(2, star.radius * speed * 3.8);
          const gradient = ctx.createLinearGradient(sx, sy, sx - streakLength, sy);
          gradient.addColorStop(0, `rgba(225,240,255,${Math.min(0.95, star.alpha + 0.24)})`);
          gradient.addColorStop(1, "rgba(225,240,255,0)");
          ctx.strokeStyle = gradient;
          ctx.lineWidth = Math.max(0.6, star.radius * 0.85);
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - streakLength, sy);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.fill();

        star.x -= (star.speed * speed) / width;
        if (star.x < -0.08) {
          star.x = 1.08 + Math.random() * 0.2;
          star.y = Math.random();
          star.alpha = Math.random() * 0.55 + 0.25;
          star.radius = Math.random() * 1.65 + 0.25;
        }
      }

      raf = window.requestAnimationFrame(render);
    };

    raf = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [viewport]);

  const loopRadius = Math.min(viewport.width, viewport.height) * 0.34;
  const loopStartX = 0;
  const loopStartY = -loopRadius;
  const logoSize = Math.max(124, Math.min(220, viewport.width * 0.19));
  const heartTarget = {
    x: logoSize * HEART_ANCHOR.x + HEART_MERGE_OFFSET.x,
    y: logoSize * HEART_ANCHOR.y + HEART_MERGE_OFFSET.y,
  };

  const starDropP = segmentProgress(elapsed, T.starStart, TIMING.starDrop);
  const starGlowP = segmentProgress(elapsed, T.glowStart, TIMING.starGlow);
  const travelP = segmentProgress(elapsed, T.travelStart, TIMING.travel);
  const loopP = segmentProgress(elapsed, T.loopStart, TIMING.loop);
  const travelLoopBlendStart = T.loopStart - 220;
  const travelLoopBlendDuration = 520;
  const travelLoopBlendP = segmentProgress(elapsed, travelLoopBlendStart, travelLoopBlendDuration);
  const mergeBlendStart = T.mergeStart;
  const mergeBlendDuration = TIMING.merge;
  const mergeBlendP = segmentProgress(elapsed, mergeBlendStart, mergeBlendDuration);

  let rocketPos: Point | null = null;
  let rocketRotation = 0;
  let rocketScale = 1;

  if (elapsed >= T.travelStart) {
    const computePoint = (time: number) => {
      const tTravel = easeInOutCubic(segmentProgress(time, T.travelStart, TIMING.travel));
      const travelX = lerp(-viewport.width * 0.6, loopStartX, tTravel);
      const travelY =
        lerp(viewport.height * 0.12, loopStartY, tTravel) +
        Math.sin(segmentProgress(time, T.travelStart, TIMING.travel) * Math.PI * 5.2) *
          viewport.height *
          0.012 *
          Math.pow(1 - tTravel, 2);

      const tOrbit = easeInOutCubic(segmentProgress(time, T.loopStart, TIMING.loop));
      const theta = Math.PI * 2 * tOrbit;
      const orbitX = loopRadius * Math.sin(theta);
      const orbitY = -loopRadius * Math.cos(theta);

      const loopBridgeP = easeInOutCubic(segmentProgress(time, travelLoopBlendStart, travelLoopBlendDuration));
      const inwardP = easeInOutCubic(segmentProgress(time, mergeBlendStart, mergeBlendDuration));
      const inwardOrbitX = lerp(orbitX, heartTarget.x, inwardP);
      const inwardOrbitY = lerp(orbitY, heartTarget.y, inwardP);

      return {
        x: lerp(travelX, inwardOrbitX, loopBridgeP),
        y: lerp(travelY, inwardOrbitY, loopBridgeP),
        loopBridgeP,
        inwardP,
      };
    };

    const now = computePoint(elapsed);
    const next = computePoint(elapsed + 16);
    const pathAngle = (Math.atan2(next.y - now.y, next.x - now.x) * 180) / Math.PI;
    const startFacingP = easeInOutCubic(segmentProgress(elapsed, T.travelStart + 220, 820));
    const travelFacingAngle = blendAngleDeg(0, pathAngle, startFacingP);
    const loopEntryLockP = easeInOutCubic(segmentProgress(elapsed, T.loopStart - 320, 260));
    const preLoopAngle = blendAngleDeg(travelFacingAngle, 0, loopEntryLockP);
    const loopSpinAngle = 360 * easeInOutCubic(loopP);
    const intoLoopSpinP = easeInOutCubic(segmentProgress(elapsed, T.loopStart - 40, 220));
    const spinReadyAngle = blendAngleDeg(preLoopAngle, loopSpinAngle, intoLoopSpinP);
    const alignP = easeInOutCubic(segmentProgress(elapsed, T.mergeStart + TIMING.merge * 0.08, TIMING.merge * 0.74));

    const travelScale = lerp(0.9, 1.03, easeInOutCubic(travelP));
    const orbitScale = 1 - Math.sin(Math.min(1, loopP) * Math.PI) * 0.03;
    const mergedScale = lerp(orbitScale, HEART_MERGE_SCALE, now.inwardP);

    rocketPos = { x: now.x, y: now.y };
    rocketRotation = blendAngleDeg(spinReadyAngle, HEART_ROCKET_ANGLE_CONTINUOUS, alignP);
    rocketScale = lerp(travelScale, mergedScale, now.loopBridgeP);
  }

  const starY = (() => {
    if (starDropP <= 0) return -viewport.height * 0.62;

    if (starDropP < 0.78) {
      return lerp(-viewport.height * 0.62, viewport.height * 0.06, easeOutQuint(starDropP / 0.78));
    }

    const settle = clamp01((starDropP - 0.78) / 0.22);
    return lerp(viewport.height * 0.06, 0, easeInOutCubic(settle)) + Math.sin(settle * Math.PI * 2.2) * 5 * (1 - settle);
  })();

  const starOpacity = (() => {
    if (elapsed < T.travelStart) return 1;
    return 1 - easeOutQuint(segmentProgress(elapsed, T.travelStart, 800));
  })();

  const activation = starGlowP;
  const finalLockP = segmentProgress(mergeBlendP, 0.9, 0.1);
  const mergeFlash = finalLockP > 0 ? Math.sin(finalLockP * Math.PI) : 0;
  const mergeLockGlow = elapsed < T.mergeStart
    ? 0
    : easeInOutCubic(segmentProgress(mergeBlendP, 0.82, 0.16));

  const logoOpacity = (() => {
    // Keep hidden until final approach, reveal while rocket is already moving inward.
    return clamp01(segmentProgress(mergeBlendP, 0.72, 0.24));
  })();

  const logoScale = lerp(0.97, 1.02, Math.sin(Math.min(1, mergeBlendP) * Math.PI) * 0.85);

  const warp = (() => {
    if (elapsed < T.travelStart) return 1.05;
    const travelWarp = lerp(1.8, 10.6, easeInOutCubic(segmentProgress(elapsed, T.travelStart, TIMING.travel * 0.8)));
    const loopWarp = lerp(10.6, 3.2, easeInOutCubic(segmentProgress(elapsed, T.loopStart - 420, TIMING.loop + 640)));
    const finalWarp = lerp(3.2, 1.15, easeInOutCubic(mergeBlendP));
    const travelToLoop = lerp(travelWarp, loopWarp, easeInOutCubic(segmentProgress(elapsed, T.loopStart - 260, 620)));
    return lerp(travelToLoop, finalWarp, easeInOutCubic(segmentProgress(mergeBlendP, 0.62, 0.38)));
  })();

  const flamePower = (() => {
    if (elapsed < T.travelStart) return 0;
    const travelFlame = lerp(0.78, 1.18, easeInOutCubic(travelP));
    const loopFlame = lerp(1.04, 0.82, easeInOutCubic(loopP));
    const finalFlame = lerp(0.82, 0.35, easeInOutCubic(mergeBlendP));
    const travelToLoop = lerp(travelFlame, loopFlame, easeInOutCubic(segmentProgress(elapsed, T.loopStart - 260, 620)));
    return lerp(travelToLoop, finalFlame, easeInOutCubic(segmentProgress(mergeBlendP, 0.62, 0.38)));
  })();

  motionRef.current.warp = warp;
  motionRef.current.travelPulse = flamePower;

  const cameraDrift = useMemo(() => {
    if (elapsed < T.travelStart) return { x: 0, y: 0, scale: 1 };

    const travelDriftP = easeInOutCubic(travelP);
    const loopBridgeP = easeInOutCubic(travelLoopBlendP);
    const orbitPulse = Math.sin(loopP * Math.PI * 2);
    const orbitPulseY = Math.cos(loopP * Math.PI * 2);
    const settleP = easeInOutCubic(mergeBlendP);

    const baseX = lerp(0, -20, travelDriftP);
    const baseY = lerp(0, -8, travelDriftP);
    const loopX = baseX + orbitPulse * 5.5;
    const loopY = baseY + orbitPulseY * 3.8;
    const x = lerp(lerp(baseX, loopX, loopBridgeP), 0, settleP);
    const y = lerp(lerp(baseY, loopY, loopBridgeP), 0, settleP);
    const scale = lerp(lerp(1, 1.045, travelDriftP), 1, settleP);

    return { x, y, scale };
  }, [elapsed, travelP, loopP, travelLoopBlendP, mergeBlendP]);

  return (
    <div className="intro-stage">
      <div
        className="intro-cinematic-camera"
        style={{
          transform: `translate3d(${cameraDrift.x}px, ${cameraDrift.y}px, 0) scale(${cameraDrift.scale})`,
        }}
      >
        <div className="intro-nebula-layer" />
        <div className="intro-nebula-layer intro-nebula-layer-secondary" />

        <canvas ref={canvasRef} className="intro-star-canvas" />

        <div className="intro-dust-field" aria-hidden>
          {DUST.map((dust, index) => (
            <span
              key={`${dust.x}-${dust.y}-${index}`}
              className="intro-dust"
              style={{
                left: `${dust.x}%`,
                top: `${dust.y}%`,
                width: `${dust.size}px`,
                height: `${dust.size}px`,
                animationDelay: `${dust.delay}s`,
                animationDuration: `${dust.dur}s`,
              }}
            />
          ))}
        </div>

        <div className="intro-planets" aria-hidden>
          {PLANETS.map((planet, index) => {
            const progress = elapsed < T.travelStart
              ? 0
              : elapsed < T.loopStart
                ? travelP
                : 1 + loopP * 0.22;

            const x =
              viewport.width * (1.18 + index * 0.38 + (1 - planet.depth) * 0.32) -
              progress * viewport.width * (2.35 - planet.depth * 0.4);

            const y = viewport.height * (0.5 + planet.y);
            const zScale = 0.72 + planet.depth * 0.42;
            const opacity = elapsed < T.travelStart
              ? 0
              : elapsed < T.mergeStart
                ? 0.38 + planet.depth * 0.58
                : lerp(0.92, 0.25, mergeBlendP);

            return (
              <div
                key={`planet-${index}`}
                className={`intro-planet ${planet.ring ? "intro-planet-ringed" : ""}`}
                style={{
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  transform: `translate3d(${x}px, ${y}px, 0) scale(${zScale})`,
                  opacity,
                  ["--planet-color-a" as string]: planet.colorA,
                  ["--planet-color-b" as string]: planet.colorB,
                }}
              />
            );
          })}
        </div>

        <div className="intro-center-anchor" aria-hidden>
          <div
            className="intro-star"
            style={{
              transform: `translate3d(0, ${starY}px, 0) scale(${lerp(0.35, 1, clamp01(starDropP * 1.1))})`,
              opacity: starOpacity,
            }}
          />
          <div
            className="intro-star-glow"
            style={{
              opacity: clamp01(0.42 * starOpacity + activation * 0.7),
              transform: `scale(${1 + activation * 0.55})`,
            }}
          />
          <div
            className="intro-star-bloom"
            style={{
              opacity: clamp01(activation * 0.8),
              transform: `scale(${0.84 + activation * 1.05})`,
            }}
          />

          <div
            className="intro-center-logo"
            style={{
              opacity: logoOpacity,
              transform: `translate3d(-50%, -50%, 0) scale(${logoScale})`,
            }}
          >
            <Image
              src="/logo.png"
              alt="Safe Space Logo"
              width={200}
              height={200}
              priority
              className="intro-logo-image"
            />
          </div>

          {rocketPos && (
            <div
              className="intro-rocket-wrap"
              style={{
                transform: `translate3d(${rocketPos.x}px, ${rocketPos.y}px, 0) rotate(${rocketRotation}deg) scale(${rocketScale})`,
                opacity: mergeBlendP > 0.95 ? lerp(1, 0, segmentProgress(mergeBlendP, 0.95, 0.05)) : 1,
                filter: `drop-shadow(0 0 ${16 + mergeLockGlow * 20}px rgba(255, 194, 130, ${0.45 + mergeLockGlow * 0.45}))`,
              }}
            >
              <span
                className="intro-rocket-trail"
                style={{
                  opacity: clamp01(flamePower),
                  transform: `scaleX(${0.8 + flamePower * 0.85})`,
                }}
              />
              <span
                className="intro-rocket-flame-main"
                style={{
                  opacity: clamp01(0.6 + flamePower * 0.45),
                  transform: `scaleX(${0.88 + flamePower * 0.95}) scaleY(${0.84 + flamePower * 0.46})`,
                }}
              />
              <span
                className="intro-rocket-flame-core"
                style={{
                  opacity: clamp01(0.7 + flamePower * 0.3),
                  transform: `scaleX(${0.78 + flamePower * 0.64})`,
                }}
              />

              <div className="intro-rocket-shell">
                <Image
                  src="/horizontal_rocket.png"
                  alt="Rocket"
                  width={320}
                  height={170}
                  priority
                  className="intro-rocket-image"
                />
                <span className="intro-rocket-specular" />
                <span className="intro-rocket-shadow" />
              </div>
            </div>
          )}

          <div
            className="intro-merge-flash"
            style={{
              opacity: mergeFlash,
              transform: `translate3d(${heartTarget.x}px, ${heartTarget.y}px, 0) scale(${1 + mergeFlash * 0.35})`,
            }}
          />
        </div>

        <div className="intro-vignette" />
      </div>
    </div>
  );
}
