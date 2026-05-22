"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import type { Language } from "@/lib/translations"

type GameKey = "pong" | "invaders" | "flappy" | "dino" | "memory"

type GameCenterProfile = {
  nickname: string
  suitColor: string
  helmetStyle: "classic" | "visor" | "gold" | "midnight"
  badge: "star" | "moon" | "planet" | "comet"
  updatedAt: string
}

type GameProgress = {
  pongVictories: number
  orbitCompletedPlanets: string[]
  flappyMilestones: number[]
  dinoBestScore: number
  memoryWins: number
}

const PLANETS = ["Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"]
let GC_MUTED = false
const GC_SFX = {
  shortJump: "/game-center/short_jump_sfx.mp4",
  longJump: "/game-center/long_jump_sfx.mp4",
  bubbleAchievement: "/game-center/bubble-achievement_sfx.mp4",
  invaderHit: "/game-center/invader_hit_sfx.mp4",
  pairSolved: "/game-center/pair_solved_sfx.mp4",
} as const
const GC_AMBIENT_TRACKS = [
  "/game-center/ambient_sound_1.mp4",
  "/game-center/ambient_sound_2.mp4",
  "/game-center/ambient_sound_3.mp4",
] as const

function localizePlanetName(planet: string, t: (typeof GC_TRANSLATIONS)[Language]) {
  const idx = PLANETS.indexOf(planet)
  return idx >= 0 ? t.planets[idx] : planet
}

const GC_TRANSLATIONS = {
  en: {
    appTitle: "Game Center",
    appSubtitle: "Daily Journey Space Arcade",
    profile: "Astronaut Profile",
    editCharacter: "Edit character",
    chooseGame: "Choose a game and press Play.",
    muteSounds: "Mute Sounds",
    unmuteSounds: "Unmute Sounds",
    ambientOn: "Ambient On",
    ambientOff: "Ambient Off",
    nowPlaying: "Now playing",
    backToMain: "Back to Main",
    achievements: "Game Achievements",
    pongWins: "Pong wins",
    orbitCleared: "Orbit planets cleared",
    flappyMilestones: "Flappy rock milestones",
    dinoBest: "Dino runner best",
    memoryWins: "Memory game wins",
    noneYet: "None yet",
    pongTitle: "Nebula Paddle Duel",
    invadersTitle: "Orbit Invaders",
    flappyTitle: "Astro Jumper",
    dinoTitle: "Astro Runner",
    memoryTitle: "Cosmic Memory Flip",
    play: "Play",
    pause: "Pause",
    resetScore: "Reset Score",
    controls: "Controls",
    moveUp: "Move Up",
    moveDown: "Move Down",
    left: "Left",
    right: "Right",
    fire: "Fire",
    flap: "Flap",
    continue: "Continue",
    nextPlanet: "Next Planet",
    victory: "Victory!",
    firstTo10Complete: "First to 10 complete",
    congrats: "Congrats!",
    youPassed: "You passed",
    warping: "Warping to next planet...",
    achievementUnlocked: "Achievement Unlocked",
    score: "Score",
    level: "Level",
    planet: "Planet",
    you: "You",
    ai: "AI",
    firstTo10Wins: "First to 10 wins",
    pongControls: "Mobile buttons Move Up/Move Down. Desktop Arrow Up/Down or W/S.",
    invaderControls: "Mobile Left/Fire/Right buttons. Desktop Arrow Left/Right and Space/K. Clear all aliens to advance.",
    flappyControls: "Tap canvas on mobile. Desktop Space/W/Arrow Up. Passing an obstacle gives +1.",
    fell: "You fell!",
    tapToReplay: "Tap to play again",
    stage: "Stage",
    timeLeft: "Time Left",
    moves: "Moves",
    category: "Category",
    timer: "Timer",
    chooseCategory: "Choose Category",
    chooseTimer: "Choose Timer",
    startGame: "Start Game",
    oneMinute: "1 minute",
    threeMinutes: "3 minutes",
    fiveMinutes: "5 minutes",
    fruits: "Random Fruits",
    planetsCategory: "Random Planets",
    asteroidsCategory: "Random Asteroids",
    dinoControls: "Jump with Space/W/Arrow Up and crouch with Arrow Down/S. On mobile, use the ↑ and ↓ arrows.",
    memoryControls: "Flip two matching cards. Clear all pairs in each stage before time runs out.",
    allStagesClear: "All stages cleared!",
    timesUp: "Time's up!",
    youWon: "You Won!",
    congratsMessage: "Great job astronaut, you completed every stage!",
    rotateToPlayTitle: "Flip Horizontal To Play",
    rotateToPlayBody: "Rotate your phone to landscape to play Astro Runner.",
    difficulties: { easy: "Easy", medium: "Medium", hard: "Hard", impossible: "Impossible" },
    planets: PLANETS,
    rocks: {
      common: "Common Meteorite",
      uncommon: "Iron Core Meteor",
      rare: "Crystal Asteroid",
      epic: "Nebula Relic Rock",
      legendary: "Celestial Apex Stone",
      commonLabel: "Common",
      uncommonLabel: "Uncommon",
      rareLabel: "Rare",
      epicLabel: "Epic",
      legendaryLabel: "Legendary",
    },
  },
  es: {
    appTitle: "Centro de Juegos",
    appSubtitle: "Arcade Espacial de Viaje Diario",
    profile: "Perfil de Astronauta",
    editCharacter: "Editar personaje",
    chooseGame: "Elige un juego y presiona Jugar.",
    muteSounds: "Silenciar Sonidos",
    unmuteSounds: "Activar Sonidos",
    ambientOn: "Ambiente Activado",
    ambientOff: "Ambiente Desactivado",
    nowPlaying: "Jugando ahora",
    backToMain: "Volver al Inicio",
    achievements: "Logros del Juego",
    pongWins: "Victorias en Pong",
    orbitCleared: "Planetas de órbita completados",
    flappyMilestones: "Hitos de Astro Jumper",
    dinoBest: "Mejor Astro Runner",
    memoryWins: "Victorias en Memoria",
    noneYet: "Aún ninguno",
    pongTitle: "Duelo de Paleta Nebulosa",
    invadersTitle: "Invasores Orbitales",
    flappyTitle: "Astro Jumper",
    dinoTitle: "Astro Runner",
    memoryTitle: "Memoria Cósmica",
    play: "Jugar",
    pause: "Pausar",
    resetScore: "Reiniciar Puntuación",
    controls: "Controles",
    moveUp: "Subir",
    moveDown: "Bajar",
    left: "Izquierda",
    right: "Derecha",
    fire: "Disparar",
    flap: "Aletear",
    continue: "Continuar",
    nextPlanet: "Siguiente Planeta",
    victory: "¡Victoria!",
    firstTo10Complete: "Primero en 10 completado",
    congrats: "¡Felicidades!",
    youPassed: "Superaste",
    warping: "Viajando al siguiente planeta...",
    achievementUnlocked: "Logro Desbloqueado",
    score: "Puntuación",
    level: "Nivel",
    planet: "Planeta",
    you: "Tú",
    ai: "IA",
    firstTo10Wins: "Primero en llegar a 10 gana",
    pongControls: "Botones móviles Subir/Bajar. En escritorio Flecha Arriba/Abajo o W/S.",
    invaderControls: "Botones móviles Izquierda/Disparar/Derecha. En escritorio Flecha Izq./Der. y Espacio/K. Elimina a todos para avanzar.",
    flappyControls: "Toca el canvas o Aletear en móvil. En escritorio Espacio/W/Flecha Arriba. Pasar un obstáculo da +1.",
    fell: "¡Te caíste!",
    tapToReplay: "Toca para jugar de nuevo",
    stage: "Etapa",
    timeLeft: "Tiempo",
    moves: "Movimientos",
    category: "Categoria",
    timer: "Temporizador",
    chooseCategory: "Elegir Categoría",
    chooseTimer: "Elegir Tiempo",
    startGame: "Comenzar Juego",
    oneMinute: "1 minuto",
    threeMinutes: "3 minutos",
    fiveMinutes: "5 minutos",
    fruits: "Frutas Aleatorias",
    planetsCategory: "Planetas Aleatorios",
    asteroidsCategory: "Asteroides Aleatorios",
    dinoControls: "Salta con Espacio/W/Flecha Arriba y agáchate con Flecha Abajo/S. En móvil usa las flechas ↑ y ↓.",
    memoryControls: "Voltea dos cartas iguales. Limpia todas las parejas antes de que se acabe el tiempo.",
    allStagesClear: "Todas las etapas completadas!",
    timesUp: "¡Se acabó el tiempo!",
    youWon: "Ganaste!",
    congratsMessage: "Gran trabajo astronauta, completaste todas las etapas!",
    rotateToPlayTitle: "Gira Horizontal Para Jugar",
    rotateToPlayBody: "Gira tu telefono en horizontal para jugar Astro Runner.",
    difficulties: { easy: "Fácil", medium: "Medio", hard: "Difícil", impossible: "Imposible" },
    planets: ["Mercurio", "Venus", "Tierra", "Marte", "Júpiter", "Saturno", "Urano", "Neptuno"],
    rocks: {
      common: "Meteorito Común",
      uncommon: "Meteorito de Núcleo de Hierro",
      rare: "Asteroide de Cristal",
      epic: "Roca Reliquia de Nebulosa",
      legendary: "Piedra Apex Celestial",
      commonLabel: "Común",
      uncommonLabel: "Poco Común",
      rareLabel: "Raro",
      epicLabel: "Épico",
      legendaryLabel: "Legendario",
    },
  },
  ar: {
    appTitle: "مركز الألعاب",
    appSubtitle: "أركيد الفضاء للرحلة اليومية",
    profile: "ملف رائد الفضاء",
    editCharacter: "تعديل الشخصية",
    chooseGame: "اختر لعبة واضغط تشغيل.",
    muteSounds: "كتم الأصوات",
    unmuteSounds: "تشغيل الأصوات",
    ambientOn: "الصوت المحيط مُفعّل",
    ambientOff: "الصوت المحيط متوقف",
    nowPlaying: "يتم اللعب الآن",
    backToMain: "العودة للرئيسية",
    achievements: "إنجازات الألعاب",
    pongWins: "انتصارات بونغ",
    orbitCleared: "الكواكب التي تم تجاوزها",
    flappyMilestones: "إنجازات Astro Jumper",
    dinoBest: "أفضل Astro Runner",
    memoryWins: "فوز لعبة الذاكرة",
    noneYet: "لا يوجد بعد",
    pongTitle: "مبارزة المضرب السديمية",
    invadersTitle: "غزاة المدار",
    flappyTitle: "Astro Jumper",
    dinoTitle: "Astro Runner",
    memoryTitle: "لعبة ذاكرة فضائية",
    play: "تشغيل",
    pause: "إيقاف مؤقت",
    resetScore: "إعادة النقاط",
    controls: "التحكم",
    moveUp: "أعلى",
    moveDown: "أسفل",
    left: "يسار",
    right: "يمين",
    fire: "إطلاق",
    flap: "رفرفة",
    continue: "متابعة",
    nextPlanet: "الكوكب التالي",
    victory: "فوز!",
    firstTo10Complete: "الوصول إلى 10 اكتمل",
    congrats: "تهانينا!",
    youPassed: "لقد تجاوزت",
    warping: "الانتقال إلى الكوكب التالي...",
    achievementUnlocked: "تم فتح إنجاز",
    score: "النقاط",
    level: "المستوى",
    planet: "الكوكب",
    you: "أنت",
    ai: "الذكاء الاصطناعي",
    firstTo10Wins: "أول من يصل إلى 10 يفوز",
    pongControls: "أزرار الجوال أعلى/أسفل. على الكمبيوتر الأسهم أعلى/أسفل أو W/S.",
    invaderControls: "أزرار الجوال يسار/إطلاق/يمين. على الكمبيوتر الأسهم يمين/يسار وSpace/K. اقضِ على الجميع للتقدم.",
    flappyControls: "اضغط على اللوحة أو زر الرفرفة في الجوال. على الكمبيوتر Space/W/سهم أعلى. تجاوز عائق يعطي +1.",
    fell: "لقد سقطت!",
    tapToReplay: "اضغط للعب مرة أخرى",
    stage: "المرحلة",
    timeLeft: "الوقت",
    moves: "الحركات",
    category: "الفئة",
    timer: "المؤقت",
    chooseCategory: "اختر الفئة",
    chooseTimer: "اختر الوقت",
    startGame: "ابدأ اللعب",
    oneMinute: "1 دقيقة",
    threeMinutes: "3 دقائق",
    fiveMinutes: "5 دقائق",
    fruits: "فواكه عشوائية",
    planetsCategory: "كواكب عشوائية",
    asteroidsCategory: "كويكبات عشوائية",
    dinoControls: "اقفز بـ Space/W/سهم أعلى وانخفض بـ سهم أسفل/S. في الجوال استخدم سهام ↑ و ↓.",
    memoryControls: "اقلب بطاقتين متطابقتين. أكمل كل الأزواج قبل نفاد الوقت.",
    allStagesClear: "تم إنهاء كل المراحل!",
    timesUp: "انتهى الوقت!",
    youWon: "لقد فزت!",
    congratsMessage: "عمل رائع يا رائد الفضاء، أنهيت كل المراحل!",
    rotateToPlayTitle: "اقلب الهاتف أفقيا للعب",
    rotateToPlayBody: "اقلب هاتفك للوضع الأفقي للعب Astro Runner.",
    difficulties: { easy: "سهل", medium: "متوسط", hard: "صعب", impossible: "مستحيل" },
    planets: ["عطارد", "الزهرة", "الأرض", "المريخ", "المشتري", "زحل", "أورانوس", "نبتون"],
    rocks: {
      common: "نيزك عادي",
      uncommon: "نيزك بنواة حديدية",
      rare: "كويكب بلوري",
      epic: "صخرة بقايا السديم",
      legendary: "حجر القمة السماوي",
      commonLabel: "عادي",
      uncommonLabel: "غير شائع",
      rareLabel: "نادر",
      epicLabel: "ملحمي",
      legendaryLabel: "أسطوري",
    },
  },
} as const

function getAudioContext(): AudioContext | null {
  try {
    const scopedWindow = window as Window & { __gcAudioCtx?: AudioContext }
    if (!scopedWindow.__gcAudioCtx || scopedWindow.__gcAudioCtx.state === "closed") {
      scopedWindow.__gcAudioCtx = new AudioContext()
    }
    return scopedWindow.__gcAudioCtx
  } catch {
    return null
  }
}

function playTone(freq: number, duration = 0.08, type: OscillatorType = "sine", volume = 0.05) {
  if (GC_MUTED) return
  const ctx = getAudioContext()
  if (!ctx) return
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + duration)
}

function playDing() {
  const variance = Math.random() * 24 - 12
  playTone(860 + variance, 0.08, "triangle", 0.045)
  playTone(1150 + variance, 0.085, "sine", 0.035)
}

function playWin() {
  playTone(523, 0.09, "sine", 0.05)
  setTimeout(() => playTone(659, 0.09, "sine", 0.05), 70)
  setTimeout(() => playTone(784, 0.12, "sine", 0.06), 140)
}

function playLose() {
  playTone(260, 0.1, "sawtooth", 0.05)
  setTimeout(() => playTone(180, 0.14, "sawtooth", 0.05), 80)
}

function playAchievement() {
  playTone(740, 0.08, "triangle", 0.045)
  setTimeout(() => playTone(988, 0.08, "triangle", 0.045), 70)
  setTimeout(() => playTone(1318, 0.11, "sine", 0.05), 150)
}

function playSfx(src: string, volume = 0.5) {
  if (GC_MUTED) return
  const audio = new Audio(src)
  audio.volume = Math.max(0, Math.min(1, volume))
  audio.play().catch(() => {
    // Ignore autoplay/user-gesture restrictions.
  })
}

function shuffled<T>(items: readonly T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function drawStarfield(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, "#050814")
  grad.addColorStop(1, "#0c1f42")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 45; i += 1) {
    const x = (i * 67) % w
    const y = (i * 103) % h
    const r = i % 5 === 0 ? 2 : 1
    ctx.fillStyle = i % 3 === 0 ? "#dbeafe" : "#93c5fd"
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawMeteor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = "#f59e0b"
  ctx.beginPath()
  ctx.moveTo(-6, -2)
  ctx.lineTo(-2, -6)
  ctx.lineTo(4, -5)
  ctx.lineTo(6, 0)
  ctx.lineTo(3, 6)
  ctx.lineTo(-4, 5)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = "#d97706"
  ctx.beginPath()
  ctx.arc(-1, 0, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawAlien(ctx: CanvasRenderingContext2D, x: number, y: number, hueShift: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = `hsl(${140 + hueShift}, 75%, 60%)`
  ctx.beginPath()
  ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `hsl(${160 + hueShift}, 80%, 45%)`
  ctx.fillRect(-8, 2, 16, 5)
  ctx.fillStyle = "#0b1025"
  ctx.beginPath()
  ctx.arc(-3, -1, 1.4, 0, Math.PI * 2)
  ctx.arc(3, -1, 1.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "#86efac"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(-5, -6)
  ctx.lineTo(-8, -9)
  ctx.moveTo(5, -6)
  ctx.lineTo(8, -9)
  ctx.stroke()
  ctx.restore()
}

function drawAstronautMini(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  profile: GameCenterProfile,
  scale = 1,
) {
  const visor = profile.helmetStyle === "gold" ? "#f59e0b" : profile.helmetStyle === "midnight" ? "#6366f1" : profile.helmetStyle === "visor" ? "#22d3ee" : "#94a3b8"
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = profile.suitColor
  ctx.fillRect(-6, 1, 12, 10)
  ctx.fillStyle = "#f8fafc"
  ctx.beginPath()
  ctx.arc(0, -4, 6.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = visor
  ctx.beginPath()
  ctx.ellipse(0, -3, 4.4, 3.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#0f172a"
  ctx.fillRect(-3.5, 4, 7, 5)

  if (profile.badge === "star") {
    ctx.fillStyle = "#fde68a"
    ctx.beginPath()
    ctx.moveTo(0, 4.3)
    ctx.lineTo(1, 6.2)
    ctx.lineTo(3, 6.5)
    ctx.lineTo(1.5, 7.8)
    ctx.lineTo(1.8, 9.7)
    ctx.lineTo(0, 8.8)
    ctx.lineTo(-1.8, 9.7)
    ctx.lineTo(-1.5, 7.8)
    ctx.lineTo(-3, 6.5)
    ctx.lineTo(-1, 6.2)
    ctx.closePath()
    ctx.fill()
  } else if (profile.badge === "moon") {
    ctx.fillStyle = "#e2e8f0"
    ctx.beginPath()
    ctx.arc(0, 6.7, 2.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#0f172a"
    ctx.beginPath()
    ctx.arc(1, 6.2, 2.2, 0, Math.PI * 2)
    ctx.fill()
  } else if (profile.badge === "planet") {
    ctx.fillStyle = "#93c5fd"
    ctx.beginPath()
    ctx.arc(0, 6.8, 2.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#bfdbfe"
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(0, 6.8, 3.5, 1.3, 0, 0, Math.PI * 2)
    ctx.stroke()
  } else {
    ctx.fillStyle = "#fef08a"
    ctx.beginPath()
    ctx.arc(1.7, 5.4, 1.4, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = "#fde68a"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(-2.8, 8.8)
    ctx.lineTo(0.9, 6.2)
    ctx.stroke()
  }

  ctx.restore()
}

function CelebrationBurst({
  theme = "emerald",
  density = 34,
}: {
  theme?: "emerald" | "indigo" | "fuchsia"
  density?: number
}) {
  const palette =
    theme === "indigo"
      ? ["#c4b5fd", "#818cf8", "#e0e7ff", "#93c5fd", "#f5f3ff"]
      : theme === "fuchsia"
        ? ["#f9a8d4", "#f0abfc", "#fde68a", "#c4b5fd", "#fdf4ff"]
        : ["#34d399", "#fde68a", "#93c5fd", "#f0fdf4", "#a7f3d0"]

  const pieces = useMemo(
    () =>
      Array.from({ length: density }, (_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 0.9 + Math.random() * 0.65,
        drift: -42 + Math.random() * 84,
        spin: -200 + Math.random() * 400,
        size: 5 + Math.random() * 7,
        shape: idx % 3 === 0 ? "999px" : idx % 3 === 1 ? "2px" : "0px",
        color: palette[Math.floor(Math.random() * palette.length)],
      })),
    [density, palette],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/20 to-transparent" />
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="gc-confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              width: `${piece.size}px`,
              height: `${piece.size * 0.55}px`,
              borderRadius: piece.shape,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--gc-drift": `${piece.drift}px`,
              "--gc-spin": `${piece.spin}deg`,
            } as any
          }
        />
      ))}
      <style jsx global>{`
        .gc-confetti-piece {
          position: absolute;
          top: -12%;
          opacity: 0;
          box-shadow: 0 0 10px color-mix(in srgb, currentColor 45%, transparent);
          animation-name: gc-confetti-fall;
          animation-timing-function: cubic-bezier(0.2, 0.8, 0.18, 1);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        @keyframes gc-confetti-fall {
          0% {
            opacity: 0;
            transform: translate3d(0, -14px, 0) rotate(0deg);
          }
          12% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate3d(var(--gc-drift), 116%, 0) rotate(var(--gc-spin));
          }
        }
      `}</style>
    </div>
  )
}

function NebulaPaddleDuel({ onWin, t }: { onWin: () => void; t: (typeof GC_TRANSLATIONS)[Language] }) {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "impossible">("medium")
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState({ me: 0, ai: 0 })
  const [running, setRunning] = useState(false)
  const [touchUp, setTouchUp] = useState(false)
  const [touchDown, setTouchDown] = useState(false)
  const touchUpRef = useRef(false)
  const touchDownRef = useRef(false)
  const [victoryOpen, setVictoryOpen] = useState(false)

  useEffect(() => {
    touchUpRef.current = touchUp
  }, [touchUp])

  useEffect(() => {
    touchDownRef.current = touchDown
  }, [touchDown])

  useEffect(() => {
    if (!running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const LOGICAL_WIDTH = 380
    const LOGICAL_HEIGHT = 240
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = Math.floor(LOGICAL_WIDTH * dpr)
    canvas.height = Math.floor(LOGICAL_HEIGHT * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    let raf = 0
    let meScore = 0
    let aiScore = 0
    const aiConfig =
      difficulty === "easy"
        ? { reaction: 0.045, maxStep: 2.2, paddle: 56 }
        : difficulty === "hard"
          ? { reaction: 0.12, maxStep: 4.4, paddle: 44 }
          : difficulty === "impossible"
            ? { reaction: 0.16, maxStep: 5.1, paddle: 40 }
            : { reaction: 0.085, maxStep: 3.2, paddle: 48 }

    const state = {
      playerY: 110,
      aiY: 110,
      ballX: 190,
      ballY: 120,
      vx: 3.2,
      vy: 2.1,
      up: false,
      down: false,
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") state.up = true
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") state.down = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") state.up = false
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") state.down = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    const resetBall = (towardPlayer: boolean) => {
      state.ballX = 190
      state.ballY = 120
      state.vx = towardPlayer ? -3.2 : 3.2
      state.vy = (Math.random() > 0.5 ? 1 : -1) * 2.1
    }

    const endMatch = (playerWon: boolean) => {
      setRunning(false)
      if (playerWon) {
        playWin()
        onWin()
        setVictoryOpen(true)
        window.setTimeout(() => setVictoryOpen(false), 1800)
      } else playLose()
      setTimeout(() => {
        meScore = 0
        aiScore = 0
        setScore({ me: 0, ai: 0 })
      }, 260)
    }

    const step = () => {
      if (state.up || touchUpRef.current) state.playerY -= 4
      if (state.down || touchDownRef.current) state.playerY += 4
      state.playerY = Math.max(8, Math.min(192, state.playerY))
      const aiTargetDelta = (state.ballY - (state.aiY + aiConfig.paddle / 2)) * aiConfig.reaction
      const aiStep = Math.max(-aiConfig.maxStep, Math.min(aiConfig.maxStep, aiTargetDelta))
      state.aiY += aiStep
      state.aiY = Math.max(8, Math.min(240 - aiConfig.paddle, state.aiY))

      state.ballX += state.vx
      state.ballY += state.vy

      if (state.ballY <= 6 || state.ballY >= 234) state.vy *= -1

      const hitPlayer = state.ballX <= 20 && state.ballY >= state.playerY && state.ballY <= state.playerY + 48
      const hitAi = state.ballX >= 360 && state.ballY >= state.aiY && state.ballY <= state.aiY + aiConfig.paddle
      if (hitPlayer) {
        state.vx *= -1.04
        playTone(530, 0.05, "triangle", 0.04)
      }
      if (hitAi) {
        state.vx *= -1.04
      }

      if (state.ballX < 0) {
        aiScore += 1
        setScore({ me: meScore, ai: aiScore })
        playTone(240, 0.08, "sawtooth", 0.04)
        if (aiScore >= 10) {
          endMatch(false)
          return
        }
        resetBall(false)
      }

      if (state.ballX > 380) {
        meScore += 1
        setScore({ me: meScore, ai: aiScore })
        playDing()
        if (meScore >= 10) {
          endMatch(true)
          return
        }
        resetBall(true)
      }

      drawStarfield(ctx, 380, 240)
      ctx.strokeStyle = "#7dd3fc66"
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.moveTo(190, 0)
      ctx.lineTo(190, 240)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = "#93c5fd"
      ctx.fillRect(10, state.playerY, 8, 48)
      ctx.fillStyle = "#fda4af"
      ctx.fillRect(362, state.aiY, 8, aiConfig.paddle)
      drawMeteor(ctx, state.ballX, state.ballY)

      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [running, difficulty])

  return (
    <div className="relative rounded-2xl bg-slate-900/70 p-4">
      <p className="mb-2 text-sm text-slate-200">{t.pongTitle} | {t.firstTo10Wins} | {t.you}: {score.me} {t.ai}: {score.ai}</p>
      <canvas ref={canvasRef} width={380} height={240} className="w-full rounded-xl border border-cyan-200/40" />
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setRunning((r) => !r)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">{running ? t.pause : t.play}</Button>
        <Button onClick={() => setScore({ me: 0, ai: 0 })} variant="secondary">{t.resetScore}</Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["easy", "medium", "hard", "impossible"] as const).map((d) => (
          <Button
            key={d}
            onClick={() => !running && setDifficulty(d)}
            disabled={running}
            variant={difficulty === d ? "default" : "secondary"}
          >
            {t.difficulties[d]}
          </Button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
        <Button
          onTouchStart={() => setTouchUp(true)}
          onTouchEnd={() => setTouchUp(false)}
          onTouchCancel={() => setTouchUp(false)}
          onMouseDown={() => setTouchUp(true)}
          onMouseUp={() => setTouchUp(false)}
          onMouseLeave={() => setTouchUp(false)}
          variant="secondary"
          aria-label={t.moveUp}
        >
          ^
        </Button>
        <Button
          onTouchStart={() => setTouchDown(true)}
          onTouchEnd={() => setTouchDown(false)}
          onTouchCancel={() => setTouchDown(false)}
          onMouseDown={() => setTouchDown(true)}
          onMouseUp={() => setTouchDown(false)}
          onMouseLeave={() => setTouchDown(false)}
          variant="secondary"
          aria-label={t.moveDown}
        >
          v
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-300">{t.controls}: {t.pongControls}</p>
      {victoryOpen && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-emerald-900/55">
          <CelebrationBurst theme="emerald" density={34} />
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-200/20 px-6 py-4 text-center">
            <p className="text-2xl font-black text-emerald-100">{t.victory}</p>
            <p className="text-sm text-emerald-50">{t.firstTo10Complete}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function OrbitInvaders({ onPlanetClear, t }: { onPlanetClear: (planet: string) => void; t: (typeof GC_TRANSLATIONS)[Language] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [level, setLevel] = useState(1)
  const [orbitSession, setOrbitSession] = useState(0)
  const [planet, setPlanet] = useState(PLANETS[0])
  const rocketImageRef = useRef<HTMLImageElement | null>(null)
  const [touchLeft, setTouchLeft] = useState(false)
  const [touchRight, setTouchRight] = useState(false)
  const [touchFire, setTouchFire] = useState(false)
  const touchLeftRef = useRef(false)
  const touchRightRef = useRef(false)
  const touchFireRef = useRef(false)
  const onPlanetClearRef = useRef(onPlanetClear)
  const [clearNotice, setClearNotice] = useState<{ open: boolean; planet: string } | null>(null)
  const pausedForOverlayRef = useRef(false)

  useEffect(() => {
    touchLeftRef.current = touchLeft
  }, [touchLeft])

  useEffect(() => {
    touchRightRef.current = touchRight
  }, [touchRight])

  useEffect(() => {
    touchFireRef.current = touchFire
  }, [touchFire])

  useEffect(() => {
    onPlanetClearRef.current = onPlanetClear
  }, [onPlanetClear])

  useEffect(() => {
    if (!running) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const LOGICAL_WIDTH = 380
    const LOGICAL_HEIGHT = 240
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    canvas.width = Math.floor(LOGICAL_WIDTH * dpr)
    canvas.height = Math.floor(LOGICAL_HEIGHT * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"

    if (!rocketImageRef.current) {
      const img = new window.Image()
      img.src = "/vertical_rocket.png"
      rocketImageRef.current = img
    }

    let raf = 0
    let levelLocal = Math.max(1, Math.min(3, level))
    let scoreLocal = 0
    let transitionTimeout: number | null = null

    const createWave = (lvl: number) => {
      const rows = 3
      const cols = 6
      return Array.from({ length: rows * cols }, (_, i) => ({
        x: 35 + (i % cols) * 52,
        y: 26 + Math.floor(i / cols) * 26,
        alive: true,
        tint: (i * 11 + lvl * 7) % 45,
      }))
    }

    const state = {
      shipX: 170,
      left: false,
      right: false,
      fire: false,
      shots: [] as Array<{ x: number; y: number }>,
      invaders: createWave(levelLocal),
      dir: 1,
      speed: 1.05,
    }
    const ROCKET_W = 32
    const ROCKET_H = 36
    const ROCKET_BASELINE_Y = 230

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") state.left = true
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") state.right = true
      if (e.key === " " || e.key.toLowerCase() === "k") state.fire = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") state.left = false
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") state.right = false
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)

    let fireCooldown = 0

    const loseRound = () => {
      playLose()
      setRunning(false)
      setScore(0)
      setLevel(1)
      setPlanet(PLANETS[0])
    }

    const step = () => {
      if (pausedForOverlayRef.current) {
        drawStarfield(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT)
        const rocketImage = rocketImageRef.current
        if (rocketImage && rocketImage.complete) {
          ctx.drawImage(rocketImage, state.shipX + 10 - ROCKET_W / 2, ROCKET_BASELINE_Y - ROCKET_H, ROCKET_W, ROCKET_H)
        }
        for (const inv of state.invaders) {
          if (!inv.alive) continue
          drawAlien(ctx, inv.x, inv.y, inv.tint)
        }
        ctx.fillStyle = "#fef08a"
        for (const shot of state.shots) ctx.fillRect(shot.x - 1, shot.y - 6, 2, 8)
        raf = requestAnimationFrame(step)
        return
      }

      if (state.left || touchLeftRef.current) state.shipX -= 4.3
      if (state.right || touchRightRef.current) state.shipX += 4.3
      state.shipX = Math.max(12, Math.min(348, state.shipX))

      if ((state.fire || touchFireRef.current) && fireCooldown <= 0) {
        state.shots.push({ x: state.shipX + 10, y: 206 })
        fireCooldown = Math.max(8, 15 - levelLocal)
      }
      state.fire = false
      fireCooldown -= 1

      for (const shot of state.shots) shot.y -= 6.2
      state.shots = state.shots.filter((s) => s.y > -10)

      let edgeHit = false
      let reachedBottom = false
      for (const inv of state.invaders) {
        if (!inv.alive) continue
        inv.x += state.dir * state.speed
        if (inv.x < 8 || inv.x > 356) edgeHit = true
        if (inv.y > 196) reachedBottom = true
        const touchesShip = Math.abs(inv.x - (state.shipX + 10)) < 14 && inv.y > 190
        if (touchesShip) reachedBottom = true
      }

      if (reachedBottom) {
        loseRound()
        return
      }

      if (edgeHit) {
        state.dir *= -1
        for (const inv of state.invaders) inv.y += 10
      }

      for (const shot of state.shots) {
        for (const inv of state.invaders) {
          if (!inv.alive) continue
          if (shot.x > inv.x - 10 && shot.x < inv.x + 10 && shot.y > inv.y - 8 && shot.y < inv.y + 8) {
            inv.alive = false
            shot.y = -100
            scoreLocal += 10
            setScore(scoreLocal)
            playSfx(GC_SFX.invaderHit, 0.6)
          }
        }
      }

      const aliveCount = state.invaders.filter((i) => i.alive).length
      if (aliveCount === 0) {
        const clearedPlanet = PLANETS[levelLocal - 1] ?? PLANETS[0]
        onPlanetClearRef.current(clearedPlanet)
        setClearNotice({ open: true, planet: clearedPlanet })
        playWin()
        pausedForOverlayRef.current = true

        if (levelLocal >= 3) {
          setRunning(false)
          raf = requestAnimationFrame(step)
          return
        }

        const nextLevel = levelLocal + 1
        transitionTimeout = window.setTimeout(() => {
          levelLocal = nextLevel
          setLevel(nextLevel)
          setPlanet(PLANETS[nextLevel - 1] ?? PLANETS[0])
          state.invaders = createWave(nextLevel)
          state.speed = 1.05 + Math.min(nextLevel * 0.12, 0.45)
          state.dir = 1
          state.shots = []
          pausedForOverlayRef.current = false
          setClearNotice(null)
        }, 900)
        raf = requestAnimationFrame(step)
        return
      }

      drawStarfield(ctx, LOGICAL_WIDTH, LOGICAL_HEIGHT)
      ctx.fillStyle = "#ffffff1a"
      ctx.fillRect(0, 216, LOGICAL_WIDTH, 2)

      const rocketImage = rocketImageRef.current
      if (rocketImage && rocketImage.complete) {
        ctx.drawImage(rocketImage, state.shipX + 10 - ROCKET_W / 2, ROCKET_BASELINE_Y - ROCKET_H, ROCKET_W, ROCKET_H)
      } else {
        ctx.fillStyle = "#34d399"
        ctx.beginPath()
        ctx.moveTo(state.shipX, 226)
        ctx.lineTo(state.shipX + 10, 208)
        ctx.lineTo(state.shipX + 20, 226)
        ctx.closePath()
        ctx.fill()
      }

      for (const inv of state.invaders) {
        if (!inv.alive) continue
        drawAlien(ctx, inv.x, inv.y, inv.tint)
      }

      ctx.fillStyle = "#fef08a"
      for (const shot of state.shots) ctx.fillRect(shot.x - 1, shot.y - 6, 2, 8)

      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      if (transitionTimeout) {
        window.clearTimeout(transitionTimeout)
      }
    }
  }, [running, orbitSession, level])

  return (
    <div className="relative rounded-2xl bg-slate-900/70 p-4">
      <p className="mb-2 text-sm text-slate-200">{t.invadersTitle} | {t.score}: {score} | {t.level}: {level}/3 | {t.planet}: {localizePlanetName(planet, t)}</p>
      <canvas ref={canvasRef} width={380} height={240} className="w-full rounded-xl border border-cyan-200/40" />
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setRunning((r) => !r)} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">{running ? t.pause : t.play}</Button>
        <Button
          onClick={() => {
            setLevel((prev) => {
              const next = Math.min(3, prev + 1)
              setPlanet(PLANETS[next - 1] ?? PLANETS[0])
              return next
            })
            setClearNotice(null)
            pausedForOverlayRef.current = false
            setOrbitSession((s) => s + 1)
            setRunning(true)
          }}
          variant="secondary"
        >
          {t.nextPlanet}
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
        <Button
          onTouchStart={() => setTouchLeft(true)}
          onTouchEnd={() => setTouchLeft(false)}
          onTouchCancel={() => setTouchLeft(false)}
          onMouseDown={() => setTouchLeft(true)}
          onMouseUp={() => setTouchLeft(false)}
          onMouseLeave={() => setTouchLeft(false)}
          variant="secondary"
          aria-label={t.left}
        >
          {"<"}
        </Button>
        <Button
          onTouchStart={() => setTouchFire(true)}
          onTouchEnd={() => setTouchFire(false)}
          onTouchCancel={() => setTouchFire(false)}
          onMouseDown={() => setTouchFire(true)}
          onMouseUp={() => setTouchFire(false)}
          onMouseLeave={() => setTouchFire(false)}
          className="bg-fuchsia-500 text-white hover:bg-fuchsia-400"
          aria-label={t.fire}
        >
          ^
        </Button>
        <Button
          onTouchStart={() => setTouchRight(true)}
          onTouchEnd={() => setTouchRight(false)}
          onTouchCancel={() => setTouchRight(false)}
          onMouseDown={() => setTouchRight(true)}
          onMouseUp={() => setTouchRight(false)}
          onMouseLeave={() => setTouchRight(false)}
          variant="secondary"
          aria-label={t.right}
        >
          {">"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-300">{t.controls}: {t.invaderControls}</p>
      {clearNotice?.open && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-indigo-900/55">
          <CelebrationBurst theme="indigo" density={32} />
          <div className="pointer-events-auto rounded-2xl border border-indigo-200/60 bg-indigo-200/20 px-6 py-4 text-center">
            <p className="text-2xl font-black text-indigo-100">{t.congrats}</p>
            <p className="text-sm text-indigo-50">{t.youPassed} {localizePlanetName(clearNotice.planet, t)}</p>
            {running && <p className="mt-3 text-xs text-indigo-100">{t.warping}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function AstroFlapRunner({
  profile,
  onMilestone,
  unlockedMilestones,
  t,
}: {
  profile: GameCenterProfile | null
  onMilestone: (score: number) => void
  unlockedMilestones: number[]
  t: (typeof GC_TRANSLATIONS)[Language]
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [milestonePop, setMilestonePop] = useState<{ score: number; name: string; rarity: string } | null>(null)
  const pausedForMilestoneRef = useRef(false)

  useEffect(() => {
    if (!running || !profile) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let scoreLocal = 0
    const milestones = [15, 35, 50, 75, 100]
    const rockMeta: Record<number, { name: string; rarity: string }> = {
      15: { name: t.rocks.common, rarity: t.rocks.commonLabel },
      35: { name: t.rocks.uncommon, rarity: t.rocks.uncommonLabel },
      50: { name: t.rocks.rare, rarity: t.rocks.rareLabel },
      75: { name: t.rocks.epic, rarity: t.rocks.epicLabel },
      100: { name: t.rocks.legendary, rarity: t.rocks.legendaryLabel },
    }
    const unlocked = new Set<number>(unlockedMilestones)
    const state = {
      y: 120,
      vy: 0,
      obstacles: [] as Array<{ x: number; gapY: number; passed: boolean; topRock: number[]; bottomRock: number[] }>,
    }
    let tick = 0
    const flap = () => {
      state.vy = -5.2
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key.toLowerCase() === "w" || e.key === "ArrowUp") flap()
    }
    window.addEventListener("keydown", onKey)
    canvas.addEventListener("pointerdown", flap)

    const createRockEdge = () => Array.from({ length: 5 }, () => 8 + Math.random() * 16)

    const loseRound = () => {
      playLose()
      setRunning(false)
      setGameOver(true)
      scoreLocal = 0
      setScore(0)
    }

    const step = () => {
      if (pausedForMilestoneRef.current) {
        drawStarfield(ctx, 380, 240)
        for (const obstacle of state.obstacles) {
          const topHeight = obstacle.gapY
          const bottomStart = obstacle.gapY + 84
          ctx.fillStyle = "#334155"
          ctx.fillRect(obstacle.x, 0, 28, topHeight)
          ctx.fillRect(obstacle.x, bottomStart, 28, 240 - bottomStart)
        }
        drawAstronautMini(ctx, 50, state.y, profile, 1)
        raf = requestAnimationFrame(step)
        return
      }

      tick += 1
      if (tick % 72 === 0) {
        const gapY = 60 + Math.random() * 100
        state.obstacles.push({
          x: 390,
          gapY,
          passed: false,
          topRock: createRockEdge(),
          bottomRock: createRockEdge(),
        })
      }

      state.vy += 0.29
      state.y += state.vy

      if (state.y < 10 || state.y > 230) {
        loseRound()
        return
      }

      for (const obstacle of state.obstacles) {
        obstacle.x -= 1.85
        if (!obstacle.passed && obstacle.x < 50) {
          obstacle.passed = true
          scoreLocal += 1
          setScore(scoreLocal)
          playDing()
          if (milestones.includes(scoreLocal) && !unlocked.has(scoreLocal)) {
            unlocked.add(scoreLocal)
            onMilestone(scoreLocal)
            const meta = rockMeta[scoreLocal]
            setMilestonePop({ score: scoreLocal, name: meta.name, rarity: meta.rarity })
            playAchievement()
            pausedForMilestoneRef.current = true
          }
        }
      }
      state.obstacles = state.obstacles.filter((p) => p.x > -40)

      drawStarfield(ctx, 380, 240)

      for (const obstacle of state.obstacles) {
        const topHeight = obstacle.gapY
        const bottomStart = obstacle.gapY + 84

        ctx.fillStyle = "#334155"
        ctx.fillRect(obstacle.x, 0, 28, topHeight)
        ctx.fillRect(obstacle.x, bottomStart, 28, 240 - bottomStart)

        ctx.fillStyle = "#64748b"
        obstacle.topRock.forEach((r, i) => {
          ctx.beginPath()
          ctx.arc(obstacle.x + 4 + i * 5, topHeight - 2, r / 6, 0, Math.PI * 2)
          ctx.fill()
        })
        obstacle.bottomRock.forEach((r, i) => {
          ctx.beginPath()
          ctx.arc(obstacle.x + 4 + i * 5, bottomStart + 2, r / 6, 0, Math.PI * 2)
          ctx.fill()
        })

        const hitX = 50 > obstacle.x - 9 && 50 < obstacle.x + 28
        const hitY = state.y < obstacle.gapY || state.y > obstacle.gapY + 84
        if (hitX && hitY) {
          loseRound()
          return
        }
      }

      drawAstronautMini(ctx, 50, state.y, profile, 1)

      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKey)
      canvas.removeEventListener("pointerdown", flap)
    }
  }, [running, profile, onMilestone, unlockedMilestones])

  return (
    <div className="relative rounded-2xl bg-slate-900/70 p-4">
      <p className="mb-2 text-sm text-slate-200">{t.flappyTitle} | {t.score}: {score}</p>
      <canvas ref={canvasRef} width={380} height={240} className="w-full rounded-xl border border-cyan-200/40" />
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => {
            setGameOver(false)
            setRunning((r) => !r)
          }}
          className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
        >
          {running ? t.pause : t.play}
        </Button>
        <Button onClick={() => setScore(0)} variant="secondary">{t.resetScore}</Button>
      </div>
      <p className="mt-2 text-xs text-slate-300">{t.controls}: {t.flappyControls}</p>
      {gameOver && !running && (
        <button
          type="button"
          onClick={() => {
            pausedForMilestoneRef.current = false
            setMilestonePop(null)
            setGameOver(false)
            setRunning(true)
          }}
          className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-rose-900/55 text-center"
        >
          <div className="rounded-2xl border border-rose-200/60 bg-rose-100/15 px-6 py-4">
            <p className="text-xl font-black text-rose-100">{t.fell}</p>
            <p className="mt-1 text-sm text-rose-50">{t.tapToReplay}</p>
          </div>
        </button>
      )}
      {milestonePop && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-fuchsia-900/45">
          <CelebrationBurst theme="fuchsia" density={30} />
          <div className="pointer-events-auto rounded-2xl border border-fuchsia-200/60 bg-fuchsia-100/15 px-6 py-4 text-center">
            <p className="text-xl font-black text-fuchsia-100">{t.achievementUnlocked}</p>
            <p className="text-sm text-fuchsia-50">{milestonePop.name}</p>
            <p className="text-xs text-fuchsia-200">{milestonePop.rarity} | {t.score} {milestonePop.score}</p>
            <Button
              className="mt-3 bg-white text-fuchsia-900 hover:bg-fuchsia-100"
              onClick={() => {
                pausedForMilestoneRef.current = false
                setMilestonePop(null)
              }}
            >
              {t.continue}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DinoAstroRunner({
  profile,
  t,
  onBestScore,
}: {
  profile: GameCenterProfile | null
  t: (typeof GC_TRANSLATIONS)[Language]
  onBestScore: (score: number) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [crouchHeld, setCrouchHeld] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [isLandscape, setIsLandscape] = useState(true)
  const crouchRef = useRef(false)
  const milestoneRef = useRef(0)
  const bestThisRunRef = useRef(0)
  const jumpHeldRef = useRef(false)
  const jumpBoostUntilRef = useRef(0)
  const jumpRequestRef = useRef(false)

  useEffect(() => {
    crouchRef.current = crouchHeld
  }, [crouchHeld])

  useEffect(() => {
    const updateViewportState = () => {
      const touch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window
      setIsTouchDevice(touch)
      setIsLandscape(window.innerWidth > window.innerHeight)
    }
    updateViewportState()
    window.addEventListener("resize", updateViewportState)
    window.addEventListener("orientationchange", updateViewportState)
    return () => {
      window.removeEventListener("resize", updateViewportState)
      window.removeEventListener("orientationchange", updateViewportState)
    }
  }, [])

  const requiresLandscape = isTouchDevice
  const blockedByOrientation = requiresLandscape && !isLandscape

  useEffect(() => {
    if (!running || !profile || blockedByOrientation) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let scoreLocal = 0
    let displayedScore = 0
    let speed = 5.0
    const width = 900
    const height = 260
    const groundY = 210
    let groundOffset = 0
    const state = {
      y: groundY - 52,
      vy: 0,
      obstacles: [] as Array<{ x: number; w: number; h: number; y: number; flying: boolean; scored?: boolean }>,
    }
    let spawnTick = 36
    let elapsedFrames = 0
    let crouching = false
    let runTick = 0
    let jumpEventToken = 0

    const jump = () => {
      if (state.y >= groundY - 52 - 0.5) {
        const minJump = 9.8
        state.vy = -minJump
        jumpBoostUntilRef.current = performance.now() + 170
        jumpEventToken += 1
        const token = jumpEventToken
        window.setTimeout(() => {
          if (token !== jumpEventToken) return
          if (jumpHeldRef.current && performance.now() < jumpBoostUntilRef.current) {
            playSfx(GC_SFX.longJump, 0.65)
          } else {
            playSfx(GC_SFX.shortJump, 0.6)
          }
        }, 90)
      }
    }

    const loseRound = () => {
      playLose()
      onBestScore(bestThisRunRef.current)
      setRunning(false)
      setGameOver(true)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.key.toLowerCase() === "w" || event.key === "ArrowUp") {
        event.preventDefault()
        if (!jumpHeldRef.current) {
          jumpHeldRef.current = true
          jump()
        }
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        crouching = true
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === " " || event.key.toLowerCase() === "w" || event.key === "ArrowUp") {
        jumpHeldRef.current = false
      }
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        crouching = false
      }
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    const onPointerDown = () => {
      if (!jumpHeldRef.current) {
        jumpHeldRef.current = true
        jump()
      }
    }
    const onPointerUp = () => {
      jumpHeldRef.current = false
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerUp)

    const drawRunnerAstronaut = (x: number, y: number, crouch: boolean) => {
      const h = crouch ? 30 : 42
      const w = crouch ? 26 : 32
      const headR = crouch ? 8 : 10
      const bodyTop = y + (crouch ? 8 : 11)

      ctx.fillStyle = profile.suitColor
      ctx.fillRect(x - w / 2, bodyTop, w, h - 16)
      ctx.fillStyle = "#e2e8f0"
      ctx.beginPath()
      ctx.roundRect(x - w / 2, bodyTop, w, h - 16, 8)
      ctx.stroke()

      ctx.fillStyle = "#f8fafc"
      ctx.beginPath()
      ctx.arc(x, y + headR, headR, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2
      ctx.stroke()

      const visor = profile.helmetStyle === "gold" ? "#f59e0b" : profile.helmetStyle === "midnight" ? "#6366f1" : profile.helmetStyle === "visor" ? "#22d3ee" : "#94a3b8"
      ctx.fillStyle = visor
      ctx.beginPath()
      ctx.ellipse(x, y + headR + 1, headR - 4, headR - 6, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#0f172a"
      ctx.fillRect(x - 7, bodyTop + 8, 14, 10)
    }

    const drawAsteroid = (x: number, y: number, w: number, h: number) => {
      const cx = x + w / 2
      const cy = y + h / 2
      ctx.fillStyle = "#7c3aed"
      ctx.beginPath()
      ctx.moveTo(x + 3, y + h - 1)
      ctx.quadraticCurveTo(x + w * 0.15, y + 2, cx, y + 4)
      ctx.quadraticCurveTo(x + w * 0.88, y + 1, x + w - 2, y + h - 4)
      ctx.quadraticCurveTo(cx, y + h + 2, x + 3, y + h - 1)
      ctx.fill()
      ctx.fillStyle = "#8b5cf6"
      ctx.beginPath()
      ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2)
      ctx.arc(cx + 6, cy + 1, 2.6, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawSatellite = (x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = "#cbd5e1"
      ctx.fillRect(x + w * 0.32, y + h * 0.2, w * 0.36, h * 0.6)
      ctx.fillStyle = "#93c5fd"
      ctx.fillRect(x, y + h * 0.3, w * 0.26, h * 0.42)
      ctx.fillRect(x + w * 0.74, y + h * 0.3, w * 0.26, h * 0.42)
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + w * 0.26, y + h * 0.5)
      ctx.lineTo(x + w * 0.32, y + h * 0.5)
      ctx.moveTo(x + w * 0.68, y + h * 0.5)
      ctx.lineTo(x + w * 0.74, y + h * 0.5)
      ctx.stroke()
    }

    const drawScene = () => {
      ctx.fillStyle = "#0b1120"
      ctx.fillRect(0, 0, width, height)
      for (let i = 0; i < 36; i += 1) {
        const x = ((i * 77 - Math.floor(scoreLocal * 0.9)) % width + width) % width
        const y = 20 + ((i * 43) % 120)
        ctx.fillStyle = i % 2 === 0 ? "#cbd5e1" : "#93c5fd"
        ctx.fillRect(x, y, 2, 2)
      }
      ctx.fillStyle = "#334155"
      ctx.fillRect(0, groundY, width, 3)
      for (let i = 0; i < 50; i += 1) {
        const x = ((i * 36 + groundOffset) % width + width) % width
        ctx.fillStyle = i % 2 === 0 ? "#475569" : "#64748b"
        ctx.fillRect(x, groundY + 10, 18, 3)
      }

      for (const obstacle of state.obstacles) {
        if (obstacle.flying) {
          drawSatellite(obstacle.x, obstacle.y, obstacle.w, obstacle.h)
        } else {
          drawAsteroid(obstacle.x, obstacle.y, obstacle.w, obstacle.h)
        }
      }

      const playerHeight = crouching || crouchRef.current ? 30 : 42
      const playerY = state.y + (42 - playerHeight)
      drawRunnerAstronaut(132, playerY + Math.sin(runTick * 0.25) * 1.2, crouching || crouchRef.current)

      ctx.fillStyle = "#f8fafc"
      ctx.font = "bold 16px monospace"
      const scoreLabel = `HI ${Math.max(milestoneRef.current, displayedScore)}   ${t.score}: ${Math.floor(scoreLocal)}`
      ctx.fillText(scoreLabel, width - ctx.measureText(scoreLabel).width - 14, 24)
    }

    const step = () => {
      elapsedFrames += 1
      spawnTick += 1
      runTick += 1
      groundOffset -= speed
      speed = Math.min(9.2, speed + 0.0017)
      if (jumpRequestRef.current) {
        jump()
        jumpRequestRef.current = false
      }
      const canBoost = jumpHeldRef.current && performance.now() < jumpBoostUntilRef.current && state.vy < 0
      if (canBoost) {
        state.vy = Math.max(-13.8, state.vy - 0.22)
      }
      if (spawnTick > 74 - Math.min(24, Math.floor(speed * 2))) {
        spawnTick = 0
        const allowSatellites = elapsedFrames > 520
        const useSatellites = allowSatellites && Math.random() > 0.66

        if (useSatellites) {
          const satelliteX = width + 20
          const satelliteW = 64
          state.obstacles.push({
            x: satelliteX,
            w: satelliteW,
            h: 26,
            y: groundY - 142 - Math.random() * 36,
            flying: true,
          })
          const supportChance = Math.min(0.2 + elapsedFrames / 2600, 0.68)
          if (Math.random() < supportChance) {
            const leftLaneX = satelliteX - (24 + Math.random() * 6) - (72 + Math.random() * 26)
            const rightLaneX = satelliteX + satelliteW + 70 + Math.random() * 30
            const useRightLane = Math.random() > 0.5
            const baseX = useRightLane ? rightLaneX : leftLaneX
            const supportCount = Math.random() < 0.35 ? 2 : 1
            for (let i = 0; i < supportCount; i += 1) {
              state.obstacles.push({
                x: baseX + i * 38,
                w: 24 + Math.random() * 6,
                h: 28 + Math.random() * 8,
                y: groundY - 34,
                flying: false,
              })
            }
          }
        } else {
          const stackCount = Math.random() > 0.74 ? 3 : Math.random() > 0.52 ? 2 : 1
          for (let i = 0; i < stackCount; i += 1) {
            state.obstacles.push({
              x: width + 20 + i * 30,
              w: 26 + Math.random() * 8,
              h: 34 + Math.random() * 8,
              y: groundY - 40,
              flying: false,
            })
          }
        }
      }

      state.vy += 0.62
      state.y += state.vy
      if (state.y >= groundY - 52) {
        state.y = groundY - 52
        state.vy = 0
        jumpBoostUntilRef.current = 0
      }

      const playerHeight = crouching || crouchRef.current ? 30 : 42
      const playerTop = state.y + (42 - playerHeight)
      const playerBox = { x: 116, y: playerTop + 3, w: 32, h: playerHeight - 3 }

      for (const obstacle of state.obstacles) {
        obstacle.x -= speed
        if (!obstacle.scored && obstacle.x + obstacle.w < playerBox.x) obstacle.scored = true
        const hit =
          playerBox.x < obstacle.x + obstacle.w &&
          playerBox.x + playerBox.w > obstacle.x &&
          playerBox.y < obstacle.y + obstacle.h &&
          playerBox.y + playerBox.h > obstacle.y
        if (hit) {
          loseRound()
          return
        }
      }
      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x > -50)

      scoreLocal += speed * 0.34
      const parsedScore = Math.floor(scoreLocal)
      if (parsedScore !== displayedScore && elapsedFrames % 8 === 0) {
        displayedScore = parsedScore
        setScore(displayedScore)
      }
      if (parsedScore > bestThisRunRef.current) bestThisRunRef.current = parsedScore
      if (parsedScore > 0 && parsedScore % 500 === 0 && milestoneRef.current !== parsedScore) {
        milestoneRef.current = parsedScore
        playSfx(GC_SFX.bubbleAchievement, 0.65)
      }

      drawScene()
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerUp)
      jumpHeldRef.current = false
      jumpBoostUntilRef.current = 0
      jumpRequestRef.current = false
    }
  }, [running, profile, onBestScore, t, blockedByOrientation])

  return (
    <div className="relative rounded-2xl bg-slate-900/70 p-4">
      <p className="mb-2 text-sm text-slate-200">{t.dinoTitle} | {t.score}: {score}</p>
      <canvas ref={canvasRef} width={900} height={260} className="h-[260px] w-full rounded-xl border border-indigo-200/40" />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            if (blockedByOrientation) return
            setGameOver(false)
            setScore(0)
            milestoneRef.current = 0
            bestThisRunRef.current = 0
            jumpHeldRef.current = false
            jumpBoostUntilRef.current = 0
            jumpRequestRef.current = false
            setRunning((prev) => !prev)
          }}
          className="bg-indigo-400 text-slate-950 hover:bg-indigo-300"
        >
          {running ? t.pause : t.play}
        </Button>
      </div>
      {isTouchDevice && (
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button
          onTouchStart={() => {
            if (blockedByOrientation) return
            if (!jumpHeldRef.current) {
              jumpHeldRef.current = true
              jumpRequestRef.current = true
            }
          }}
          onTouchEnd={() => {
            jumpHeldRef.current = false
          }}
          onTouchCancel={() => {
            jumpHeldRef.current = false
          }}
          aria-label={t.flap}
        >
          ↑
        </Button>
        <Button
          onTouchStart={() => setCrouchHeld(true)}
          onTouchEnd={() => setCrouchHeld(false)}
          onTouchCancel={() => setCrouchHeld(false)}
          aria-label={t.moveDown}
        >
          ↓
        </Button>
      </div>
      )}
      <p className="mt-2 text-xs text-slate-300">{t.controls}: {t.dinoControls}</p>
      {blockedByOrientation && (
        <div className="absolute inset-0 z-30 grid place-items-center rounded-2xl bg-slate-950/92 px-6 text-center">
          <div className="rounded-2xl border border-cyan-200/40 bg-slate-900/85 p-5">
            <p className="text-lg font-bold text-cyan-100">{t.rotateToPlayTitle}</p>
            <p className="mt-2 text-sm text-slate-200">{t.rotateToPlayBody}</p>
          </div>
        </div>
      )}
      {gameOver && !running && (
        <button
          type="button"
          onClick={() => {
            setGameOver(false)
            setScore(0)
            milestoneRef.current = 0
            bestThisRunRef.current = 0
            jumpHeldRef.current = false
            jumpBoostUntilRef.current = 0
            jumpRequestRef.current = false
            setRunning(true)
          }}
          className="absolute inset-0 z-20 grid place-items-center rounded-2xl bg-rose-900/55 text-center"
        >
          <div className="rounded-2xl border border-rose-200/60 bg-rose-100/15 px-6 py-4">
            <p className="text-xl font-black text-rose-100">{t.fell}</p>
            <p className="mt-1 text-sm text-rose-50">{t.tapToReplay}</p>
          </div>
        </button>
      )}
    </div>
  )
}

type MemoryCategory = "fruits" | "planets" | "asteroids"
const MEMORY_CARD_SETS: Record<MemoryCategory, string[]> = {
  fruits: ["🍎", "🍌", "🍓", "🍇", "🍉", "🍒", "🍍", "🥝", "🍑", "🍐"],
  planets: ["🪐", "🌍", "🌕", "☀️", "🌎", "🌗", "🌙", "🌑", "🌟", "☄️"],
  asteroids: ["☄️", "🛰️", "🛸", "🚀", "🌠", "💫", "✨", "🛰", "🌌", "🧨"],
}

function shuffleCards<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function CosmicMemoryFlip({ t, onWin }: { t: (typeof GC_TRANSLATIONS)[Language]; onWin: () => void }) {
  const [category, setCategory] = useState<MemoryCategory>("fruits")
  const [timerChoice, setTimerChoice] = useState(300)
  const [stage, setStage] = useState(1)
  const [cards, setCards] = useState<Array<{ id: string; value: string; matched: boolean }>>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(300)
  const [started, setStarted] = useState(false)
  const [won, setWon] = useState(false)
  const [lost, setLost] = useState(false)

  const buildStageCards = (nextStage: number, nextCategory: MemoryCategory) => {
    const totalCards = nextStage === 1 ? 4 : nextStage === 2 ? 8 : 16
    const pairCount = totalCards / 2
    const selected = shuffleCards(MEMORY_CARD_SETS[nextCategory]).slice(0, pairCount)
    const pairs = shuffleCards(selected.flatMap((value, idx) => [{ id: `${value}-${idx}-a`, value, matched: false }, { id: `${value}-${idx}-b`, value, matched: false }]))
    setCards(pairs)
    setFlipped([])
  }

  useEffect(() => {
    if (!started || won || lost) return
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id)
          setLost(true)
          setStarted(false)
          playLose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [started, won, lost])

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const first = cards[a]
    const second = cards[b]
    if (!first || !second) return
    const timeout = window.setTimeout(() => {
      if (first.value === second.value) {
        setCards((prev) => prev.map((card, idx) => (idx === a || idx === b ? { ...card, matched: true } : card)))
        playSfx(GC_SFX.pairSolved, 0.65)
      }
      setFlipped([])
      setMoves((prev) => prev + 1)
    }, 380)
    return () => window.clearTimeout(timeout)
  }, [flipped, cards])

  useEffect(() => {
    if (!started || cards.length === 0) return
    const allMatched = cards.every((card) => card.matched)
    if (!allMatched) return
    if (stage < 3) {
      playAchievement()
      const nextStage = stage + 1
      setStage(nextStage)
      buildStageCards(nextStage, category)
      return
    }
    setWon(true)
    setStarted(false)
    playWin()
    onWin()
  }, [cards, stage, category, started, onWin])

  const startGame = () => {
    setWon(false)
    setLost(false)
    setMoves(0)
    setStage(1)
    setSecondsLeft(timerChoice)
    buildStageCards(1, category)
    setStarted(true)
  }

  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="mb-2 text-sm text-slate-200">{t.memoryTitle}</p>
      <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-2 text-xs text-slate-200">{t.stage}: {stage}/3</div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-2 text-xs text-slate-200">{t.timeLeft}: {secondsLeft}s</div>
        <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-2 text-xs text-slate-200">{t.moves}: {moves}</div>
      </div>

      {!started && cards.length === 0 && !won && !lost && (
        <div className="space-y-3 rounded-xl border border-cyan-200/25 bg-slate-950/55 p-3">
          <p className="text-xs text-slate-300">{t.chooseCategory}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button variant={category === "fruits" ? "default" : "secondary"} onClick={() => setCategory("fruits")}>{t.fruits}</Button>
            <Button variant={category === "planets" ? "default" : "secondary"} onClick={() => setCategory("planets")}>{t.planetsCategory}</Button>
            <Button variant={category === "asteroids" ? "default" : "secondary"} onClick={() => setCategory("asteroids")}>{t.asteroidsCategory}</Button>
          </div>
          <p className="text-xs text-slate-300">{t.chooseTimer}</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant={timerChoice === 60 ? "default" : "secondary"} onClick={() => setTimerChoice(60)}>{t.oneMinute}</Button>
            <Button variant={timerChoice === 180 ? "default" : "secondary"} onClick={() => setTimerChoice(180)}>{t.threeMinutes}</Button>
            <Button variant={timerChoice === 300 ? "default" : "secondary"} onClick={() => setTimerChoice(300)}>{t.fiveMinutes}</Button>
          </div>
          <Button onClick={startGame} className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">{t.startGame}</Button>
        </div>
      )}

      {cards.length > 0 && (
        <div className={`grid gap-2 ${cards.length >= 16 ? "grid-cols-4" : "grid-cols-4"}`}>
          {cards.map((card, idx) => {
            const isFaceUp = card.matched || flipped.includes(idx)
            return (
              <button
                key={card.id}
                type="button"
                disabled={card.matched || flipped.includes(idx) || flipped.length === 2 || won || lost}
                onClick={() => setFlipped((prev) => (prev.includes(idx) ? prev : [...prev, idx]))}
                className={`aspect-square rounded-xl border text-2xl transition ${
                  isFaceUp ? "border-cyan-300 bg-cyan-200/20" : "border-slate-700 bg-slate-800 hover:border-cyan-300"
                }`}
              >
                {isFaceUp ? card.value : "?"}
              </button>
            )
          })}
        </div>
      )}
      <p className="mt-2 text-xs text-slate-300">{t.controls}: {t.memoryControls}</p>
      {(won || lost) && (
        <div className="mt-3 rounded-xl border border-fuchsia-200/40 bg-fuchsia-900/20 p-3 text-center">
          <p className="font-bold text-fuchsia-100">{won ? t.allStagesClear : t.timesUp}</p>
          {won && <p className="mt-1 text-sm font-semibold text-fuchsia-50">{t.youWon} {t.congratsMessage}</p>}
          <Button
            onClick={() => {
              setCards([])
              setFlipped([])
              setWon(false)
              setLost(false)
            }}
            className="mt-2 bg-white text-fuchsia-900 hover:bg-fuchsia-100"
          >
            {t.play}
          </Button>
        </div>
      )}
    </div>
  )
}

function GameCenterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const currentLang = (langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en") as Language
  const isRTL = currentLang === "ar"
  const t = GC_TRANSLATIONS[currentLang]
  const [game, setGame] = useState<GameKey>("pong")
  const [profile, setProfile] = useState<GameCenterProfile | null>(null)
  const [soundMuted, setSoundMuted] = useState(false)
  const [ambientOn, setAmbientOn] = useState(true)
  const [progress, setProgress] = useState<GameProgress>({
    pongVictories: 0,
    orbitCompletedPlanets: [],
    flappyMilestones: [],
    dinoBestScore: 0,
    memoryWins: 0,
  })

  const title = useMemo(
    () =>
      game === "pong"
        ? t.pongTitle
        : game === "invaders"
          ? t.invadersTitle
          : game === "flappy"
            ? t.flappyTitle
            : game === "dino"
              ? t.dinoTitle
              : t.memoryTitle,
    [game, t],
  )

  useEffect(() => {
    const raw = localStorage.getItem("game_center_profile_v1")
    if (!raw) {
      router.replace(`/game-center/customize?lang=${currentLang}`)
      return
    }
    try {
      const parsed = JSON.parse(raw) as GameCenterProfile
      if (!parsed.nickname || !parsed.suitColor || !parsed.badge) {
        router.replace(`/game-center/customize?lang=${currentLang}`)
        return
      }
      setProfile(parsed)
    } catch {
      router.replace(`/game-center/customize?lang=${currentLang}`)
    }
  }, [router, currentLang])

  useEffect(() => {
    GC_MUTED = soundMuted
  }, [soundMuted])

  useEffect(() => {
    if (soundMuted || !ambientOn) return

    let disposed = false
    let order = shuffled(GC_AMBIENT_TRACKS)
    let trackIndex = 0
    const audio = new Audio()
    audio.volume = 0.35
    audio.preload = "auto"

    const playNext = () => {
      if (disposed || soundMuted || !ambientOn) return
      if (trackIndex >= order.length) {
        order = shuffled(GC_AMBIENT_TRACKS)
        trackIndex = 0
      }
      audio.src = order[trackIndex]
      trackIndex += 1
      audio.currentTime = 0
      audio.play().catch(() => {
        // Ignore autoplay/user-gesture restrictions.
      })
    }

    const onEnded = () => playNext()
    audio.addEventListener("ended", onEnded)
    playNext()

    return () => {
      disposed = true
      audio.pause()
      audio.removeEventListener("ended", onEnded)
      audio.src = ""
    }
  }, [soundMuted, ambientOn])

  useEffect(() => {
    const raw = localStorage.getItem("game_center_progress_v1")
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as GameProgress
      setProgress({
        pongVictories: parsed.pongVictories ?? 0,
        orbitCompletedPlanets: parsed.orbitCompletedPlanets ?? [],
        flappyMilestones: parsed.flappyMilestones ?? [],
        dinoBestScore: parsed.dinoBestScore ?? 0,
        memoryWins: parsed.memoryWins ?? 0,
      })
    } catch {
      // no-op
    }
  }, [])

  const handlePongWin = () => {
    setProgress((prev) => {
      const next = { ...prev, pongVictories: prev.pongVictories + 1 }
      localStorage.setItem("game_center_progress_v1", JSON.stringify(next))
      return next
    })
  }

  const handleOrbitPlanetClear = (clearedPlanet: string) => {
    setProgress((prev) => {
      if (prev.orbitCompletedPlanets.includes(clearedPlanet)) return prev
      const next = {
        ...prev,
        orbitCompletedPlanets: [...prev.orbitCompletedPlanets, clearedPlanet],
      }
      localStorage.setItem("game_center_progress_v1", JSON.stringify(next))
      return next
    })
  }

  const handleFlappyMilestone = (milestone: number) => {
    setProgress((prev) => {
      if (prev.flappyMilestones.includes(milestone)) return prev
      const next = {
        ...prev,
        flappyMilestones: [...prev.flappyMilestones, milestone].sort((a, b) => a - b),
      }
      localStorage.setItem("game_center_progress_v1", JSON.stringify(next))
      return next
    })
  }

  const handleDinoBest = useCallback((scoreValue: number) => {
    setProgress((prev) => {
      if (scoreValue <= prev.dinoBestScore) return prev
      const next = { ...prev, dinoBestScore: scoreValue }
      localStorage.setItem("game_center_progress_v1", JSON.stringify(next))
      return next
    })
  }, [])

  const handleMemoryWin = () => {
    setProgress((prev) => {
      const next = { ...prev, memoryWins: prev.memoryWins + 1 }
      localStorage.setItem("game_center_progress_v1", JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 pb-24">
        {profile && (
          <div className="rounded-3xl border border-emerald-200/30 bg-gradient-to-br from-emerald-900/35 to-cyan-900/35 p-4">
            <p className="text-xs uppercase tracking-wide text-emerald-100/90">{t.profile}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="w-20">
                <AstronautAvatar suitColor={profile.suitColor} helmetStyle={profile.helmetStyle} badge={profile.badge} />
              </div>
              <div>
                <p className="text-base font-bold text-white">{profile.nickname}</p>
                <Link href={`/game-center/customize?lang=${currentLang}`} className="text-xs text-cyan-200 hover:text-cyan-100">
                  {t.editCharacter}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <p className="text-sm text-cyan-100">{t.chooseGame}</p>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => setSoundMuted((v) => !v)} variant="secondary">
              {soundMuted ? t.unmuteSounds : t.muteSounds}
            </Button>
            <Button onClick={() => setAmbientOn((v) => !v)} variant="secondary">
              {ambientOn ? t.ambientOn : t.ambientOff}
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button onClick={() => setGame("pong")} variant={game === "pong" ? "default" : "secondary"}>{t.pongTitle}</Button>
            <Button onClick={() => setGame("invaders")} variant={game === "invaders" ? "default" : "secondary"}>{t.invadersTitle}</Button>
            <Button onClick={() => setGame("flappy")} variant={game === "flappy" ? "default" : "secondary"}>{t.flappyTitle}</Button>
            <Button onClick={() => setGame("dino")} variant={game === "dino" ? "default" : "secondary"}>{t.dinoTitle}</Button>
            <Button onClick={() => setGame("memory")} variant={game === "memory" ? "default" : "secondary"}>{t.memoryTitle}</Button>
          </div>
          <p className="mt-3 text-xs text-slate-300">{t.nowPlaying}: {title}</p>
          <Link href={`/main?lang=${currentLang}`} data-transition-style="random" className="mt-3 inline-block text-xs text-cyan-300 hover:text-cyan-200">
            {t.backToMain}
          </Link>
        </div>

        <div className="rounded-3xl border border-fuchsia-200/30 bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <p className="text-sm font-bold text-fuchsia-100">{t.achievements}</p>
          <p className="mt-2 text-xs text-slate-300"><span className="font-bold text-fuchsia-200">{t.pongTitle}</span>: {progress.pongVictories}</p>
          <p className="mt-2 text-xs text-slate-300">
            <span className="font-bold text-fuchsia-200">{t.invadersTitle}</span>: {progress.orbitCompletedPlanets.length === 0 ? t.noneYet : progress.orbitCompletedPlanets.map((planetName) => localizePlanetName(planetName, t)).join(", ")}
          </p>
          <p className="mt-2 text-xs text-slate-300">
            <span className="font-bold text-fuchsia-200">{t.flappyTitle}</span>: {progress.flappyMilestones.length === 0 ? t.noneYet : progress.flappyMilestones.map((s) => `${s}`).join(", ")}
          </p>
          <p className="mt-2 text-xs text-slate-300"><span className="font-bold text-fuchsia-200">{t.dinoTitle}</span>: {progress.dinoBestScore}</p>
          <p className="mt-2 text-xs text-slate-300"><span className="font-bold text-fuchsia-200">{t.memoryTitle}</span>: {progress.memoryWins}</p>
        </div>

        {game === "pong" && <NebulaPaddleDuel onWin={handlePongWin} t={t} />}
        {game === "invaders" && <OrbitInvaders onPlanetClear={handleOrbitPlanetClear} t={t} />}
        {game === "flappy" && (
          <AstroFlapRunner
            profile={profile}
            onMilestone={handleFlappyMilestone}
            unlockedMilestones={progress.flappyMilestones}
            t={t}
          />
        )}
        {game === "dino" && <DinoAstroRunner profile={profile} t={t} onBestScore={handleDinoBest} />}
        {game === "memory" && <CosmicMemoryFlip t={t} onWin={handleMemoryWin} />}
      </div>
      <BottomNav lang={currentLang} />
    </div>
  )
}

export default function GameCenterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <GameCenterContent />
    </Suspense>
  )
}

function AstronautAvatar({
  suitColor,
  helmetStyle,
  badge,
}: {
  suitColor: string
  helmetStyle: "classic" | "visor" | "gold" | "midnight"
  badge: "star" | "moon" | "planet" | "comet"
}) {
  const visorFill = helmetStyle === "gold" ? "#f59e0b" : helmetStyle === "midnight" ? "#6366f1" : helmetStyle === "visor" ? "#22d3ee" : "#94a3b8"
  const trimColor = helmetStyle === "gold" ? "#fde68a" : helmetStyle === "midnight" ? "#c7d2fe" : helmetStyle === "visor" ? "#a5f3fc" : "#e2e8f0"

  return (
    <svg viewBox="0 0 220 220" className="h-16 w-16">
      <ellipse cx="110" cy="200" rx="54" ry="11" fill="#00000066" />
      <rect x="72" y="104" width="76" height="82" rx="20" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="89" y="118" width="42" height="32" rx="8" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
      {badge === "star" && (
        <path
          d="M110 124 L113.5 131.3 L121.5 132.2 L115.6 137.6 L117.1 145.4 L110 141.4 L102.9 145.4 L104.4 137.6 L98.5 132.2 L106.5 131.3 Z"
          fill="#fde68a"
          stroke="#fef3c7"
          strokeWidth="1.2"
        />
      )}
      {badge === "moon" && (
        <>
          <circle cx="110" cy="134" r="9" fill="#e2e8f0" />
          <circle cx="114" cy="132" r="8" fill="#0f172a" />
        </>
      )}
      {badge === "planet" && (
        <>
          <circle cx="110" cy="134" r="7" fill="#93c5fd" />
          <ellipse cx="110" cy="134" rx="13" ry="4.5" fill="none" stroke="#bfdbfe" strokeWidth="1.8" />
        </>
      )}
      {badge === "comet" && (
        <>
          <circle cx="115" cy="129" r="4.8" fill="#fef08a" />
          <path d="M98 141 C103 136,108 133,113 131" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M101 144 C106 139,109 137,114 134" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      <rect x="54" y="118" width="18" height="52" rx="9" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="148" y="118" width="18" height="52" rx="9" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="84" y="176" width="18" height="24" rx="7" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="118" y="176" width="18" height="24" rx="7" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="110" cy="74" r="40" fill="#f8fafc" stroke={trimColor} strokeWidth="4" />
      <ellipse cx="110" cy="78" rx="28" ry="20" fill={visorFill} opacity="0.85" />
      <circle cx="100" cy="71" r="5" fill="#f8fafc" opacity="0.7" />
      <rect x="99" y="28" width="22" height="8" rx="4" fill={trimColor} />
    </svg>
  )
}
