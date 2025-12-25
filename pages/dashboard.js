import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

import SessionLogger from '@/components/SessionLogger';
import VoiceCoachingPlayer from '@/components/VoiceCoachingPlayer';
import LearningVectorDashboard from '@/components/LearningVectorDashboard';
import ProgressTimeline from '@/components/ProgressTimeline';

export default function Dashboard() {
    const [showLogger, setShowLogger] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d'); // 1. Add timeRange state

    // Simulate Data Fetching
    // Real Data Fetching
    const fetchDashboardData = async (range = timeRange) => { // 2. Allow fetchDashboardData to accept a range arg
        setLoading(true);
        try {
            // For Buildathon demo, we use a fixed User ID to ensure data persistence works without full Auth flow
            const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

            const res = await fetch(`/api/dashboard-data?userId=${DEMO_USER_ID}&range=${range}`); // Use range in API call
            if (!res.ok) throw new Error('Failed to fetch data');

            const data = await res.json();
            setUserData(data);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            // Fallback to avoid empty screen on error (updated fallback from snippet)
            setUserData({
                userProfile: {
                    learning_speed: 0.72,
                    retention_score: 0.85,
                    consistency_score: 0.90,
                    error_recovery_rate: 0.65
                },
                latestCoaching: { insight_text: "Welcome! Log your first session to generate insights.", pattern_detected: "New User" },
                progressData: [],
                recentSessions: [], // Added from snippet
                streakDays: 3 // Added from snippet
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(timeRange); // Call with current timeRange
    }, [timeRange]); // Re-fetch when timeRange changes

    const handleSessionLogged = () => {
        setShowLogger(false);
        fetchDashboardData(); // Refresh data
    };

    // 4. In onRangeChange, set state and call fetch.
    const handleRangeChange = (newRange) => {
        setTimeRange(newRange);
        // fetchDashboardData will be called by useEffect due to timeRange dependency
    };

    return (
        <>
            <Head>
                <title>Dashboard | MetaLearn AI</title>
            </Head>

            <div className="max-w-7xl mx-auto pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, Scholar</h1>
                        <p className="text-[var(--text-secondary)] text-sm md:text-base">Your neural pathways are strengthening.</p>
                    </div>
                    {/* Desktop Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowLogger(true)}
                        className="hidden md:flex px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold shadow-lg shadow-purple-500/20 items-center gap-2"
                    >
                        <Plus size={20} /> Log Session
                    </motion.button>
                </div>

                {/* Mobile FAB (Floating Action Button) */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowLogger(true)}
                    className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--accent)] text-[var(--background)] shadow-2xl flex items-center justify-center border border-white/20"
                    style={{ willChange: 'transform' }}
                >
                    <Plus size={28} strokeWidth={3} />
                </motion.button>

                {/* Content Grid */}
                {loading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-pulse text-[var(--accent)] font-bold">Loading your brain map...</div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        {/* 1. Voice Coaching - Always Show (Fallback handled inside) */}
                        <VoiceCoachingPlayer coachingData={userData?.latestCoaching} />

                        {/* 2. Vector Dashboard */}
                        <LearningVectorDashboard userProfile={userData?.userProfile} />

                        {/* Learning Progress Chart */}
                        <ProgressTimeline
                            data={userData.progressData}
                            selectedRange={timeRange}
                            onRangeChange={setTimeRange}
                        />
                    </div>
                )}
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
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative w-full max-w-xl z-10"
                        >
                            <button
                                onClick={() => setShowLogger(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-full"
                            >
                                <X size={24} />
                            </button>
                            <SessionLogger onSessionLogged={handleSessionLogged} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
