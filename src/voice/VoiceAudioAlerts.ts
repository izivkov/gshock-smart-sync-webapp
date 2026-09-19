class VoiceAudioAlerts {
    private audioCtx: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioCtx;
    }

    public async playDing() {
        try {
            const ctx = this.getContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4

            gainNode.gain.setValueAtTime(0.5, ctx.currentTime); // Increased volume from 0.1 to 0.5
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
            console.warn("Failed to play ding sound", e);
        }
    }
}

export const voiceAudioAlerts = new VoiceAudioAlerts();
