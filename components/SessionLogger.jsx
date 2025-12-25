import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SessionLogger({ onSessionLogged }) {
    const [topic, setTopic] = useState('');
    const [timeSpent, setTimeSpent] = useState(30);
    const [confidence, setConfidence] = useState(3); // 1-5
    const [errorsMade, setErrorsMade] = useState(false);
    const [revisionDone, setRevisionDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setIsSubmitting(true);

        // Simulate API call or Real API call
        try {
            const payload = {
                topic,
                timeSpent,
                confidenceScore: confidence,
                errorsMade,
                revisionDone,
                // userId: // Handled in API or via Context
            };

            // Post to API (we will build this later, for now we can simulate)
            const response = await fetch('/api/log-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }) // Use Fixed Valid UUID
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setTopic('');
                    setTimeSpent(30);
                    setConfidence(3);
                    setErrorsMade(false);
                    setRevisionDone(false);
                    if (onSessionLogged) onSessionLogged();
                }, 2000);
            } else {
                console.error("Failed to log session");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card max-w-xl mx-auto p-8 relative overflow-hidden"
        >
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[var(--surface)] z-20 flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2, rotate: 360 }}
                            className="w-20 h-20 rounded-full bg-gradient-success flex items-center justify-center text-white mb-4"
                        >
                            <Check size={40} strokeWidth={4} />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-[var(--success)]">Session Logged! 🎉</h3>
                        <p className="text-[var(--text-secondary)]">Analyzing your learning patterns...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <BookOpen className="text-[var(--accent)]" /> Log Study Session
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Topic Input */}
                <div>
                    <label className="block text-sm font-semibold mb-2 ml-1">What did you study?</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Neural Networks, Calculus..."
                            className="w-full h-12 px-4 pl-12 rounded-xl bg-[var(--background)] border border-transparent focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all outline-none"
                            required
                        />
                        <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    </div>
                </div>

                {/* Time Slider */}
                <div>
                    <label className="flex justify-between text-sm font-semibold mb-2 ml-1">
                        <span>Duration</span>
                        <span className="text-[var(--accent)] font-bold">{timeSpent} min</span>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="180"
                        step="5"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(parseInt(e.target.value))}
                        className="w-full h-2 bg-[var(--background)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                    />
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                        <span>5m</span>
                        <span>60m</span>
                        <span>120m</span>
                        <span>180m</span>
                    </div>
                </div>

                {/* Confidence Grid */}
                <div>
                    <label className="block text-sm font-semibold mb-3 ml-1">Confidence Score</label>
                    <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                            <motion.button
                                key={score}
                                type="button"
                                onClick={() => setConfidence(score)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center transition-all ${confidence === score
                                    ? 'bg-gradient-primary text-white shadow-lg scale-110'
                                    : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                                    }`}
                            >
                                <span className="text-lg font-bold">{score}</span>
                            </motion.button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-2 px-1">
                        <span>Confused</span>
                        <span>Mastered</span>
                    </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-col md:flex-row gap-4">
                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${errorsMade ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--background)] border-transparent'}`}>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={errorsMade} onChange={(e) => setErrorsMade(e.target.checked)} className="w-5 h-5 accent-red-500" />
                            <div>
                                <span className="block font-medium text-sm">Made Errors?</span>
                                <span className="text-xs text-[var(--text-secondary)]">Struggled with concepts</span>
                            </div>
                        </div>
                    </label>

                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${revisionDone ? 'bg-green-500/10 border-green-500/30' : 'bg-[var(--background)] border-transparent'}`}>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={revisionDone} onChange={(e) => setRevisionDone(e.target.checked)} className="w-5 h-5 accent-green-500" />
                            <div>
                                <span className="block font-medium text-sm">Revision?</span>
                                <span className="text-xs text-[var(--text-secondary)]">Reviewing old material</span>
                            </div>
                        </div>
                    </label>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-xl bg-gradient-primary text-white font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 hover:shadow-purple-500/40 transition-all disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Log Session <Check size={20} /></>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
}
