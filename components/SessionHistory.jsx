import { motion } from 'framer-motion';
import { Clock, Calendar, AlertCircle, RefreshCw, Star } from 'lucide-react';

export default function SessionHistory({ sessions, selectedRange, onRangeChange }) {
    const ranges = [
        { id: '7d', label: '7D' },
        { id: '30d', label: '30D' },
        { id: 'all', label: 'ALL' }
    ];

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="glass-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-sm font-black flex items-center gap-2 uppercase tracking-[0.2em] text-[var(--text-primary)]">
                        <Clock className="text-[var(--accent)]" size={20} />
                        Neural Temporal Log
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1 opacity-60">Sequence Verification Complete</p>
                </div>

                <div className="flex p-1 bg-[var(--surface-highlight)]/10 rounded-xl border border-[var(--border)] relative">
                    {ranges.map((range) => (
                        <button
                            key={range.id}
                            onClick={() => onRangeChange(range.id)}
                            className={`relative px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 z-10 ${selectedRange === range.id
                                ? 'text-[var(--background)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {selectedRange === range.id && (
                                <motion.div
                                    layoutId="history-range-pill"
                                    className="absolute inset-0 bg-[var(--accent)] rounded-lg z-[-1] shadow-lg shadow-[var(--accent)]/10"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {sessions?.length > 0 ? (
                    sessions.map((session, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={session.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-[var(--surface)]/40 border border-[var(--border)] hover:bg-[var(--accent)]/5 hover:border-[var(--accent)]/20 transition-all gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[var(--surface-highlight)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--border)]">
                                    <Star size={18} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors tracking-tight uppercase">
                                        {session.topic}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
                                        <span className="flex items-center gap-1 opacity-70">
                                            <Calendar size={10} /> {formatDate(session.session_timestamp)}
                                        </span>
                                        <span className="flex items-center gap-1 text-[var(--accent)]">
                                            <Clock size={10} /> {session.time_spent_minutes}M
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 justify-between md:justify-end">
                                <div className="flex gap-2">
                                    {session.revision_done && (
                                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <RefreshCw size={8} /> Revision
                                        </span>
                                    )}
                                    {session.errors_made && (
                                        <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <AlertCircle size={8} /> Correction
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 bg-[var(--surface-highlight)]/10 px-3 py-1.5 rounded-full border border-[var(--border)]">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-1 h-1 rounded-full mx-0.5 ${i < session.confidence_score ? 'bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]' : 'bg-[var(--text-secondary)]/20'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-black text-[var(--text-primary)]">{session.confidence_score}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-[var(--text-secondary)] text-sm">No neural logs found for this period.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
