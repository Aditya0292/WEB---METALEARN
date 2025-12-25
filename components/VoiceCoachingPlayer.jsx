import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Share2, Volume2, Sparkles, FastForward, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceCoachingPlayer({ coachingData }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef(null);

    // Fallback data (Intro State)
    const data = coachingData || {
        insight_text: "Welcome to MetaLearn AI! Log your first study session to unlock personalized insights and voice coaching.",
        audio_url: null,
        pattern_detected: "Ready to Start",
        created_at: new Date().toISOString()
    };

    // State to hold the audio URL (either from prop or fetched)
    const [currentAudioUrl, setCurrentAudioUrl] = useState(data.audio_url);

    useEffect(() => {
        if (data.audio_url) {
            setCurrentAudioUrl(data.audio_url);
        }
    }, [data.audio_url]);

    useEffect(() => {
        if (currentAudioUrl && audioRef.current) {
            audioRef.current.src = currentAudioUrl;
        }
    }, [currentAudioUrl]);

    const togglePlay = async () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
            return;
        }

        // Play Logic
        if (currentAudioUrl) {
            // We have audio, just play
            if (audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            // No audio URL, we need to generate it
            try {
                setIsLoading(true);
                const response = await fetch('/api/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: data.insight_text })
                });

                const result = await response.json();

                if (result.url) {
                    setCurrentAudioUrl(result.url);
                    // Slight delay to allow src update
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.play();
                            setIsPlaying(true);
                        }
                    }, 100);
                } else {
                    alert("Unable to generate voice.");
                }

            } catch (error) {
                console.error("Voice Generation Failed:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration || 1;
            setProgress((current / total) * 100);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    // Mock waveform bars
    const bars = Array.from({ length: 40 });

    return (
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-0 overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--background)] border border-[var(--accent)]/20 shadow-2xl shadow-purple-900/10 mb-8"
        >
            <div className="flex flex-col md:flex-row">
                {/* Left Side: Text Insight */}
                <div className="p-8 md:w-3/5 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[var(--glass-border)] relative">
                    <div className="absolute top-4 left-4 bg-[var(--surface)]/50 backdrop-blur rounded-full px-3 py-1 flex items-center gap-2 text-xs font-bold text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm">
                        <Sparkles size={12} fill="currentColor" /> AI Coach Insight
                    </div>

                    <div className="mt-6 mb-4">
                        <h3 className="text-lg md:text-xl font-medium leading-relaxed italic text-[var(--text-primary)]">
                            "{data.insight_text}"
                        </h3>
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider dark:bg-red-900/30 dark:text-red-300">
                            Pattern: {data.pattern_detected}
                        </span>
                        <span className="text-xs text-[var(--text-secondary)]">
                            Generated just now
                        </span>
                    </div>
                </div>

                {/* Right Side: Audio Player */}
                <div className="p-6 md:w-2/5 flex flex-col justify-center items-center bg-[var(--surface)]/50 relative overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-primary opacity-5 pointer-events-none" />

                    {/* Visualizer - Optimized with CSS only */}
                    <div className="h-16 flex items-center gap-[3px] mb-6 w-full justify-center px-4">
                        {bars.slice(0, 20).map((_, i) => ( // Reduced bar count for performance
                            <div
                                key={i}
                                className={`w-1.5 rounded-full bg-[var(--accent)] transition-all ${isPlaying ? 'animate-music-bar' : 'h-2 opacity-30'}`}
                                style={{
                                    animationDelay: `${i * 0.05}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6 z-10">
                        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <Volume2 size={20} />
                        </button>

                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-lg shadow-purple-500/40 relative group"
                        >
                            {isLoading ? (
                                <Loader2 size={28} className="animate-spin" />
                            ) : (
                                isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />
                            )}

                            {/* Ripple effect */}
                            {isPlaying && (
                                <span className="absolute inset-0 rounded-full border-2 border-[var(--accent)] animate-ping opacity-75" />
                            )}
                        </motion.button>

                        <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <FastForward size={20} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full mt-6 bg-[var(--glass-border)] h-1.5 rounded-full overflow-hidden cursor-pointer">
                        <motion.div
                            className="h-full bg-gradient-primary"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                        />
                    </div>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                className="hidden"
            />
        </motion.div>
    );
}
