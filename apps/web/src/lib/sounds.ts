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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (name) {
        case 'tap':
          osc.frequency.value = 800;
          gain.gain.value = 0.05;
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
          break;

        case 'success':
          osc.frequency.value = 523;
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.3,
          );
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
          setTimeout(() => {
            const o2 = ctx.createOscillator();
            const g2 = ctx.createGain();
            o2.connect(g2);
            g2.connect(ctx.destination);
            o2.frequency.value = 659;
            g2.gain.setValueAtTime(0.1, ctx.currentTime);
            g2.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 0.3,
            );
            o2.start();
            o2.stop(ctx.currentTime + 0.3);
          }, 150);
          break;

        case 'error':
          osc.frequency.value = 200;
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.2,
          );
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          break;

        case 'like':
          osc.frequency.value = 1200;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.06, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.1,
          );
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
          break;

        case 'xp':
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            1200,
            ctx.currentTime + 0.15,
          );
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.2,
          );
          osc.start();
          osc.stop(ctx.currentTime + 0.2);
          break;

        case 'achievement':
          [523, 659, 784].forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.12);
            g.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + i * 0.12 + 0.4,
            );
            o.start(ctx.currentTime + i * 0.12);
            o.stop(ctx.currentTime + i * 0.12 + 0.4);
          });
          osc.stop(ctx.currentTime + 0.01);
          break;

        case 'complete':
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            880,
            ctx.currentTime + 0.1,
          );
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.3,
          );
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
          break;

        case 'streak':
          [440, 554, 659, 880].forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = freq;
            g.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.1);
            g.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + i * 0.1 + 0.3,
            );
            o.start(ctx.currentTime + i * 0.1);
            o.stop(ctx.currentTime + i * 0.1 + 0.3);
          });
          osc.stop(ctx.currentTime + 0.01);
          break;

        default:
          osc.frequency.value = 600;
          gain.gain.value = 0.05;
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
      }
    } catch {
      /* silent fail */
    }
  }
}

export const soundManager = new SoundManager();
