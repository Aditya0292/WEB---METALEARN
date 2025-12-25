import Head from 'next/head';
import { motion } from 'framer-motion';
import { FlaskConical, ArrowRight, Beaker, Plus, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

// Fixed syntax error in fetch URL
export default function ExperimentsPage() {
    const [activeExperiment, setActiveExperiment] = useState(null);
    const [loading, setLoading] = useState(true);
    const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Consistent ID

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
        fetchActiveExperiment();
    }, []);

    const fetchActiveExperiment = async () => {
        try {
            // Cleaned up URL string
            const res = await fetch(`/api/experiments?userId=${DEMO_USER_ID}`);
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
        // Optimistic UI update
        const newExp = {
            user_id: DEMO_USER_ID,
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
                userId: DEMO_USER_ID,
                title: exp.title,
                hypothesis: exp.hypothesis,
                variable_a: exp.varA,
                variable_b: exp.varB
            })
        });
        fetchActiveExperiment(); // Sync real ID
    };

    const logDataPoint = async (variable) => {
        if (!activeExperiment?.id) return;

        // Simulating a mini-log for speed (In real app, opens modal)
        // For demo: Generate a random realistic score 3.0 - 5.0
        const score = (Math.random() * 2 + 3).toFixed(1);

        // Optimistic Update
        const updatedExp = { ...activeExperiment };
        if (variable === 'A') updatedExp.scores_a = [...(updatedExp.scores_a || []), score];
        else updatedExp.scores_b = [...(updatedExp.scores_b || []), score];
        setActiveExperiment(updatedExp);

        await fetch('/api/experiments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                experimentId: activeExperiment.id,
                variable,
                score: parseFloat(score)
            })
        });
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
    const progress = Math.min((totalCount / 6) * 100, 100); // Assume 6 sessions needed

    return (
        <>
            <Head>
                <title>The Lab | MetaLearn AI</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto pb-20"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <FlaskConical className="text-[var(--accent)]" size={32} />
                            The Lab
                        </h1>
                        <p className="text-[var(--text-secondary)]">Run cognitive A/B tests to scientifically optimize your learning behavior.</p>
                    </div>
                    <div className="px-4 py-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono uppercase tracking-widest hidden md:block">
                        Beta Protocol
                    </div>
                </div>

                {/* ACTIVE EXPERIMENT CARD */}
                {activeExperiment ? (
                    <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="glass-card p-0 overflow-hidden border border-[var(--accent)]/30 mb-12"
                    >
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[var(--surface)] to-[var(--accent)]/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Active Experiment</span>
                                    </div>
                                    <h2 className="text-2xl font-bold">{activeExperiment.title}</h2>
                                    <p className="text-[var(--text-secondary)] text-sm max-w-xl mt-1">
                                        Summary: {activeExperiment.hypothesis}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold font-mono">
                                        {totalCount} / 6
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)] uppercase">Data Points</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="h-full bg-[var(--accent)]"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2">
                            {/* VARIABLE A */}
                            <div className="p-8 border-r border-white/5 relative group">
                                <div className="absolute top-4 right-4 text-xs font-mono text-[var(--text-secondary)]">VAR A</div>
                                <h3 className="text-xl font-bold mb-4">{activeExperiment.variable_a}</h3>

                                <div className="mb-6">
                                    <div className="text-sm text-gray-400 mb-1">Avg Confidence</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-cyan-400">{statsA.avg}</span>
                                        <span className="text-sm text-gray-500 mb-1">/ 5.0</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">{statsA.count} Sessions</div>
                                </div>

                                <button
                                    onClick={() => logDataPoint('A')}
                                    className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-cyan-400 hover:text-cyan-400 hover:bg-cyan-400/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Log Session (A)
                                </button>
                            </div>

                            {/* VARIABLE B */}
                            <div className="p-8 relative group">
                                <div className="absolute top-4 right-4 text-xs font-mono text-[var(--text-secondary)]">VAR B</div>
                                <h3 className="text-xl font-bold mb-4">{activeExperiment.variable_b}</h3>

                                <div className="mb-6">
                                    <div className="text-sm text-gray-400 mb-1">Avg Confidence</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-4xl font-bold text-purple-400">{statsB.avg}</span>
                                        <span className="text-sm text-gray-500 mb-1">/ 5.0</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">{statsB.count} Sessions</div>
                                </div>

                                <button
                                    onClick={() => logDataPoint('B')}
                                    className="w-full py-3 rounded-lg border border-dashed border-white/20 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-400/5 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Log Session (B)
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="mb-12 p-8 glass-card border-dashed flex flex-col items-center justify-center text-center">
                        <FlaskConical size={48} className="text-[var(--text-secondary)] mb-4 opacity-50" />
                        <h2 className="text-xl font-bold mb-2">No Active Protocol</h2>
                        <p className="text-[var(--text-secondary)]">Select a hypothesis below to begin testing.</p>
                    </div>
                )}

                {/* AVAILABLE EXPERIMENTS */}
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Beaker size={20} className="text-[var(--text-secondary)]" /> Available Protocols
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    {availableExperiments.map((exp, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ y: -5 }}
                            onClick={() => startExperiment(exp)}
                            className="bg-[var(--surface)] text-left p-6 rounded-xl border border-white/5 hover:border-[var(--accent)]/30 transition-all cursor-pointer group w-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-bold text-lg group-hover:text-[var(--accent)] transition-colors">{exp.title}</h4>
                                <span className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10">{exp.difficulty}</span>
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">
                                {exp.hypothesis}
                            </p>
                            <div className="flex items-center text-[var(--accent)] text-sm font-bold gap-2">
                                Start Protocol <ArrowRight size={16} />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </>
    );
}
