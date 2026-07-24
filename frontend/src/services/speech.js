class SpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  start(onResultCallback, onErrorCallback) {
    if (!this.recognition) {
      if (onErrorCallback) {
        onErrorCallback('Web Speech API is not supported in this browser.');
      }
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResultCallback({
        finalText: finalTranscript,
        interimText: interimTranscript,
      });
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'network' && onErrorCallback) {
        onErrorCallback(event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto restart if intended to be listening
      if (this.isListening) {
        try {
          // Add small delay to prevent double-start errors
          setTimeout(() => {
            if (this.isListening && this.recognition) {
              this.recognition.start();
            }
          }, 100);
        } catch (e) {
          console.warn('Speech recognition failed to auto-restart:', e);
        }
      }
    };

    this.isListening = true;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
      this.isListening = false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        console.warn('Error stopping recognition:', e);
      }
    }
  }
}

export const speechService = new SpeechService();
export default speechService;
