import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ArrowRight, Beaker, Plus, X, Star, Zap, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ExperimentsPage({ session }) {
    const user = session?.user;
    const [activeExperiment, setActiveExperiment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [pendingLog, setPendingLog] = useState(null); // { variable: 'A' | 'B' }
    const [rating, setRating] = useState(3);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableExperiments = [
        {
            title: "Morning vs. Night",
            hypothesis: "Are you biologically primed for higher confidence before 10 AM?",
            difficulty: "Easy",
            varA: "Morning (6-10AM)",
            varB: "Night (8-12PM)"
        },
        {
            title: "Audio vs. Reading",
            hypothesis: "Do you retain more information when listening or reading?",
            difficulty: "Medium",
            varA: "Audiobook",
            varB: "Physical Text"
        },
        {
            title: "Pomodoro vs. Deep Work",
            hypothesis: "Does breaking work into 25m chunks improve retention?",
            difficulty: "Hard",
            varA: "Pomodoro (25m)",
            varB: "Deep Work (90m)"
        }
    ];

    useEffect(() => {
        if (user) fetchActiveExperiment();
    }, [user]);

    const fetchActiveExperiment = async () => {
        try {
            const res = await fetch(`/api/experiments?userId=${user.id}`);
            const data = await res.json();
            if (data.activeExperiment) {
                setActiveExperiment(data.activeExperiment);
            } else {
                setActiveExperiment(null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const startExperiment = async (exp) => {
        if (!user) return;
        const newExp = {
            user_id: user.id,
            title: exp.title,
            hypothesis: exp.hypothesis,
            variable_a: exp.varA,
            variable_b: exp.varB,
            scores_a: [],
            scores_b: []
        };
        setActiveExperiment(newExp);

        await fetch('/api/experiments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: exp.title,
                hypothesis: exp.hypothesis,
                variable_a: exp.varA,
                variable_b: exp.varB
            })
        });
        fetchActiveExperiment();
    };

    const handleLogClick = (variable) => {
        setPendingLog({ variable });
        setShowRatingModal(true);
    };

    const submitLog = async () => {
        if (!activeExperiment?.id || !pendingLog) return;
        setIsSubmitting(true);

        const score = rating;

        // Optimistic Update
        const updatedExp = { ...activeExperiment };
        if (pendingLog.variable === 'A') updatedExp.scores_a = [...(updatedExp.scores_a || []), score];
        else updatedExp.scores_b = [...(updatedExp.scores_b || []), score];
        setActiveExperiment(updatedExp);

        try {
            await fetch('/api/experiments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experimentId: activeExperiment.id,
                    variable: pendingLog.variable,
                    score: parseFloat(score)
                })
            });
            setShowRatingModal(false);
            setPendingLog(null);
            setRating(3);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStats = (scores) => {
        const arr = scores || [];
        const count = arr.length;
        const avg = count > 0 ? (arr.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / count).toFixed(1) : "0.0";
        return { count, avg };
    };

    const statsA = activeExperiment ? getStats(activeExperiment.scores_a) : { count: 0, avg: 0 };
    const statsB = activeExperiment ? getStats(activeExperiment.scores_b) : { count: 0, avg: 0 };
    const totalCount = statsA.count + statsB.count;
    const progress = Math.min((totalCount / 10) * 100, 100); // 10 data points for lab mastery

    return (
        <>
            <Head>
                <title>The Lab | MetaLearn</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto pb-20 px-4"
            >
                <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-3 flex items-center gap-4 text-[var(--text-primary)]">
                            <div className="p-3 rounded-2xl bg-[var(--accent)] shadow-xl shadow-[var(--accent)]/10">
                                <FlaskConical className="text-white" size={32} />
                            </div>
                            The Laboratory
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg font-medium">Conduct cognitive A/B tests to optimize your neural throughput.</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-[0.2em]">
                        <Activity size={14} className="animate-pulse" /> Experimental Protocol Active
                    </div>
                </div>

                {/* ACTIVE EXPERIMENT CARD */}
                {activeExperiment ? (
                    <motion.div
                        layoutId="active-lab"
                        className="glass-card p-0 overflow-hidden border border-[var(--accent)]/20 mb-16 shadow-2xl"
                    >
                        <div className="p-8 border-b border-[var(--border)] bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--accent)]/5 relative overflow-hidden">
                            {/* Decorative Background Elements */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />

                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Collecting Real-time Data</span>
                                    </div>
                                    <h2 className="text-3xl font-black mb-3 text-[var(--text-primary)] tracking-tight">{activeExperiment.title}</h2>
                                    <div className="p-4 rounded-xl bg-[var(--surface-highlight)]/5 border border-[var(--border)] backdrop-blur-sm">
                                        <p className="text-[var(--text-secondary)] text-sm italic font-medium">
                                            " {activeExperiment.hypothesis} "
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-5xl font-black font-mono tracking-tighter text-[var(--accent)]">
                                        {totalCount}<span className="text-xl text-[var(--text-secondary)] opacity-50">/10</span>
                                    </div>
                                    <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-2 opacity-50">Sample Synchronized</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-2 bg-[var(--surface-highlight)]/10 rounded-full overflow-hidden mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute inset-0 bg-[var(--accent)]"
                                />
                            </div>
                            <div className="flex justify-between text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50">
                                <span>Initiation</span>
                                <span>Statistical Significance (10 Sessions)</span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 divide-x divide-[var(--border)]">
                            {/* VARIABLE A */}
                            <div className="p-10 group hover:bg-[var(--accent)]/[0.02] transition-colors relative">
                                <div className="absolute top-6 right-6 text-[10px] font-black text-[var(--accent)]/40 uppercase tracking-widest">Control Variable</div>
                                <h3 className="text-2xl font-black mb-6 text-[var(--accent)] flex items-center gap-3 tracking-tighter">
                                    <Zap size={24} /> {activeExperiment.variable_a}
                                </h3>

                                <div className="flex items-center gap-8 mb-8">
                                    <div>
                                        <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1 tracking-widest opacity-50">Avg Stability</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-[var(--text-primary)]">{statsA.avg}</span>
                                            <span className="text-xs font-black text-[var(--text-secondary)] opacity-50">/ 5.0</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-[var(--border)]" />
                                    <div>
                                        <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1 tracking-widest opacity-50">Sequences</div>
                                        <div className="text-2xl font-black text-[var(--text-primary)]">{statsA.count}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleLogClick('A')}
                                    className="w-full py-4 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/10 text-[var(--accent)] font-black text-xs uppercase tracking-widest hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[var(--accent)]/20 flex items-center justify-center gap-3"
                                >
                                    <Plus size={20} /> Log Neural Result
                                </button>
                            </div>

                            {/* VARIABLE B */}
                            <div className="p-10 group hover:bg-[var(--accent-gradient-end)]/[0.02] transition-colors relative">
                                <div className="absolute top-6 right-6 text-[10px] font-black text-[var(--accent-gradient-end)]/40 uppercase tracking-widest">Test Variable</div>
                                <h3 className="text-2xl font-black mb-6 text-[var(--accent-gradient-end)] flex items-center gap-3 tracking-tighter">
                                    <Beaker size={24} /> {activeExperiment.variable_b}
                                </h3>

                                <div className="flex items-center gap-8 mb-8">
                                    <div>
                                        <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1 tracking-widest opacity-50">Avg Stability</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black text-[var(--text-primary)]">{statsB.avg}</span>
                                            <span className="text-xs font-black text-[var(--text-secondary)] opacity-50">/ 5.0</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-12 bg-[var(--border)]" />
                                    <div>
                                        <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase mb-1 tracking-widest opacity-50">Sequences</div>
                                        <div className="text-2xl font-black text-[var(--text-primary)]">{statsB.count}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleLogClick('B')}
                                    className="w-full py-4 rounded-2xl bg-[var(--accent-gradient-end)]/10 border border-[var(--accent-gradient-end)]/10 text-[var(--accent-gradient-end)] font-black text-xs uppercase tracking-widest hover:bg-[var(--accent-gradient-end)] hover:text-[var(--background)] transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[var(--accent-gradient-end)]/20 flex items-center justify-center gap-3"
                                >
                                    <Plus size={20} /> Log Neural Result
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-16 p-16 glass-card border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center bg-white/[0.01]"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <FlaskConical size={40} className="text-[var(--text-secondary)] opacity-30" />
                        </div>
                        <h2 className="text-2xl font-bold mb-3 text-white">No Active Protocol Found</h2>
                        <p className="text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                            Your neural profile is awaiting calibration. Select a hypothesis below to begin a new scientific protocol.
                        </p>
                    </motion.div>
                )}

                {/* AVAILABLE EXPERIMENTS */}
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black flex items-center gap-3 uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">
                        <Beaker size={18} className="text-[var(--accent)]" /> Protocol Templates
                    </h3>
                    <div className="h-px flex-1 bg-[var(--border)] ml-6" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availableExperiments.map((exp, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ y: -8, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startExperiment(exp)}
                            className="glass-card text-left p-8 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all cursor-pointer group flex flex-col h-full bg-[var(--surface)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-[9px] px-3 py-1 rounded-full bg-[var(--surface-highlight)]/10 border border-[var(--border)] text-[var(--accent)] font-black uppercase tracking-widest">
                                    {exp.difficulty}
                                </div>
                                <ArrowRight size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transform group-hover:translate-x-2 transition-all opacity-40 group-hover:opacity-100" />
                            </div>
                            <h4 className="font-black text-xl mb-3 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-tight">{exp.title}</h4>
                            <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed flex-1 font-medium opacity-70">
                                {exp.hypothesis}
                            </p>
                            <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-[var(--accent)] tracking-[0.2em]">Deploy Protocol</span>
                                <div className="flex -space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/40" />
                                    <div className="w-6 h-6 rounded-full bg-[var(--accent-gradient-end)]/20 border border-[var(--accent-gradient-end)]/40" />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* RATING MODAL */}
            <AnimatePresence>
                {showRatingModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRatingModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-md glass-card p-10 shadow-2xl border border-[var(--accent)]-500/30 overflow-hidden"
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]" />

                            <button
                                onClick={() => setShowRatingModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center">
                                <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-8 shadow-inner border border-[var(--accent)]/20">
                                    <Star className="text-[var(--accent)] fill-[var(--accent)] opacity-50" size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">Protocol Validation</h3>
                                <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest mb-10 opacity-50">Rate retention stability factor</p>

                                <div className="flex justify-center gap-4 mb-12">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setRating(s)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all border ${rating === s
                                                ? 'bg-[var(--accent)] text-[var(--background)] border-[var(--accent)] shadow-xl shadow-[var(--accent)]/30 scale-110'
                                                : 'bg-[var(--surface-highlight)]/5 text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-highlight)]/10'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={submitLog}
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-2xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border border-[var(--accent)]/10"
                                    >
                                        {isSubmitting ? 'SYNCING...' : 'CONFIRM SEQUENCE'}
                                    </button>
                                    <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-black opacity-30">Encrypted via Neural Protocol v4.2</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
