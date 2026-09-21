let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (ctx) {
      if (ctx.state === 'suspended') void ctx.resume();
      return ctx;
    }
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume = 0.12
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

/** Short ascending chime — recording/listening started. Never throws. */
export function playVoiceStartCue(): void {
  try {
    const ac = getContext();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, 660, t, 0.1);
    tone(ac, 880, t + 0.09, 0.14);
  } catch {
    /* sound is best-effort */
  }
}

/** Short descending tone — recording/listening stopped. Never throws. */
export function playVoiceStopCue(): void {
  try {
    const ac = getContext();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, 520, t, 0.12);
  } catch {
    /* sound is best-effort */
  }
}
