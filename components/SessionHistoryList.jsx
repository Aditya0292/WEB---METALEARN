import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import { format, isThisWeek, isToday, isThisMonth, parseISO } from 'date-fns';

export default function SessionHistoryList({ sessions = [] }) {
    const [filter, setFilter] = useState('All'); // All, Week, Month

    const filteredSessions = useMemo(() => {
        if (!sessions) return [];
        const now = new Date();

        return sessions.filter(session => {
            const date = new Date(session.session_timestamp || session.created_at);
            if (filter === 'Week') return isThisWeek(date, { weekStartsOn: 1 });
            if (filter === 'Month') return isThisMonth(date);
            return true;
        }).sort((a, b) => new Date(b.session_timestamp) - new Date(a.session_timestamp));
    }, [sessions, filter]);

    return (
        <div className="glass-card p-6 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="text-[var(--accent)]" /> Session History
                </h3>

                <div className="flex p-1 bg-[var(--background)] rounded-lg">
                    {['All', 'Week', 'Month'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f
                                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence mode='popLayout'>
                    {filteredSessions.length > 0 ? (
                        filteredSessions.map((session, index) => (
                            <motion.div
                                key={session.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)]/50 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                                        <BookOpen size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--text-primary)]">{session.topic}</h4>
                                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                            <span className="flex items-center gap-1"><Calendar size={10} /> {format(new Date(session.session_timestamp), 'MMM d, yyyy')}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {session.time_spent_minutes} min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${session.confidence_score >= 4 ? 'bg-green-500/10 text-green-500' :
                                            session.confidence_score >= 3 ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-red-500/10 text-red-500'
                                        }`}>
                                        Conf: {session.confidence_score}/5
                                    </div>
                                    {session.revision_done && (
                                        <span className="text-[10px] uppercase tracking-wide text-[var(--accent)] font-bold">Revision</span>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-[var(--text-secondary)]">
                            <p>No sessions found for this period.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
