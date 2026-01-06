// Text-to-Speech Service using Web Speech Synthesis API

class TextToSpeechService {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
    }

    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech Synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            this.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            utterance.rate = options.rate || 1.0;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            utterance.lang = options.lang || 'en-US';

            // Select voice if specified
            if (options.voice) {
                const voices = this.synthesis.getVoices();
                const selectedVoice = voices.find(v => v.name === options.voice);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
            }

            utterance.onstart = () => {
                this.isSpeaking = true;
                if (options.onStart) options.onStart();
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (options.onEnd) options.onEnd();
                resolve();
            };

            utterance.onerror = (event) => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (options.onError) options.onError(event);
                reject(event);
            };

            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);
        });
    }

    cancel() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    pause() {
        if (this.synthesis && this.isSpeaking) {
            this.synthesis.pause();
        }
    }

    resume() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }

    getVoices() {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    isSupported() {
        return !!window.speechSynthesis;
    }

    getSpeakingStatus() {
        return this.isSpeaking;
    }
}

export default new TextToSpeechService();
