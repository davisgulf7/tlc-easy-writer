import React from 'react';
import { clsx } from 'clsx';
import { useStore } from '../../store/useStore';
import { constructSentence } from '../../grammar/GrammarEngine';

export const SentenceBar: React.FC = () => {
    const { sentence, clearSentence, removeLastWord, ttsConfig } = useStore();
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [highlightedWord, setHighlightedWord] = React.useState<string | null>(null);

    // The magic happens here: convert raw items to smart string
    const displayString = constructSentence(sentence);

    // Dynamic font size based on sentence length
    const totalChars = displayString.length;
    // Enhanced responsive font logic: even smaller on mobile if needed
    const fontSizeClass = totalChars > 50 ? 'text-base sm:text-lg' : totalChars > 30 ? 'text-lg sm:text-xl' : 'text-xl sm:text-3xl';

    const speak = (text: string) => {
        if (!text) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Apply Config
        utterance.rate = ttsConfig.rate;
        utterance.pitch = ttsConfig.pitch;
        if (ttsConfig.voiceURI) {
            const voice = window.speechSynthesis.getVoices().find(v => v.voiceURI === ttsConfig.voiceURI);
            if (voice) utterance.voice = voice;
        }

        // Setup events
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setHighlightedWord(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setHighlightedWord(null);
        };

        // Simple word highlighting (heuristic)
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                // Get the word being spoken
                const charIndex = event.charIndex;
                // Find potential word boundaries
                const nextSpace = text.indexOf(' ', charIndex);
                const word = text.substring(charIndex, nextSpace === -1 ? text.length : nextSpace).replace(/[.,!?]/g, '');
                setHighlightedWord(word);
            }
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleSpeakClick = () => {
        speak(displayString);
    };

    // Auto-speak when sentence becomes complete
    React.useEffect(() => {
        if (displayString.endsWith('.')) {
            // Debounce slightly to allow render to settle
            const timer = setTimeout(() => speak(displayString), 500);
            return () => clearTimeout(timer);
        }
    }, [displayString]);

    // Cleanup
    React.useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Helper to render text with highlights
    const renderHighlightedText = () => {
        if (!isSpeaking || !highlightedWord) return displayString;

        // Split by words but preserve spaces approach
        const words = displayString.split(' ');
        return words.map((word, idx) => {
            const cleanWord = word.replace(/[.,!?]/g, '');
            const isActive = cleanWord === highlightedWord;
            return (
                <span key={idx} className={clsx("transition-colors duration-200 inline-block", isActive ? "text-blue-600 scale-110 font-bold" : "text-slate-800")}>
                    {word}
                    {/* Add explicit space unless it's the last word */}
                    {idx < words.length - 1 && '\u00A0'}
                </span>
            );
        });
    };

    return (
        <div className="w-full border-b-2 border-slate-200/50 p-2 shadow-sm shrink-0 z-10 transition-colors">
            <div className="max-w-6xl mx-auto flex items-center gap-2 h-full">

                {/* Sentence Display Area */}
                <div
                    onClick={handleSpeakClick}
                    className={clsx(
                        "flex-1 h-14 sm:h-20 border-2 rounded-xl flex items-center px-3 sm:px-4 overflow-x-auto cursor-pointer transition-all duration-300",
                        isSpeaking ? "border-blue-500 bg-blue-50 shadow-md scale-[1.01]" : "bg-white border-slate-300 hover:border-blue-400"
                    )}
                    role="button"
                    aria-label="Read sentence aloud"
                >
                    {sentence.length === 0 ? (
                        <span className="text-slate-400 italic text-base sm:text-xl truncate">Tap icons...</span>
                    ) : (
                        <span className={clsx("font-medium whitespace-nowrap leading-tight transition-all block", fontSizeClass)}>
                            {isSpeaking ? renderHighlightedText() : displayString}
                        </span>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={removeLastWord}
                        className="p-3 sm:p-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-transform"
                        aria-label="Undo"
                    >
                        {/* Backspace Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                        </svg>
                    </button>
                    <button
                        onClick={clearSentence}
                        className="p-3 sm:p-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 active:scale-95 transition-transform"
                        aria-label="Clear All"
                    >
                        {/* Trash Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
};
