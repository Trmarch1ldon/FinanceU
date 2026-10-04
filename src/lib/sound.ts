/**
 * Game sounds, synthesized with the Web Audio API — no files to download, no licences,
 * and no decode delay between a keypress and the sound it earns.
 *
 * Browsers won't make sound before a user gesture, so `unlockAudio()` must run inside one (the
 * Open Market click). Everything after that can play from timers.
 */
/** Master volume for every sound (0–1). Each sound's own level is relative to this. */
const VOLUME = 0.35;

let context: AudioContext | null = null;
let master: GainNode | null = null;

const SOUND_KEY = "fu:sound";
const SOUND_CHANGED = "fu:sound-changed";

/** On unless the player turned it off. Storage can throw (private windows): default on. */
export function isSoundOn() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // Not remembered, but still applied for this session below.
  }
  // Cut sounds already ringing, not just the next ones.
  if (master && context) master.gain.setTargetAtTime(on ? VOLUME : 0, context.currentTime, 0.01);
  window.dispatchEvent(new Event(SOUND_CHANGED));
}

export function subscribeSound(onChange: () => void) {
  window.addEventListener(SOUND_CHANGED, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SOUND_CHANGED, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!context) {
    try {
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = isSoundOn() ? VOLUME : 0;
      master.connect(context.destination);
    } catch {
      // No Web Audio (or blocked): play silently.
      return null;
    }
  }
  return context;
}

/** Call from a click or keypress so later sounds are allowed to play. */
export function unlockAudio() {
  const ctx = audio();
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

type ToneOptions = {
  type?: OscillatorType;
  /** Glide to this frequency over the tone's length. */
  endFreq?: number;
  level?: number;
  /** Seconds from now. */
  at?: number;
};

function tone(freq: number, duration: number, options: ToneOptions = {}) {
  const ctx = audio();
  if (!ctx || !master || !isSoundOn()) return;
  const { type = "sine", endFreq, level = 0.6, at = 0 } = options;
  const start = ctx.currentTime + at;

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);

  // Fast attack, exponential tail: struck, not switched on.
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(level, start + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env).connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** A short filtered noise burst: the click of a key, or the thud under a loss. */
function noise(duration: number, filterFreq: number, level: number, at = 0) {
  const ctx = audio();
  if (!ctx || !master || !isSoundOn()) return;
  const start = ctx.currentTime + at;

  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq;
  const env = ctx.createGain();
  env.gain.setValueAtTime(level, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(filter).connect(env).connect(master);
  source.start(start);
}

/** Correct answer: a trade filled. A soft click, then two bright rising tones. */
export function playFill() {
  noise(0.03, 4000, 0.25);
  tone(1318.5, 0.14, { type: "triangle", level: 0.45 });
  tone(1975.5, 0.32, { type: "sine", level: 0.4, at: 0.07 });
}

/** Bull run starts: a rising arpeggio on top of the fill. */
export function playBullRun() {
  noise(0.03, 4000, 0.25);
  [1046.5, 1318.5, 1568, 2093].forEach((freq, i) =>
    tone(freq, 0.28, { type: "triangle", level: 0.4, at: i * 0.07 }),
  );
}

/** Wrong answer: the price gaps down. A low falling tone over a thud. */
export function playMiss() {
  noise(0.18, 300, 0.6);
  tone(220, 0.32, { type: "sawtooth", endFreq: 82, level: 0.22 });
  tone(110, 0.3, { type: "sine", endFreq: 55, level: 0.5 });
}

/** One beep per countdown second. */
export function playCountdownTick() {
  tone(660, 0.09, { type: "square", level: 0.12 });
}

/** The opening bell — a struck, ringing chord. */
export function playOpeningBell() {
  [880, 1320, 1760].forEach((freq, i) =>
    tone(freq, 1.1 - i * 0.2, { type: "sine", level: 0.35 - i * 0.08 }),
  );
}

/** Margin call: a long fall, then the floor. */
export function playMarginCall() {
  tone(440, 1.3, { type: "sawtooth", endFreq: 45, level: 0.2 });
  tone(330, 1.3, { type: "sine", endFreq: 40, level: 0.35 });
  noise(0.5, 180, 0.7, 1.15);
}

/** An attack lands on you: a two-tone alarm. */
export function playAlarm() {
  [0, 0.16].forEach((at) => {
    tone(880, 0.12, { type: "square", level: 0.16, at });
    tone(660, 0.12, { type: "square", level: 0.16, at: at + 0.08 });
  });
}

/** You fire a power-up: a quick rising sweep. */
export function playPowerUp() {
  noise(0.05, 2500, 0.2);
  tone(440, 0.22, { type: "triangle", endFreq: 1320, level: 0.35 });
}

/** Takeover complete: a bright major arpeggio over the bell. */
export function playVictory() {
  [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, i) =>
    tone(freq, 0.6, { type: "triangle", level: 0.35, at: i * 0.09 }),
  );
}
