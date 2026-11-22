// EMBER COURT — sound, synthesized live with WebAudio: no audio files, no
// network. A soft click for a card, a low thud for damage, a rising arpeggio
// for victory and a falling one for defeat. M mutes.
let ctx = null;
let muted = false;

function audio() {
  if (muted) return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, startAt, dur, type = 'sine', vol = 0.08) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.02);
}

export const sfx = {
  flip() { tone(520, 0, 0.08, 'triangle', 0.06); tone(780, 0.05, 0.08, 'triangle', 0.05); },
  play() { tone(330, 0, 0.12, 'triangle', 0.09); tone(495, 0.07, 0.14, 'triangle', 0.07); },
  hurt() { tone(140, 0, 0.25, 'sawtooth', 0.07); },
  heal() { tone(660, 0, 0.12, 'sine', 0.06); tone(880, 0.1, 0.18, 'sine', 0.06); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.09)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.14, 0.3, 'sawtooth', 0.05)); },
  click() { tone(700, 0, 0.05, 'square', 0.03); },
};

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}
