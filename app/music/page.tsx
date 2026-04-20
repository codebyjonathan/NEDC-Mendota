"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useRef, useEffect } from "react"
import { Music, Play, Pause, Volume2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Switch } from "@/components/ui/switch"
import {
  clearMusicSession,
  clearSharedMusicAudio,
  getBackgroundPlaybackEnabled,
  getMusicSession,
  getSharedMusicAudio,
  setBackgroundPlaybackEnabled,
  setMusicSession,
  setSharedMusicAudio,
  stopSharedMusicAudio,
} from "@/lib/music-audio"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"
import { translations } from "@/lib/translations"

interface MusicTrack {
  id: string
  name: { en: string; es: string; ar: string }
  artist: { en: string; es: string; ar: string }
  description: { en: string; es: string; ar: string }
  url: string
  color: string
  image: string
  affirmation: { en: string; es: string; ar: string }
}

function MusicContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const [playing, setPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [customMusicUrl, setCustomMusicUrl] = useState("")
  const [customSongName, setCustomSongName] = useState("")
  const [customArtistName, setCustomArtistName] = useState("")
  const [customMusicPlaying, setCustomMusicPlaying] = useState(false)
  const [customMusicError, setCustomMusicError] = useState("")
  const customAudioRef = useRef<HTMLAudioElement | null>(null)
  const [customMusicType, setCustomMusicType] = useState<"audio" | "youtube" | "spotify" | null>(null)
  const [youtubeVideoId, setYoutubeVideoId] = useState("")
  const [spotifyTrackId, setSpotifyTrackId] = useState("")
  const [allowBackgroundPlayback, setAllowBackgroundPlaybackState] = useState(false)
  const allowBackgroundPlaybackRef = useRef(false)

  useEffect(() => {
    markSolarGoalCompleted("visit_music_screen")

    const backgroundEnabled = getBackgroundPlaybackEnabled()
    setAllowBackgroundPlaybackState(backgroundEnabled)
    allowBackgroundPlaybackRef.current = backgroundEnabled

    const sharedAudio = getSharedMusicAudio()
    const session = getMusicSession()

    if (sharedAudio && !sharedAudio.paused) {
      if (session.kind === "track" && session.trackId) {
        audioRef.current = sharedAudio
        setPlaying(session.trackId)
      } else if (session.kind === "custom-audio") {
        customAudioRef.current = sharedAudio
        setCustomMusicPlaying(true)
        setCustomMusicType("audio")
        setCustomMusicUrl(session.customUrl ?? "")
        setCustomSongName(session.customSongName ?? "")
        setCustomArtistName(session.customArtistName ?? "")
      }
    }

    return () => {
      if (!allowBackgroundPlaybackRef.current) {
        stopSharedMusicAudio()
        clearSharedMusicAudio()
        clearMusicSession()
      }
      audioRef.current = null
      customAudioRef.current = null
    }
  }, [])

  const musicTracks: MusicTrack[] = [
    {
      id: "beach",
      name: { en: "Beach Meditation", es: "Meditación en la Playa", ar: "تأمل الشاطئ" },
      artist: { en: "Calming Waves", es: "Olas Tranquilas", ar: "الأمواج الهادئة" },
      description: { en: "Guided relaxation by the ocean", es: "Relajación guiada junto al océano", ar: "استرخاء موجه بجانب المحيط" },
      url: "/beach-sound.mp4",
      color: "from-blue-400 to-cyan-300",
      image: "/peaceful-beach-sunset-waves.jpg",
      affirmation: { en: "Close your eyes and breathe deeply. Feel the gentle ocean breeze. You are safe, you are calm.", es: "Cierra los ojos y respira profundamente. Siente la suave brisa del océano. Estás seguro, estás tranquilo.", ar: "أغمض عينيك وتنفس بعمق. اشعر بنسيم المحيط اللطيف. أنت آمن، أنت هادئ." },
    },
    {
      id: "forest",
      name: { en: "Forest Serenity", es: "Serenidad del Bosque", ar: "هدوء الغابة" },
      artist: { en: "Nature Sounds", es: "Sonidos de la Naturaleza", ar: "أصوات الطبيعة" },
      description: { en: "Nature sounds with calming voice", es: "Sonidos de la naturaleza con voz tranquilizadora", ar: "أصوات الطبيعة مع صوت مهدئ" },
      url: "https://assets.mixkit.co/active_storage/sfx/2392/2392-preview.mp3",
      color: "from-green-400 to-emerald-300",
      image: "/peaceful-forest-trees-sunlight.jpg",
      affirmation: { en: "Let the sounds of nature wash over you. Release your worries with each breath. You deserve peace.", es: "Deja que los sonidos de la naturaleza te envuelvan. Libera tus preocupaciones con cada respiración. Mereces paz.", ar: "دع أصوات الطبيعة تغمرك. أطلق همومك مع كل نفس. أنت تستحق السلام." },
    },
    {
      id: "rain",
      name: { en: "Rainfall Meditation", es: "Meditación de Lluvia", ar: "تأمل المطر" },
      artist: { en: "Rain Therapy", es: "Terapia de Lluvia", ar: "علاج المطر" },
      description: { en: "Soothing rain with affirmations", es: "Lluvia relajante con afirmaciones", ar: "مطر مهدئ مع التأكيدات" },
      url: "https://assets.mixkit.co/active_storage/sfx/2393/2393-preview.mp3",
      color: "from-slate-400 to-blue-300",
      image: "/rain-drops-window-peaceful-evening.jpg",
      affirmation: { en: "Each drop of rain washes away your stress. You are becoming lighter, freer, more at peace with each moment.", es: "Cada gota de lluvia lava tu estrés. Te vuelves más ligero, más libre, más en paz con cada momento.", ar: "كل قطرة مطر تغسل التوتر. أنت تصبح أخف، أكثر حرية، أكثر سلامًا مع كل لحظة." },
    },
    {
      id: "night",
      name: { en: "Starry Night", es: "Noche Estrellada", ar: "ليلة النجوم" },
      artist: { en: "Night Sky", es: "Cielo Nocturno", ar: "السماء الليلية" },
      description: { en: "Evening calm with gentle guidance", es: "Calma nocturna con guía suave", ar: "هدوء المساء مع إرشاد لطيف" },
      url: "/space-feeling.mp4",
      color: "from-indigo-500 to-purple-400",
      image: "/starry-night-sky-peaceful-stars.jpg",
      affirmation: { en: "Under the vast night sky, know that you matter. Your feelings are valid. Tomorrow brings new hope.", es: "Bajo el vasto cielo nocturno, sabe que importas. Tus sentimientos son válidos. Mañana trae nueva esperanza.", ar: "تحت السماء الليلية الشاسعة، اعلم أنك مهم. مشاعرك صحيحة. الغد يحمل أملاً جديداً." },
    },
  ]

  const extractSongInfo = (url: string) => {
    try {
      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return {
          song: "YouTube",
          artist: "YouTube",
        }
      }

      // Spotify  
      if (url.includes("spotify.com")) {
        return {
          song: "Spotify",
          artist: "Spotify",
        }
      }

      // SoundCloud
      if (url.includes("soundcloud.com")) {
        return {
          song: "SoundCloud Track",
          artist: "SoundCloud",
        }
      }

      // Direct audio URLs
      if (url.includes(".mp3") || url.includes(".wav") || url.includes(".m4a") || url.includes(".ogg")) {
        const filename = url.split("/").pop() || "Audio File"
        return {
          song: filename.split("?")[0],
          artist: lang === "en" ? "Unknown Artist" : lang === "es" ? "Artista Desconocido" : "فنان غير معروف",
        }
      }

      return {
        song: lang === "en" ? "Custom Music" : lang === "es" ? "Música Personalizada" : "الموسيقى المخصصة",
        artist: lang === "en" ? "Unknown" : lang === "es" ? "Desconocido" : "غير معروف",
      }
    } catch {
      return {
        song: lang === "en" ? "Custom Music" : lang === "es" ? "Música Personalizada" : "الموسيقى المخصصة",
        artist: lang === "en" ? "Unknown" : lang === "es" ? "Desconocido" : "غير معروف",
      }
    }
  }

  const getYoutubeVideoId = (url: string): string | null => {
    try {
      if (url.includes("youtu.be/")) {
        return url.split("youtu.be/")[1]?.split(/[?&]/)[0] || null
      }
      if (url.includes("youtube.com")) {
        const match = url.match(/v=([a-zA-Z0-9_-]{11})/)
        return match?.[1] || null
      }
    } catch {
      return null
    }
    return null
  }

  const getSpotifyTrackId = (url: string): string | null => {
    try {
      const match = url.match(/track\/([a-zA-Z0-9]+)/)
      return match?.[1] || null
    } catch {
      return null
    }
  }

  // Advanced URL handler for platform-specific audio extraction
  const getPlayableAudioUrl = (url: string): { audioUrl: string | null; method: string; needsProxy: boolean } => {
    try {
      // Direct audio files - play as-is
      if (url.includes(".mp3") || url.includes(".wav") || url.includes(".m4a") || url.includes(".ogg")) {
        return { audioUrl: url, method: "direct", needsProxy: false }
      }

      // SoundCloud - try to extract stream URL
      if (url.includes("soundcloud.com")) {
        // SoundCloud URLs often don't have direct playable links without API
        // Return null with instruction
        return { audioUrl: null, method: "soundcloud", needsProxy: true }
      }

      // Spotify - try to get preview URL from share link
      if (url.includes("spotify.com")) {
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/)
        if (trackMatch) {
          const trackId = trackMatch[1]
          // Spotify preview URL format (30-second preview)
          return {
            audioUrl: `https://p.scdn.co/mp3-preview/${trackId}`,
            method: "spotify-preview",
            needsProxy: false,
          }
        }
        return { audioUrl: null, method: "spotify", needsProxy: true }
      }

      // YouTube - cannot play directly due to DRM
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return { audioUrl: null, method: "youtube", needsProxy: true }
      }

      // Generic URL - try direct playback
      if (url.startsWith("http")) {
        return { audioUrl: url, method: "generic", needsProxy: false }
      }

      return { audioUrl: null, method: "unknown", needsProxy: true }
    } catch (error) {
      return { audioUrl: null, method: "error", needsProxy: true }
    }
  }

  // Get helpful error message for unsupported platforms
  const getUnsupportedPlatformMessage = (method: string): string => {
    const messages: { [key: string]: { en: string; es: string; ar: string } } = {
      youtube: {
        en: "YouTube videos require embedding. Download the audio first from YouTube converters and upload as MP3.",
        es: "Los videos de YouTube requieren incrustación. Descargue el audio primero de convertidores de YouTube e cargue como MP3.",
        ar: "تتطلب مقاطع YouTube التضمين. قم بتنزيل الصوت أولاً من محولات YouTube وقم بتحميله كـ MP3.",
      },
      soundcloud: {
        en: "Direct SoundCloud URLs require API authentication. Copy the track link and use a SoundCloud to MP3 converter first.",
        es: "Las URL directas de SoundCloud requieren autenticación de API. Copie el enlace de la pista y use primero un convertidor de SoundCloud a MP3.",
        ar: "عناوين URL المباشرة لـ SoundCloud تتطلب مصادقة API. انسخ رابط المسار واستخدم أولاً محول SoundCloud إلى MP3.",
      },
      spotify: {
        en: "Spotify requires app authentication. Use an online Spotify to MP3 converter or share link for 30-second preview.",
        es: "Spotify requiere autenticación de la aplicación. Utilice un convertidor de Spotify a MP3 en línea o comparta el enlace para vista previa de 30 segundos.",
        ar: "يتطلب Spotify مصادقة التطبيق. استخدم محول Spotify إلى MP3 عبر الإنترنت أو شارك الرابط لمعاينة 30 ثانية.",
      },
      generic: {
        en: "This URL format is not supported. Please use direct audio file links (MP3, WAV, OGG) or supported platforms.",
        es: "Este formato de URL no es compatible. Use enlaces de archivos de audio directos (MP3, WAV, OGG) o plataformas compatibles.",
        ar: "تنسيق عنوان URL هذا غير مدعوم. يرجى استخدام روابط ملفات صوتية مباشرة (MP3, WAV, OGG) أو منصات مدعومة.",
      },
    }

    return messages[method]?.[lang] || messages["generic"][lang]
  }

  const isValidMusicUrl = (url: string) => {
    if (!url.trim()) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleCustomMusicPlay = () => {
    setCustomMusicError("")

    if (!customMusicUrl.trim()) {
      setCustomMusicError(t.pasteUrl)
      return
    }

    if (!isValidMusicUrl(customMusicUrl)) {
      setCustomMusicError(t.urlNotSupported)
      return
    }

    if (customMusicPlaying) {
      if (customAudioRef.current) {
        customAudioRef.current.pause()
      }
      clearMusicSession()
      setYoutubeVideoId("")
      setSpotifyTrackId("")
      setCustomMusicPlaying(false)
      return
    }

    // Check if it's a SoundCloud link - not supported
    if (customMusicUrl.includes("soundcloud.com")) {
      setCustomMusicError(getUnsupportedPlatformMessage("soundcloud"))
      return
    }

    // Check if it's a YouTube link
    if (customMusicUrl.includes("youtube.com") || customMusicUrl.includes("youtu.be")) {
      const videoId = getYoutubeVideoId(customMusicUrl)
      if (videoId) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        if (customAudioRef.current) {
          customAudioRef.current.pause()
        }
        clearSharedMusicAudio()
        clearMusicSession()
        setPlaying(null)
        const info = extractSongInfo(customMusicUrl)
        setCustomSongName(info.song)
        setCustomArtistName(info.artist)
        setYoutubeVideoId(videoId)
        setSpotifyTrackId("")
        setCustomMusicType("youtube")
        setCustomMusicPlaying(true)
        markSolarGoalCompleted("play_music")
        markSolarGoalCompleted("play_music_url")
        return
      }
    }

    // Check if it's a Spotify link
    if (customMusicUrl.includes("spotify.com")) {
      const trackId = getSpotifyTrackId(customMusicUrl)
      if (trackId) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        if (customAudioRef.current) {
          customAudioRef.current.pause()
        }
        clearSharedMusicAudio()
        clearMusicSession()
        setPlaying(null)
        const info = extractSongInfo(customMusicUrl)
        setCustomSongName(info.song)
        setCustomArtistName(info.artist)
        setYoutubeVideoId("")
        setSpotifyTrackId(trackId)
        setCustomMusicType("spotify")
        setCustomMusicPlaying(true)
        markSolarGoalCompleted("play_music")
        markSolarGoalCompleted("play_music_url")
        return
      }
    }

    // Try direct audio playback
    try {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause()
      }
      setYoutubeVideoId("")
      setSpotifyTrackId("")
      setPlaying(null)

      const existingAudio = getSharedMusicAudio()
      const targetUrl = new URL(customMusicUrl, window.location.href).href
      if (existingAudio && existingAudio.src !== targetUrl) {
        existingAudio.pause()
      }
      const audio = existingAudio && existingAudio.src === targetUrl ? existingAudio : new Audio(customMusicUrl)
      audio.crossOrigin = "anonymous"
      audio.loop = true

      audio.addEventListener(
        "canplay",
        () => {
          console.log("Audio ready to play")
        },
        { once: true }
      )

      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e)
        setCustomMusicError(lang === "en" ? "Unable to play this audio. Please check the URL." : lang === "es" ? "No se puede reproducir este audio. Verifique la URL." : "لا يمكن تشغيل هذا الصوت. يرجى التحقق من العنوان.")
        setCustomMusicPlaying(false)
      })

      audio.play()
      customAudioRef.current = audio
      setSharedMusicAudio(audio)
      const info = extractSongInfo(customMusicUrl)
      setCustomSongName(info.song)
      setCustomArtistName(info.artist)
      setCustomMusicType("audio")
      setCustomMusicPlaying(true)
      markSolarGoalCompleted("play_music")
      markSolarGoalCompleted("play_music_url")
      setMusicSession({
        kind: "custom-audio",
        customUrl: customMusicUrl,
        customSongName: info.song,
        customArtistName: info.artist,
      })
    } catch (error) {
      setCustomMusicError(t.unableToPLay)
      setCustomMusicPlaying(false)
    }
  }

  const togglePlay = (track: MusicTrack) => {
    if (playing === track.id) {
      audioRef.current?.pause()
      clearMusicSession()
      setPlaying(null)
      setCurrentTime(0)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (customAudioRef.current) {
        customAudioRef.current.pause()
      }
      clearMusicSession()
      setCustomMusicPlaying(false)

      const existingAudio = getSharedMusicAudio()
      const targetUrl = new URL(track.url, window.location.href).href
      if (existingAudio && existingAudio.src !== targetUrl) {
        existingAudio.pause()
      }
      const audio = existingAudio && existingAudio.src === targetUrl ? existingAudio : new Audio(track.url)
      audio.crossOrigin = "anonymous"
      audio.loop = true
      
      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })

      audio.addEventListener("ended", () => {
        setPlaying(null)
        setCurrentTime(0)
      })

      audio.play()
      audioRef.current = audio
      setSharedMusicAudio(audio)
      setMusicSession({ kind: "track", trackId: track.id })
      setPlaying(track.id)
      markSolarGoalCompleted("play_music")
    }
  }

  const toggleBackgroundPlayback = (enabled: boolean) => {
    setAllowBackgroundPlaybackState(enabled)
    allowBackgroundPlaybackRef.current = enabled
    setBackgroundPlaybackEnabled(enabled)
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-5 py-8 space-y-8 pb-24">
        <div className="text-center space-y-3">
          <Music className="w-16 h-16 mx-auto text-indigo-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.musicTitle}</h2>
          <p className="text-lg text-gray-600 px-4">{t.musicDesc}</p>
        </div>

        <div className="space-y-6">
          {musicTracks.map((track) => {
            const isPlaying = playing === track.id

            return (
              <div
                key={track.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`h-56 bg-gradient-to-br ${track.color} relative overflow-hidden`}>
                  <img
                    src={track.image || "/placeholder.svg"}
                    alt={track.name[lang]}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <button
                    onClick={() => togglePlay(track)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                      {isPlaying ? (
                        <Pause className="w-12 h-12 text-indigo-600" />
                      ) : (
                        <Play className="w-12 h-12 text-indigo-600 ml-1" />
                      )}
                    </div>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{track.name[lang]}</h3>
                    <p className="text-sm text-gray-500 mt-1">{track.artist[lang]}</p>
                    <p className="text-base text-gray-600 mt-2">{track.description[lang]}</p>
                  </div>

                  {isPlaying && (
                    <div className="bg-indigo-50 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-indigo-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all"
                            style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                      <p className="text-base text-indigo-900 italic leading-relaxed">{track.affirmation[lang]}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
          <div className="h-56 bg-gradient-to-br from-amber-400 to-orange-300 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-black/10" />
            <Music className="w-24 h-24 text-white opacity-50" />
          </div>

          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{t.customMusic}</h3>
              <p className="text-base text-gray-600 mt-2">{t.pasteToPlay}</p>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder={t.urlPlaceholder}
                value={customMusicUrl}
                onChange={(e) => {
                  setCustomMusicUrl(e.target.value)
                  setCustomMusicError("")
                }}
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
              <button
                onClick={handleCustomMusicPlay}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2 whitespace-nowrap"
              >
                {customMusicPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    {t.pause}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {t.play}
                  </>
                )}
              </button>
            </div>

            {customMusicError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center">
                <p className="text-sm text-amber-800">{customMusicError}</p>
                {customMusicError.includes("detected") && (
                  <a href={customMusicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:text-amber-700 underline ml-2 flex-shrink-0">
                    Open Link →
                  </a>
                )}
              </div>
            )}

            {customMusicPlaying && customSongName && (
              <div className="bg-amber-50 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {customMusicType === "youtube" && youtubeVideoId && (
                  <div className="w-full aspect-video rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {customMusicType === "spotify" && spotifyTrackId && (
                  <div className="w-full flex justify-center">
                    <iframe
                      src={`https://open.spotify.com/embed/track/${spotifyTrackId}?utm_source=generator`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  </div>
                )}

                {customMusicType === "audio" && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <Music className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">{t.nowPlaying}</p>
                        <p className="text-base text-amber-800 font-medium">{customSongName}</p>
                        <p className="text-sm text-amber-700 mt-0.5">{customArtistName}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setCustomMusicPlaying(false)
                    setCustomMusicUrl("")
                    setCustomSongName("")
                    setCustomArtistName("")
                    setYoutubeVideoId("")
                    setSpotifyTrackId("")
                    setCustomMusicType(null)
                    if (customAudioRef.current) {
                      customAudioRef.current.pause()
                    }
                    clearSharedMusicAudio()
                    clearMusicSession()
                  }}
                  className="w-full text-amber-600 hover:text-amber-700 font-semibold py-2 text-center"
                >
                  {lang === "en" ? "Close Player" : lang === "es" ? "Cerrar Reproductor" : "إغلاق المشغل"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-gray-900">{t.benefitsTitle}</h3>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>{t.benefit1}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>{t.benefit2}</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-500 text-xl">•</span>
              <span>{t.benefit3}</span>
            </li>
          </ul>
          <div className="pt-3 border-t border-indigo-100">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 p-4">
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  {lang === "en" ? "Allow music to play in background" : lang === "es" ? "Permitir música en segundo plano" : "السماح بتشغيل الموسيقى في الخلفية"}
                </p>
                <p className="text-xs text-gray-600">
                  {lang === "en"
                    ? "Keeps built-in tracks and direct custom audio playing while you navigate the app."
                    : lang === "es"
                      ? "Mantiene las pistas y el audio personalizado directo reproduciéndose mientras navega la app."
                      : "يبقي المقاطع والصوت المخصص المباشر قيد التشغيل أثناء التنقل في التطبيق."}
                </p>
              </div>
              <Switch
                checked={allowBackgroundPlayback}
                onCheckedChange={toggleBackgroundPlayback}
                aria-label={lang === "en" ? "Allow music to play in background" : lang === "es" ? "Permitir música en segundo plano" : "السماح بتشغيل الموسيقى في الخلفية"}
              />
            </div>
          </div>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function MusicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <MusicContent />
    </Suspense>
  )
}

