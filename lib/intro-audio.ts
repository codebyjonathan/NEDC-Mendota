let introAudioEl: HTMLAudioElement | null = null;

function getIntroAudio(): HTMLAudioElement {
  if (!introAudioEl) {
    introAudioEl = new Audio("/intro_audio.mp4");
    introAudioEl.preload = "auto";
  }
  return introAudioEl;
}

export async function playIntroAudio(options?: {
  loop?: boolean;
  volume?: number;
  restart?: boolean;
}) {
  const audio = getIntroAudio();
  const loop = options?.loop ?? true;
  const volume = options?.volume ?? 0.58;
  const restart = options?.restart ?? false;

  audio.loop = loop;
  audio.volume = volume;
  if (restart) {
    audio.currentTime = 0;
  }

  try {
    await audio.play();
  } catch {
    // Ignore browser autoplay/format errors.
  }
}

export function setIntroAudioLoop(loop: boolean) {
  if (!introAudioEl) return;
  introAudioEl.loop = loop;
}

export function stopIntroAudio(reset: boolean = true) {
  if (!introAudioEl) return;
  introAudioEl.pause();
  if (reset) {
    introAudioEl.currentTime = 0;
  }
}

export function destroyIntroAudio() {
  if (!introAudioEl) return;
  introAudioEl.pause();
  introAudioEl.currentTime = 0;
  introAudioEl = null;
}
