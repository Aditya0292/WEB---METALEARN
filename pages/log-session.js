import Head from 'next/head';
import { useState, useEffect } from 'react';
import SessionLogger from '@/components/SessionLogger';
import SessionHistoryList from '@/components/SessionHistoryList';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function LogSessionPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const DEMO_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Fixed for demo

    const fetchSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', DEMO_USER_ID)
                .order('session_timestamp', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (err) {
            console.error("Error fetching sessions:", err);
            // Mock Data Fallback if DB is empty or fails
            setSessions([
                { id: 1, topic: 'Neural Networks 101', time_spent_minutes: 45, confidence_score: 4, session_timestamp: new Date().toISOString(), revision_done: false },
                { id: 2, topic: 'Calculus Review', time_spent_minutes: 30, confidence_score: 3, session_timestamp: new Date(Date.now() - 86400000).toISOString(), revision_done: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    return (
        <>
            <Head>
                <title>Log Session | MetaLearn AI</title>
            </Head>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto pb-20"
            >
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold mb-2">Log Learning Session</h1>
                    <p className="text-[var(--text-secondary)]">Input what you studied to feed your neural map.</p>
                </div>

                <div className="w-full space-y-8">
                    {/* Pass fetchSessions as callback so list updates after log */}
                    <SessionLogger onSessionLogged={fetchSessions} />

                    <SessionHistoryList sessions={sessions} />
                </div>
            </motion.div>
        </>
    );
}
