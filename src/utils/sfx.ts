class RetroSFX {
  private static ctx: AudioContext | null = null;
  private static enabled = true;
  private static musicStep = 0;
  private static musicTimer: any = null;

  private static getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public static setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopMusic();
    }
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  public static startMusic() {
    if (!this.enabled) return;
    this.stopMusic();

    const ctx = this.getContext();
    if (!ctx) return;

    // Sweet nostalgic 80s RPG adventure chord progression (C - G - Am - F)
    const melody = [
      261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
      196.00, 246.94, 293.66, 392.00, // G3, B3, D4, G4
      220.00, 261.63, 329.63, 440.00, // A3, C4, E4, A4
      174.61, 220.00, 261.63, 349.23  // F3, A3, C4, F4
    ];

    this.musicTimer = setInterval(() => {
      const activeCtx = this.getContext();
      if (!activeCtx || activeCtx.state === 'suspended') return;
      
      const now = activeCtx.currentTime;
      const osc = activeCtx.createOscillator();
      const gain = activeCtx.createGain();
      
      osc.connect(gain);
      gain.connect(activeCtx.destination);
      
      osc.type = 'triangle'; // Soft and mellow retro synth tone
      
      const freq = melody[this.musicStep % melody.length];
      osc.frequency.setValueAtTime(freq, now);
      
      // Gentle, non-intrusive ambient background level
      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.45);
      
      this.musicStep++;
    }, 450); // 133 BPM rhythmic walk
  }

  public static stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public static playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.05);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  public static playCoin() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

    osc.start();
    osc.stop(now + 0.35);
  }

  public static playHit() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Laser / Sword strike: rapid frequency sweep down
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.15);

    osc.start();
    osc.stop(now + 0.15);
  }

  public static playHurt() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low harsh buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    osc.start();
    osc.stop(now + 0.25);
  }

  public static playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // C major arpeggio
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    });

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.setValueAtTime(0.06, now + 0.24);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

    osc.start();
    osc.stop(now + 0.45);
  }

  public static playWarp() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Rising portal sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.6);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.6);

    osc.start();
    osc.stop(now + 0.6);
  }

  public static playShop() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Coins registers
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    osc.start();
    osc.stop(now + 0.25);
  }
}

export default RetroSFX;
