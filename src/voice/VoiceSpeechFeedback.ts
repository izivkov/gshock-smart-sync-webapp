import { progressEvents } from "@/api/ProgressEvents";

export class VoiceSpeechFeedback {
    public speak(text: string, onEnd?: () => void) {
        if (!window.speechSynthesis) {
            onEnd?.();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        if (onEnd) {
            utterance.onend = onEnd;
            utterance.onerror = onEnd;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        progressEvents.onNext("VoiceFeedback", text);
    }
}

export const speechFeedback = new VoiceSpeechFeedback();
