const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export class VoiceCommandManager {
    private recognition: any = null;

    public isSupported(): boolean {
        return !!SpeechRecognition;
    }

    public startListening(
        onResult: (text: string, isFinal: boolean) => void,
        onError: (error: string) => void,
        onEnd: () => void
    ) {
        if (!this.isSupported()) return;

        this.stopListening();

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            const result = event.results[event.resultIndex];
            const text = result[0].transcript;
            const isFinal = result.isFinal;
            onResult(text, isFinal);
        };

        this.recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            onError(event.error);
        };

        this.recognition.onend = onEnd;

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Recognition start failed", e);
            onError('start-failed');
        }
    }

    public stopListening() {
        if (this.recognition) {
            this.recognition.onresult = null;
            this.recognition.onerror = null;
            this.recognition.onend = null;
            try {
                this.recognition.stop();
            } catch (e) {}
            this.recognition = null;
        }
    }
}

export const voiceCommandManager = new VoiceCommandManager();
