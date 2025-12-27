import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function SessionLogger({ onSessionLogged, userId }) {
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

        try {
            const payload = {
                topic,
                timeSpent,
                confidenceScore: confidence,
                errorsMade,
                revisionDone,
                userId
            };

            const response = await fetch('/api/log-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-gradient-end)] flex items-center justify-center text-[var(--background)] mb-4 shadow-xl shadow-[var(--accent)]/20"
                        >
                            <Check size={40} strokeWidth={4} />
                        </motion.div>
                        <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Session Synchronized</h3>
                        <p className="text-[var(--text-secondary)] font-black text-[10px] uppercase tracking-widest mt-2">Updating Neural Mapping...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <h2 className="text-sm font-black mb-8 flex items-center gap-2 uppercase tracking-[0.2em] text-[var(--text-primary)]">
                <BookOpen className="text-[var(--accent)]" size={18} /> Log Neural Session
            </h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Topic Input */}
                <div>
                    <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-1">Pattern Sequence Topic</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. Neural Networks, Quantum Logic..."
                            className="w-full h-14 px-4 pl-12 rounded-xl bg-[var(--surface-highlight)]/5 border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all outline-none font-medium placeholder:opacity-30"
                            required
                        />
                        <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)] opacity-50" />
                    </div>
                </div>

                {/* Time Slider */}
                <div>
                    <label className="flex justify-between items-center text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3 ml-1">
                        <span>Temporal Duration</span>
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min="1"
                                value={timeSpent}
                                onChange={(e) => setTimeSpent(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value)))}
                                className="w-16 py-1 bg-[var(--surface-highlight)]/10 border border-[var(--border)] rounded-lg text-center text-[var(--accent)] font-black focus:outline-none focus:border-[var(--accent)] text-sm"
                            />
                            <span className="text-[var(--accent)] font-black">MIN</span>
                        </div>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="180"
                        step="5"
                        value={timeSpent}
                        onChange={(e) => setTimeSpent(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--surface-highlight)]/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[var(--background)] [&::-webkit-slider-thumb]:shadow-xl hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
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
                    <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4 ml-1">Stability index (Confidence)</label>
                    <div className="flex justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((score) => (
                            <motion.button
                                key={score}
                                type="button"
                                onClick={() => setConfidence(score)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex flex-col items-center justify-center transition-all border ${confidence === score
                                    ? 'bg-gradient-primary text-[var(--background)] border-[var(--accent)] shadow-xl shadow-[var(--accent)]/20 scale-110'
                                    : 'bg-[var(--surface-highlight)]/5 text-[var(--text-secondary)] hover:bg-[var(--surface-highlight)]/10 border-[var(--border)]'
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
                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${errorsMade ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--surface-highlight)]/5 border-[var(--border)]'}`}>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={errorsMade} onChange={(e) => setErrorsMade(e.target.checked)} className="w-5 h-5 accent-red-500" />
                            <div>
                                <span className="block font-medium text-sm">Made Errors?</span>
                                <span className="text-xs text-[var(--text-secondary)]">Struggled with concepts</span>
                            </div>
                        </div>
                    </label>

                    <label className={`flex-1 p-4 rounded-xl border cursor-pointer transition-all ${revisionDone ? 'bg-[var(--success-bg)] border-[var(--success-border)] shadow-md shadow-[var(--success-shadow)]' : 'bg-[var(--surface-highlight)]/5 border-[var(--border)]'}`}>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" checked={revisionDone} onChange={(e) => setRevisionDone(e.target.checked)} className="w-5 h-5 accent-[var(--success-accent)]" />
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
                    className="w-full h-16 rounded-xl bg-gradient-primary text-[var(--background)] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent)]/20 flex items-center justify-center gap-2 hover:shadow-[var(--accent)]/30 transition-all disabled:opacity-70 border border-[var(--accent)]/10"
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
