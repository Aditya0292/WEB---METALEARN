import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, RefreshCw, BarChart2, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import VoiceCoachingPlayer from '../components/VoiceCoachingPlayer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function InsightsPage() {
    const [coachingData, setCoachingData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterMode, setFilterMode] = useState('combined'); // combined, performance, advice
    const [filterSubject, setFilterSubject] = useState('All');
    const [subjects, setSubjects] = useState(['All']);

    // Demo ID
    const userId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

    useEffect(() => {
        fetchLatestInsight();
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        const { data } = await supabase
            .from('sessions')
            .select('topic')
            .eq('user_id', userId);

        if (data) {
            const uniqueTopics = ['All', ...new Set(data.map(s => s.topic))];
            setSubjects(uniqueTopics);
        }
    };

    const fetchLatestInsight = async () => {
        // Fetch existing history first
        const { data, error } = await supabase
            .from('coaching_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) setCoachingData(data);
    };

    const generateNewInsight = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate-coaching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    filters: {
                        mode: filterMode,
                        subject: filterSubject
                    }
                })
            });
            const data = await res.json();

            if (data.success) {
                // Update specific fields based on new generation
                setCoachingData({
                    insight_text: data.insight,
                    pattern_detected: filterMode === 'performance' ? "Performance Audit" : filterMode === 'advice' ? "Strategic Advice" : "Holistic Review",
                    audio_url: data.audioUrl,
                    strategy_recommended: data.howToStudy,
                    youtube_queries: data.youtubeQueries,
                    created_at: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>AI Insights | MetaLearn</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto pb-24"
            >
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                            <Lightbulb className="text-[var(--accent)]" /> Neural Insights
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            Deep analysis of your cognitive performance and study habits.
                        </p>
                    </div>
                </div>

                {/* CONTROL PANEL */}
                <div className="glass-card p-6 mb-8 border border-[var(--accent)]/20">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">

                        {/* Mode Selection */}
                        <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setFilterMode('combined')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterMode === 'combined' ? 'bg-[var(--accent)] text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                <Layers size={16} /> Combined
                            </button>
                            <button
                                onClick={() => setFilterMode('performance')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterMode === 'performance' ? 'bg-cyan-400 text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                <BarChart2 size={16} /> Performance
                            </button>
                            <button
                                onClick={() => setFilterMode('advice')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterMode === 'advice' ? 'bg-purple-400 text-black shadow-lg' : 'text-[var(--text-secondary)] hover:text-white'}`}
                            >
                                <BookOpen size={16} /> Advice
                            </button>
                        </div>

                        {/* Subject Selection */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-[var(--text-secondary)]">Subject:</label>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="bg-[var(--surface)] text-[var(--text-primary)] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-[var(--accent)] outline-none cursor-pointer"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <button
                                onClick={generateNewInsight}
                                disabled={loading}
                                className="ml-4 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--accent)] to-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                {loading ? 'Analyzing...' : 'Analyze'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* AI Player */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-[var(--background)]/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                            <div className="flex flex-col items-center gap-4">
                                <Sparkles className="text-[var(--accent)] animate-pulse" size={48} />
                                <p className="text-[var(--accent)] font-mono animate-pulse">Running Neural Analysis...</p>
                            </div>
                        </div>
                    )}

                    <VoiceCoachingPlayer coachingData={coachingData} />
                </div>

                {/* Additional Details (Hidden if no data) */}
                {coachingData && !loading && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="grid md:grid-cols-2 gap-6"
                    >
                        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-white/5">
                            <h3 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2"><BarChart2 size={18} /> Strategy</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                {coachingData.strategy_recommended || "Focus on consistency and reducing average error rate relative to session duration."}
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-white/5">
                            <h3 className="text-lg font-bold mb-4 text-purple-400 flex items-center gap-2"><Layers size={18} /> Pattern</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Detected <strong>{coachingData.pattern_detected}</strong> based on your recent session logs.
                            </p>
                        </div>

                        {/* YouTube Resources */}
                        {coachingData.youtube_queries && coachingData.youtube_queries.length > 0 && (
                            <div className="md:col-span-2 p-6 rounded-2xl bg-[var(--surface)] border border-red-500/20">
                                <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
                                    <span className="bg-red-500/10 p-1 rounded-lg">▶</span> Recommended Study Resources
                                </h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    {coachingData.youtube_queries.map((query, i) => (
                                        <a
                                            key={i}
                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-4 rounded-xl bg-black/20 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 transition-all group"
                                        >
                                            <div className="font-medium text-white group-hover:text-red-400 mb-1 truncate">{query}</div>
                                            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                                Search YouTube <ArrowRight size={12} />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

            </motion.div>
        </>
    );
}
