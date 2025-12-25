import Head from 'next/head';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import ProgressTimeline from '@/components/ProgressTimeline';
import { useState, useEffect } from 'react';

export default function ProgressPage() {
    const [stats, setStats] = useState({
        totalHours: 0,
        totalSessions: 0,
        avgConfidence: 0,
        graphData: []
    });
    const [loading, setLoading] = useState(true);

    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use the consistent Demo UUID
                const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
                const res = await fetch(`/api/dashboard-data?userId=${DEMO_USER_ID}&range=${timeRange}`);
                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();

                // Calculate Stats from the available data
                // Note: dashboard-data returns 'recentSessions' (limit 10) and 'progressData' (aggregated).
                // For accurate "Total" stats, we ideally need a dedicated full-history endpoint or rely on user_profile.
                // Here we will use user_profile for totals if available, or estimate from graph data.

                const graphData = data.progressData || [];
                const serverStats = data.stats || { totalHours: 0, totalSessions: 0, avgConfidence: 0 };

                setStats({
                    totalHours: serverStats.totalHours,
                    totalSessions: serverStats.totalSessions,
                    avgConfidence: serverStats.avgConfidence,
                    graphData: graphData
                });

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange]);

    return (
        <>
            <Head>
                <title>Progress | MetaLearn AI</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <TrendingUp className="text-[var(--accent)]" /> Detailed Progress
                    </h1>
                    <p className="text-[var(--text-secondary)]">Track your forgetting curve retention and mastery over time.</p>
                </div>

                {/* Reuse the Chart Component with Real Data */}
                {loading ? (
                    <div className="h-[350px] glass-card flex items-center justify-center">Loading Data...</div>
                ) : (
                    <ProgressTimeline
                        data={stats.graphData}
                        selectedRange={timeRange}
                        onRangeChange={setTimeRange}
                    />
                )}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-2">Est. Total Hours</h3>
                        <p className="text-3xl font-bold text-[var(--accent)]">{loading ? '-' : stats.totalHours + 'h'}</p>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-2">Sessions Logged</h3>
                        <p className="text-3xl font-bold text-[var(--success)]">{loading ? '-' : stats.totalSessions}</p>
                    </div>
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-2">Avg Confidence</h3>
                        <p className="text-3xl font-bold text-[var(--warning)]">{loading ? '-' : stats.avgConfidence + '/5'}</p>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
