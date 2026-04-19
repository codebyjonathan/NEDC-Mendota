let sharedMusicAudio: HTMLAudioElement | null = null

type MusicSession = {
  kind: "track" | "custom-audio" | null
  trackId?: string
  customUrl?: string
  customSongName?: string
  customArtistName?: string
}

const BACKGROUND_MUSIC_KEY = "allow_music_background_playback"

let backgroundPlaybackEnabled = false
let hasLoadedPreference = false
let musicSession: MusicSession = { kind: null }

function loadBackgroundPreference(): boolean {
  if (typeof window === "undefined") return false
  const saved = window.localStorage.getItem(BACKGROUND_MUSIC_KEY)
  return saved === "true"
}

export function getBackgroundPlaybackEnabled(): boolean {
  if (!hasLoadedPreference) {
    backgroundPlaybackEnabled = loadBackgroundPreference()
    hasLoadedPreference = true
  }

  return backgroundPlaybackEnabled
}

export function setBackgroundPlaybackEnabled(enabled: boolean) {
  backgroundPlaybackEnabled = enabled
  hasLoadedPreference = true

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BACKGROUND_MUSIC_KEY, String(enabled))
  }
}

export function getSharedMusicAudio(): HTMLAudioElement | null {
  return sharedMusicAudio
}

export function setSharedMusicAudio(audio: HTMLAudioElement | null) {
  sharedMusicAudio = audio
}

export function stopSharedMusicAudio(reset: boolean = true) {
  if (!sharedMusicAudio) return

  sharedMusicAudio.pause()
  if (reset) {
    sharedMusicAudio.currentTime = 0
  }

  sharedMusicAudio.ontimeupdate = null
  sharedMusicAudio.onloadedmetadata = null
  sharedMusicAudio.onended = null
}

export function clearSharedMusicAudio() {
  if (!sharedMusicAudio) return

  sharedMusicAudio.ontimeupdate = null
  sharedMusicAudio.onloadedmetadata = null
  sharedMusicAudio.onended = null
  sharedMusicAudio = null
}

export function getMusicSession(): MusicSession {
  return musicSession
}

export function setMusicSession(session: MusicSession) {
  musicSession = session
}

export function clearMusicSession() {
  musicSession = { kind: null }
}
