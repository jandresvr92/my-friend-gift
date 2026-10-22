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
}

export const sound = new SoundEngine();
