'use client';

class SoundManager {
  private enabled: boolean;
  private ctx: AudioContext | null = null;

  constructor() {
    this.enabled =
      typeof window !== 'undefined'
        ? localStorage.getItem('fitai_sounds') !== 'off'
        : true;
  }

  private getCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fitai_sounds', this.enabled ? 'on' : 'off');
    }
    return this.enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(name: string): void {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      switch (name) {
        case 'tap': this.playTap(ctx); break;
        case 'success': this.playSuccess(ctx); break;
        case 'error': this.playError(ctx); break;
        case 'like': this.playLike(ctx); break;
        case 'xp': this.playXp(ctx); break;
        case 'achievement': this.playAchievement(ctx); break;
        case 'complete': this.playComplete(ctx); break;
        case 'streak': this.playStreak(ctx); break;
        default: this.playDefault(ctx);
      }
    } catch {
      /* silent fail */
    }
  }

  private createOscGain(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    return { osc, gain };
  }

  private playTap(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.value = 800;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  private playSuccess(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.value = 523;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => {
      const { osc: o2, gain: g2 } = this.createOscGain(ctx);
      o2.frequency.value = 659;
      g2.gain.setValueAtTime(0.1, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o2.start();
      o2.stop(ctx.currentTime + 0.3);
    }, 150);
  }

  private playError(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.value = 200;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  private playLike(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.value = 1200;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  private playXp(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  private playAchievement(ctx: AudioContext): void {
    [523, 659, 784].forEach((freq, i) => {
      const { osc, gain } = this.createOscGain(ctx);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.12 + 0.4,
      );
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  }

  private playComplete(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  private playStreak(ctx: AudioContext): void {
    [440, 554, 659, 880].forEach((freq, i) => {
      const { osc, gain } = this.createOscGain(ctx);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.1 + 0.3,
      );
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  }

  private playDefault(ctx: AudioContext): void {
    const { osc, gain } = this.createOscGain(ctx);
    osc.frequency.value = 600;
    gain.gain.value = 0.05;
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}

export const soundManager = new SoundManager();
