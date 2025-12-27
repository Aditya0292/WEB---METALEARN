import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, Shield, Moon, Trash2, AlertTriangle, Check } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resetState, setResetState] = useState('idle'); // idle, confirming, processing, success
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const handleReset = async () => {
        setLoading(true);
        setResetState('processing');
        try {
            const res = await fetch('/api/reset-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id })
            });
            if (res.ok) {
                setResetState('success');
                setTimeout(() => setResetState('idle'), 3000);
            }
        } catch (err) {
            console.error(err);
            setResetState('idle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Settings | MetaLearn</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
            >
                <div className="mb-12">
                    <h1 className="text-4xl font-black mb-3 flex items-center gap-4 text-[var(--text-primary)] tracking-tight uppercase">
                        <div className="p-3 rounded-2xl bg-gradient-primary shadow-xl shadow-[var(--accent)]/10">
                            <Settings className="text-[var(--background)]" size={32} />
                        </div>
                        Settings
                    </h1>
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-60">System Configuration & Neural Tuning</p>
                </div>

                <div className="glass-card p-0 overflow-hidden">
                    <div className="border-b border-[var(--border)] p-8 flex flex-col gap-6 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/5">
                        {/* Profile Section */}
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-primary flex items-center justify-center text-[var(--background)] font-black text-3xl shadow-xl shadow-[var(--accent)]/20">
                                S
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Scholar User</h2>
                                <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-50">{user?.email || 'scholar@metalearn.ai'}</p>
                            </div>
                            <button className="ml-auto px-6 py-2.5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent)] hover:text-[var(--background)] transition-all">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-[var(--surface-highlight)]/10 text-[var(--accent)]"><Moon size={20} /></div>
                                <div>
                                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Appearance</h3>
                                    <p className="text-[10px] text-[var(--text-secondary)] uppercase font-medium opacity-50">Toggle Light/Dark Theme</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        {/* ... Existing Toggles ... */}

                        {/* NEW DANGER ZONE */}
                        <div className="mt-8 pt-6 border-t border-[var(--border)]">
                            <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <AlertTriangle size={14} /> Danger Zone
                            </h3>
                            <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/10 bg-red-500/5">
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Reset Neural History</h4>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">Permanently delete all session logs and insights.</p>
                                </div>
                                <button
                                    onClick={() => resetState === 'idle' ? setResetState('confirming') : handleReset()}
                                    disabled={loading || resetState === 'success'}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${resetState === 'confirming'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : resetState === 'success'
                                            ? 'bg-green-500 text-white'
                                            : 'border border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                        }`}
                                >
                                    {resetState === 'idle' && 'Clear Data'}
                                    {resetState === 'confirming' && 'Are you sure?'}
                                    {resetState === 'processing' && 'Clearing...'}
                                    {resetState === 'success' && <div className="flex items-center gap-1"><Check size={12} /> Done</div>}
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="p-8 bg-[var(--surface-highlight)]/5 border-t border-[var(--border)] text-center">
                        <button onClick={handleLogout} className="text-[var(--text-secondary)] font-bold text-xs uppercase tracking-[0.2em] hover:text-[var(--text-primary)] transition-colors">Terminate Session (Log Out)</button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
