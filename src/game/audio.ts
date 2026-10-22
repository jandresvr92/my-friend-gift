/**
 * 8-Bit Retro Audio Synthesizer using Web Audio API
 * Generates chiptune sound effects and melodies with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (val) this.initCtx();
  }

  public playJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.14);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public playFall() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.36);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  public playDoor() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [330, 440, 554, 659]; // E4, A4, C#5, E5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.13);
      });
    } catch {}
  }

  public playChestOpen() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C major fanfare
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + idx * 0.06;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + (idx === notes.length - 1 ? 0.6 : 0.15));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + (idx === notes.length - 1 ? 0.65 : 0.16));
      });
    } catch {}
  }

  public playBirthdayMelody() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // "Cumpleaños Feliz" retro melody notes: G4 G4 A4 G4 C5 B4, G4 G4 A4 G4 D5 C5
      const notes = [
        { f: 392.00, d: 0.25 }, // Sol
        { f: 392.00, d: 0.25 }, // Sol
        { f: 440.00, d: 0.5 },  // La
        { f: 392.00, d: 0.5 },  // Sol
        { f: 523.25, d: 0.5 },  // Do
        { f: 493.88, d: 0.9 },  // Si

        { f: 392.00, d: 0.25 }, // Sol
        { f: 392.00, d: 0.25 }, // Sol
        { f: 440.00, d: 0.5 },  // La
        { f: 392.00, d: 0.5 },  // Sol
        { f: 587.33, d: 0.5 },  // Re
        { f: 523.25, d: 0.9 },  // Do

        { f: 392.00, d: 0.25 }, // Sol
        { f: 392.00, d: 0.25 }, // Sol
        { f: 783.99, d: 0.5 },  // Sol agudo
        { f: 659.25, d: 0.5 },  // Mi
        { f: 523.25, d: 0.5 },  // Do
        { f: 493.88, d: 0.5 },  // Si
        { f: 440.00, d: 0.6 },  // La

        { f: 698.46, d: 0.25 }, // Fa
        { f: 698.46, d: 0.25 }, // Fa
        { f: 659.25, d: 0.5 },  // Mi
        { f: 523.25, d: 0.5 },  // Do
        { f: 587.33, d: 0.5 },  // Re
        { f: 523.25, d: 1.2 },  // Do final
      ];

      let elapsed = 0;
      notes.forEach((note) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + elapsed;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.linearRampToValueAtTime(0.12, t + note.d * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * 0.95);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);

        elapsed += note.d * 1.05;
      });
    } catch {}
  }

  public playVoiceChatter(count = 14) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreqs = [480, 540, 620, 680, 760, 840];
      for (let i = 0; i < count; i++) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + i * 0.055;
        const duration = 0.045;
        const freq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)] + (Math.random() - 0.5) * 60;

        osc.type = Math.random() > 0.4 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * (0.92 + Math.random() * 0.22), t + duration);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + duration + 0.01);
      }
    } catch {}
  }

  /**
   * Expressive, non-monotone congratulatory character voices for Dude & Owlet.
   * Simulates cheerful cartoon/Banjo-Kazooie style phonetic phrases with joyful inflections.
   */
  public playCongratulatoryVoices() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Dude Monster Voice: Enthusiastic "¡Sor-pre-sa!" (Mid-low energetic syllables)
      const dudeSyllables = [
        { f: 260, d: 0.09, t: 0.00, slide: 320, type: 'square' as const },
        { f: 330, d: 0.08, t: 0.08, slide: 390, type: 'triangle' as const },
        { f: 392, d: 0.11, t: 0.16, slide: 490, type: 'square' as const },
        { f: 523, d: 0.16, t: 0.26, slide: 587, type: 'triangle' as const },
      ];

      dudeSyllables.forEach((s) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + s.t;

        osc.type = s.type;
        osc.frequency.setValueAtTime(s.f, startTime);
        osc.frequency.exponentialRampToValueAtTime(s.slide, startTime + s.d);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + s.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + s.d + 0.01);
      });

      // 2. Owlet Monster Voice: High-spirited joyful cheer "¡Fe-liz Cum-ple!" (Higher singing vibrato)
      const owletOffset = 0.38;
      const owletSyllables = [
        { f: 587, d: 0.08, t: 0.00, slide: 659, type: 'triangle' as const },
        { f: 659, d: 0.08, t: 0.08, slide: 784, type: 'square' as const },
        { f: 784, d: 0.10, t: 0.16, slide: 880, type: 'triangle' as const },
        { f: 1046, d: 0.22, t: 0.25, slide: 1174, type: 'triangle' as const },
      ];

      owletSyllables.forEach((s) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + owletOffset + s.t;

        osc.type = s.type;
        osc.frequency.setValueAtTime(s.f, startTime);
        osc.frequency.exponentialRampToValueAtTime(s.slide, startTime + s.d);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.005, startTime + s.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + s.d + 0.01);
      });

      // 3. Shared joyful laughing / cheering burst at the end
      const cheerOffset = 0.76;
      for (let i = 0; i < 6; i++) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + cheerOffset + i * 0.05;
        const freq = 600 + (i % 2 === 0 ? 150 : 250);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.25, startTime + 0.045);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.002, startTime + 0.045);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.05);
      }
    } catch {}
  }
}

export const sound = new SoundEngine();

