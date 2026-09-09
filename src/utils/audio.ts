// Web Audio API synth for notifications and focus sounds without external assets

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private isAmbientPlaying: boolean = false;
  private _isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this._isMuted = localStorage.getItem('task_focus_hub_sound_muted') === 'true';
    }
  }

  isMuted(): boolean {
    return this._isMuted;
  }

  getMuted(): boolean {
    return this._isMuted;
  }

  toggleMute(): boolean {
    const next = !this._isMuted;
    this.setMuted(next);
    return next;
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('task_focus_hub_sound_muted', muted ? 'true' : 'false');
    }
    if (muted && this.isAmbientPlaying) {
      this.toggleAmbientSound(false);
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play gentle completion chime
  playCompletionChime() {
    if (this._isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Play major third chime: E5 -> G#5 -> B5 -> E6
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.95);
      });
    } catch (e) {
      console.warn('Audio chime playback error:', e);
    }
  }

  // Play celebration fanfare chord on goal achievement
  playCelebrationFanfare() {
    if (this._isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Bright celebratory arpeggio: C5 -> E5 -> G5 -> C6 -> E6
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.09);

        gain.gain.setValueAtTime(0, now + index * 0.09);
        gain.gain.linearRampToValueAtTime(0.16, now + index * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.85);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.09);
        osc.stop(now + index * 0.09 + 0.9);
      });
    } catch (e) {
      console.warn('Celebration audio error:', e);
    }
  }

  // Play break start sound
  playBreakStartSound() {
    if (this._isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Soothing double harmonic
      const notes = [440, 554.37, 659.25];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch (e) {
      console.warn('Break sound error:', e);
    }
  }

  // Play subtle task check click sound
  playCheckSound() {
    if (this._isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.08); // G5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio check playback error:', e);
    }
  }

  // Start/Stop soothing noise for focus
  toggleAmbientSound(enable: boolean, soundscape: 'rain' | 'forest' | 'cafe' = 'rain') {
    if (this._isMuted && enable) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Stop existing sound if playing or if we are disabling
      if (this.isAmbientPlaying) {
        if (this.ambientOsc && this.ambientGain) {
          const now = ctx.currentTime;
          this.ambientGain.gain.linearRampToValueAtTime(0.001, now + 0.3);
          const oldOsc = this.ambientOsc;
          setTimeout(() => {
            oldOsc.stop();
            oldOsc.disconnect();
          }, 350);
        }
        this.ambientOsc = null;
        this.ambientGain = null;
        this.isAmbientPlaying = false;
      }

      if (!enable) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Synthesize different vibes
      switch (soundscape) {
        case 'rain':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(80, now);
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(2000, now);
          break;
        case 'forest':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140, now);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(400, now);
          break;
        case 'cafe':
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, now);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, now);
          break;
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);

      this.ambientOsc = osc;
      this.ambientGain = gain;
      this.isAmbientPlaying = true;
    } catch (e) {
      console.warn('Ambient audio error:', e);
    }
  }

  // Request browser notification
  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Send browser notification
  sendNotification(title: string, body: string) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.svg',
        });
      } catch (e) {
        console.warn('Notification error:', e);
      }
    }
  }
}

export const soundManager = new SoundManager();
