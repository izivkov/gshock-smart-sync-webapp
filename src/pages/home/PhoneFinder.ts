import { progressEvents, EventAction } from "@api/ProgressEvents";

export class PhoneFinder {
    private static audioContext: AudioContext | null = null;
    private static oscillatorBody: OscillatorNode | null = null;
    private static gainNode: GainNode | null = null;
    private static motionTimeout: any = null;
    private static intervalId: any = null;
    private static isPlaying = false;

    static ring() {
        if (PhoneFinder.isPlaying) return;
        PhoneFinder.isPlaying = true;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        PhoneFinder.audioContext = new AudioContextClass();
        PhoneFinder.gainNode = PhoneFinder.audioContext.createGain();
        PhoneFinder.gainNode.connect(PhoneFinder.audioContext.destination);

        // Max volume
        PhoneFinder.gainNode.gain.value = 1.0; 

        PhoneFinder.oscillatorBody = PhoneFinder.audioContext.createOscillator();
        PhoneFinder.oscillatorBody.type = 'square';
        PhoneFinder.oscillatorBody.frequency.setValueAtTime(800, PhoneFinder.audioContext.currentTime);
        PhoneFinder.oscillatorBody.connect(PhoneFinder.gainNode);
        PhoneFinder.oscillatorBody.start();

        // Modulate volume to make it beep
        PhoneFinder.intervalId = setInterval(() => {
            if (!PhoneFinder.isPlaying || !PhoneFinder.gainNode || !PhoneFinder.audioContext) return;
            PhoneFinder.gainNode.gain.setValueAtTime(1, PhoneFinder.audioContext.currentTime);
            PhoneFinder.gainNode.gain.setValueAtTime(0, PhoneFinder.audioContext.currentTime + 0.2);
        }, 400);

        // Detect phone lift
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', PhoneFinder.handleMotion);
        }

        // Cancel after 30 seconds
        PhoneFinder.motionTimeout = setTimeout(() => {
            PhoneFinder.stopRing();
        }, 30000);

        // Stop on disconnect
        const actions: EventAction[] = [
            { label: "Disconnected", action: PhoneFinder.stopRing }
        ];
        progressEvents.runEventActions("PhoneFinder", actions);
    }

    private static handleMotion = (event: DeviceMotionEvent) => {
        const threshold = 1.5; // Significant lift threshold
        const z = Math.abs(event.acceleration?.z || 0);
        if (z > threshold) {
            PhoneFinder.stopRing();
        }
    }

    static stopRing = () => {
        if (!PhoneFinder.isPlaying) return;
        PhoneFinder.isPlaying = false;
        
        if (PhoneFinder.intervalId) {
            clearInterval(PhoneFinder.intervalId);
            PhoneFinder.intervalId = null;
        }

        if (PhoneFinder.oscillatorBody) {
             try { PhoneFinder.oscillatorBody.stop(); } catch(e){}
             PhoneFinder.oscillatorBody.disconnect();
             PhoneFinder.oscillatorBody = null;
        }
        if (PhoneFinder.gainNode) {
            PhoneFinder.gainNode.disconnect();
            PhoneFinder.gainNode = null;
        }
        if (PhoneFinder.audioContext) {
            PhoneFinder.audioContext.close();
            PhoneFinder.audioContext = null;
        }

        if (PhoneFinder.motionTimeout) {
            clearTimeout(PhoneFinder.motionTimeout);
        }

        window.removeEventListener('devicemotion', PhoneFinder.handleMotion);
        progressEvents.stop("PhoneFinder");
    }
}
