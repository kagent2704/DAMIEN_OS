import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
    SpeechSynthesisVoice: any;
  }
}

interface UseSpeechProps {
  onStop?: (finalTranscript: string) => void;
}

export const useSpeech = ({ onStop }: UseSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(interimTranscript);
      if (finalTranscript) {
        onStop?.(finalTranscript.trim());
        stopListening();
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
  }, [onStop]);

  // Effect to load voices for speech synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // Also call it once in case they are already loaded
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech synthesis not supported in this browser.");
        return;
    }
    const utterance = new SpeechSynthesisUtterance();

    // Voice Selection for a charming, lively male personality
    if (voices.length > 0) {
        const preferredVoices = [
            (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Google') && /male/i.test(v.name),
            (v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('David'), // Microsoft
            // FIX: The 'gender' property does not exist on SpeechSynthesisVoice. Switched to a name-based check.
            (v: SpeechSynthesisVoice) => v.lang === 'en-US' && /male/i.test(v.name),
            // FIX: The 'gender' property does not exist on SpeechSynthesisVoice. Switched to a name-based check.
            (v: SpeechSynthesisVoice) => v.lang.startsWith('en-') && /male/i.test(v.name),
        ];

        let selectedVoice: SpeechSynthesisVoice | null = null;
        for (const criterion of preferredVoices) {
            const found = voices.find(criterion);
            if (found) {
                selectedVoice = found;
                break;
            }
        }
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }

    utterance.lang = 'en-US';
    utterance.pitch = 1; 
    utterance.rate = 1.1; // Slightly faster for a lively feel
    
    // Clean text for speech: remove markdown and emojis
    const emojiRegex = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;
    const cleanedText = text.replace(/[*_`]/g, '').replace(emojiRegex, '').trim();
    utterance.text = cleanedText;
    
    // Stop any currently speaking utterance before starting a new one
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return { isListening, transcript, startListening, stopListening, speak };
};