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

    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // 1. Get User ID
        supabase.auth.getUser().then(({ data }) => {
            if (data?.user) {
                setUserId(data.user.id);
            }
        });
    }, []);

    useEffect(() => {
        if (userId) {
            fetchLatestInsight();
            fetchSubjects();
        }
    }, [userId]);

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
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black mb-3 flex items-center gap-3 text-[var(--text-primary)] tracking-tight">
                            <Lightbulb className="text-[var(--accent)]" size={32} /> Neural Insights
                        </h1>
                        <p className="text-[var(--text-secondary)] font-medium text-lg leading-tight uppercase tracking-widest opacity-60">
                            Neural Vector Analysis & Performance Mapping
                        </p>
                    </div>
                </div>

                {/* CONTROL PANEL */}
                <div className="glass-card p-6 mb-12 border border-[var(--border)] overflow-hidden">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">

                        {/* Mode Selection */}
                        <div className="flex bg-[var(--surface-highlight)]/5 p-1.5 rounded-2xl border border-[var(--border)]">
                            <button
                                onClick={() => setFilterMode('combined')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterMode === 'combined' ? 'bg-[var(--accent)] text-[var(--background)] shadow-lg shadow-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <Layers size={14} /> Combined
                            </button>
                            <button
                                onClick={() => setFilterMode('performance')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterMode === 'performance' ? 'bg-[var(--accent)]/20 text-[var(--accent)] shadow-lg border border-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <BarChart2 size={14} /> Performance
                            </button>
                            <button
                                onClick={() => setFilterMode('advice')}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filterMode === 'advice' ? 'bg-[var(--accent)]/20 text-[var(--accent)] shadow-lg border border-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                            >
                                <BookOpen size={14} /> Advice
                            </button>
                        </div>

                        {/* Subject Selection */}
                        <div className="flex items-center gap-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50">Filter:</label>
                            <select
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="bg-[var(--surface-highlight)]/5 text-[var(--text-primary)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest focus:border-[var(--accent)] outline-none cursor-pointer hover:bg-[var(--surface-highlight)]/10 transition-all"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>

                            <button
                                onClick={generateNewInsight}
                                disabled={loading}
                                className="ml-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[var(--accent)]/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 border border-[var(--accent)]/10"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                {loading ? 'Analyzing' : 'Sync Analysis'}
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
                        className="grid md:grid-cols-2 gap-6 mt-12"
                    >
                        <div className="p-8 rounded-2xl glass-card border-[var(--border)] bg-[var(--surface)]">
                            <h3 className="text-[10px] font-black mb-4 text-[var(--accent)] flex items-center gap-2 uppercase tracking-[0.2em]"><BarChart2 size={16} /> Strategy Parameter</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                                {coachingData.strategy_recommended || "Focus on consistency and reducing average error rate relative to session duration."}
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl glass-card border-[var(--border)] bg-[var(--surface)]">
                            <h3 className="text-[10px] font-black mb-4 text-[var(--accent-gradient-end)] flex items-center gap-2 uppercase tracking-[0.2em]"><Layers size={16} /> Pattern Detection</h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                                Detected <strong>{coachingData.pattern_detected}</strong> based on your recent session logs.
                            </p>
                        </div>

                        {/* YouTube Resources */}
                        {coachingData.youtube_queries && coachingData.youtube_queries.length > 0 && (
                            <div className="md:col-span-2 p-8 rounded-3xl glass-card border-[var(--border)] bg-[var(--surface)]">
                                <h3 className="text-[10px] font-black mb-6 text-[var(--accent)] flex items-center gap-2 uppercase tracking-[0.2em]">
                                    <span className="bg-[var(--accent)]/10 p-1.5 rounded-lg">▶</span> Neural Resource Optimization
                                </h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {coachingData.youtube_queries.map((query, i) => (
                                        <a
                                            key={i}
                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-5 rounded-2xl bg-[var(--surface-highlight)]/5 hover:bg-[var(--accent)]/5 border border-[var(--border)] hover:border-[var(--accent)]/30 transition-all group overflow-hidden relative"
                                        >
                                            <div className="font-black text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] mb-2 truncate uppercase tracking-tight">{query}</div>
                                            <div className="text-[9px] font-black text-[var(--text-secondary)] flex items-center gap-1 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                                                Resource Matrix <ArrowRight size={10} />
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
