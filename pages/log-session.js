import Head from 'next/head';
import { useState, useEffect } from 'react';
import SessionLogger from '@/components/SessionLogger';
import SessionHistoryList from '@/components/SessionHistoryList';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function LogSessionPage() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    const fetchSessions = async (uid) => {
        const targetId = uid || userId;
        if (!targetId) return;

        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', targetId)
                .order('session_timestamp', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (err) {
            console.error("Error fetching sessions:", err);
            setSessions([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchSessions(user.id);
            }
        };
        init();
    }, []);

    return (
        <>
            <Head>
                <title>Log Session | MetaLearn</title>
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
