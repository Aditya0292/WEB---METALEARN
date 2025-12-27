import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Clock, Brain, Flame, Award, Zap, Calendar, Activity as ActivityIcon } from 'lucide-react';

import SessionLogger from '@/components/SessionLogger';
import VoiceCoachingPlayer from '@/components/VoiceCoachingPlayer';
import LearningVectorDashboard, { MetricCard } from '@/components/LearningVectorDashboard';
import ProgressTimeline from '@/components/ProgressTimeline';
import SessionHistory from '@/components/SessionHistory';

export default function Dashboard({ session }) {
    const [showLogger, setShowLogger] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const user = session?.user;

    const fetchDashboardData = async (range = timeRange) => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard-data?userId=${user.id}&range=${range}`);
            if (!res.ok) throw new Error('Failed to fetch data');

            const data = await res.json();
            setUserData(data);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            setUserData(null); // Stop showing fake data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(timeRange);
    }, [timeRange]);

    const handleSessionLogged = () => {
        setShowLogger(false);
        fetchDashboardData();
    };

    return (
        <>
            <Head>
                <title>Dashboard | MetaLearn</title>
            </Head>

            <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">System Dashboard</h1>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base font-medium mt-1">
                            Neural Sync: <span className="text-[var(--success)] font-mono uppercase tracking-tighter">Connected</span>
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLogger(true)}
                        className="hidden md:flex px-8 py-4 rounded-2xl bg-[var(--accent)] text-[var(--background)] font-black shadow-xl shadow-[var(--accent)]/10 items-center gap-2 text-sm uppercase tracking-widest border border-[var(--accent)]/20 hover:shadow-[var(--accent)]/20 transition-all"
                    >
                        <Plus size={20} strokeWidth={3} /> Log Session
                    </motion.button>
                </div>

                <div className="space-y-10">
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={Clock}
                            label="Total Deep Work"
                            value={`${userData?.stats?.totalHours || 0}h`}
                            color="text-indigo-400"
                        />
                        <StatCard
                            icon={Brain}
                            label="Total Sessions"
                            value={userData?.stats?.totalSessions || 0}
                            color="text-purple-400"
                        />
                        <StatCard
                            icon={Flame}
                            label="Neural Streak"
                            value={`${userData?.streakDays || 0} Days`}
                            color="text-orange-400"
                        />
                        <StatCard
                            icon={Award}
                            label="Current Rank"
                            value={userData?.userProfile?.rank || 'Bronze'}
                            rank
                            color="text-[var(--accent)]"
                        />
                    </div>

                    {/* Neural Parameters Row - Dynamic Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Learning Speed"
                            val={userData?.userProfile?.learning_speed ?? 0.5}
                            icon={Zap}
                            color="text-[var(--speed)]"
                            desc="Confidence gain / min"
                        />
                        <MetricCard
                            title="Retention"
                            val={userData?.userProfile?.retention_score ?? 0.5}
                            icon={Brain}
                            color="text-[var(--retention)]"
                            desc="Review effectiveness"
                        />
                        <MetricCard
                            title="Consistency"
                            val={userData?.userProfile?.consistency_score ?? 0.5}
                            icon={Calendar}
                            color="text-[var(--consistency)]"
                            desc="Regularity of sessions"
                        />
                        <MetricCard
                            title="Error Recovery"
                            val={userData?.userProfile?.error_recovery_rate ?? 0.5}
                            icon={ActivityIcon}
                            color="text-[var(--recovery)]"
                            desc="Bounce back from errors"
                        />
                    </div>

                    {/* Content Area Rendering */}
                    {loading && !userData ? (
                        <div className="h-96 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-white animate-spin" />
                            <div className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-widest animate-pulse">Syncing Brain Map...</div>
                        </div>
                    ) : (
                        <div className="space-y-10 animate-fade-in relative transition-all duration-500">
                            {/* Background Glows */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/5 blur-[120px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent)]/5 blur-[120px] -z-10" />

                            {/* Top Intelligence Row: AI Coach + Radar - Fixed with items-stretch for flush alignment */}
                            <div className="grid lg:grid-cols-4 gap-8 items-stretch">
                                <div className="lg:col-span-3 h-full">
                                    <VoiceCoachingPlayer coachingData={userData?.latestCoaching} />
                                </div>
                                <div className="lg:col-span-1 h-full">
                                    <LearningVectorDashboard
                                        userProfile={userData?.userProfile}
                                        showMetrics={false}
                                    />
                                </div>
                            </div>

                            {/* Middle Row: Progress Timeline (Full Width) */}
                            <div className="w-full">
                                <ProgressTimeline
                                    data={userData.progressData}
                                    selectedRange={timeRange}
                                    onRangeChange={setTimeRange}
                                />
                            </div>

                            {/* Bottom Row: Session History (Full Width) */}
                            <div className="w-full">
                                <SessionHistory
                                    sessions={userData?.recentSessions}
                                    selectedRange={timeRange}
                                    onRangeChange={setTimeRange}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile FAB */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLogger(true)}
                    className="md:hidden fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-[var(--accent)] text-[var(--background)] shadow-2xl flex items-center justify-center border border-[var(--accent)]/30"
                >
                    <Plus size={32} strokeWidth={3} />
                </motion.button>
            </div>

            {/* Logger Modal */}
            <AnimatePresence>
                {showLogger && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogger(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-xl z-10"
                        >
                            <button
                                onClick={() => setShowLogger(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                            <SessionLogger onSessionLogged={handleSessionLogged} userId={user?.id} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

function StatCard({ icon: Icon, label, value, color, rank }) {
    return (
        <div className="glass-card p-5 md:p-6 flex flex-col justify-between border-[var(--border)]">
            <div className={`p-2 rounded-lg bg-[var(--surface-highlight)]/10 w-fit ${color || 'text-[var(--accent)]'}`}>
                <Icon size={20} />
            </div>
            <div className="mt-4">
                <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                <h4 className={`text-xl md:text-2xl font-black tracking-tight ${rank ? `bg-gradient-to-r ${color === 'text-[var(--accent)]' ? 'from-[#DCC48E] to-[#B3C0A4]' : 'from-yellow-400 to-orange-500'} bg-clip-text text-transparent` : 'text-[var(--text-primary)]'}`}>
                    {value}
                </h4>
            </div>
        </div>
    );
}
