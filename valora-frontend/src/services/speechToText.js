// Speech-to-Text Service using Web Speech API

class SpeechToTextService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.silenceTimer = null;
        this.silenceDelay = 5000; // 5 seconds of silence to finalize
        this.currentTranscript = '';
        
        this.initRecognition();
    }

    initRecognition() {
        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }

            // Store accumulated transcript
            if (finalTranscript) {
                this.currentTranscript += finalTranscript;
            }

            // Clear existing silence timer
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
            }

            // Show interim results
            if (this.onResultCallback) {
                this.onResultCallback({
                    final: '',
                    interim: (this.currentTranscript + interimTranscript).trim(),
                    isFinal: false
                });
            }

            // Set new silence timer - finalize after 2 seconds of silence
            if (interimTranscript || finalTranscript) {
                this.silenceTimer = setTimeout(() => {
                    if (this.currentTranscript.trim()) {
                        // Send final result
                        if (this.onResultCallback) {
                            this.onResultCallback({
                                final: this.currentTranscript.trim(),
                                interim: '',
                                isFinal: true
                            });
                        }
                        this.currentTranscript = '';
                    }
                }, this.silenceDelay);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Restart recognition if it was supposed to be listening
                this.recognition.start();
            }
        };
    }

    start(onResult, onError) {
        if (!this.recognition) {
            console.error('Speech Recognition not initialized');
            return;
        }

        this.onResultCallback = onResult;
        this.onErrorCallback = onError;
        this.isListening = true;
        this.currentTranscript = ''; // Reset on start

        try {
            this.recognition.start();
        } catch (error) {
            console.log('Recognition already started or error:', error);
        }
    }

    stop() {
        this.isListening = false;
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        if (this.recognition) {
            this.recognition.stop();
        }
        this.currentTranscript = '';
    }

    // Manual finalization - call this to immediately finalize current speech
    finalize() {
        if (this.currentTranscript.trim() && this.onResultCallback) {
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
            }
            this.onResultCallback({
                final: this.currentTranscript.trim(),
                interim: '',
                isFinal: true
            });
            this.currentTranscript = '';
        }
    }

    // Set custom silence delay (in milliseconds)
    setSilenceDelay(delay) {
        this.silenceDelay = delay;
    }

    isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
}

export default new SpeechToTextService();
