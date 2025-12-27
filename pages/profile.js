import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Dna,
    Palette,
    Mic,
    Bell,
    Lock,
    Edit2,
    ChevronRight,
    Camera,
    Award,
    ShieldCheck,
    Zap,
    Brain,
    Target,
    LogOut,
    Check
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage({ session }) {
    const user = session?.user;
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const router = useRouter();

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        qualification: '',
        dna_preferred_time: '',
        dna_learning_mode: ''
    });

    const qualifications = ["10th Grade", "12th Grade", "Undergraduate", "Postgraduate", "PhD", "Professional", "Other"];

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') throw profileError;

            // 2. Fetch Sessions for Analysis
            const { data: sessions, error: sessionError } = await supabase
                .from('study_sessions')
                .select('*')
                .eq('user_id', user.id);

            if (sessionError) throw sessionError;

            // 3. Calculate Learning DNA
            const dna = calculateDNA(sessions || []);

            if (profileData) {
                const metadata = user?.user_metadata || {};
                const nameFromAuth = metadata.full_name || metadata.display_name || metadata.name || user.email?.split('@')[0];

                const finalProfile = {
                    ...profileData,
                    full_name: profileData.full_name || nameFromAuth || 'Scholar',
                    // DNA Overrides from real analysis
                    dna_preferred_time: dna.primeTime,
                    dna_learning_mode: dna.strongestMode,
                    dna_pattern: dna.pattern,
                    total_sessions: sessions?.length || 0 // Ensure count is accurate
                };

                setProfile(finalProfile);
                setFormData({
                    full_name: finalProfile.full_name,
                    qualification: profileData.qualification || 'Learning Profile',
                    dna_preferred_time: dna.primeTime, // Use calculated
                    dna_learning_mode: dna.strongestMode // Use calculated
                });
            }
        } catch (e) {
            console.error("Profile fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Calculate Learning DNA from Session Data
    const calculateDNA = (sessions) => {
        if (!sessions || sessions.length === 0) {
            return {
                primeTime: 'Pending Data',
                strongestMode: 'Calibrating...',
                pattern: 'Initializing'
            };
        }

        // 1. Prime Time (Morning/Afternoon/Evening/Night)
        const hours = sessions.map(s => new Date(s.created_at).getHours());
        const morning = hours.filter(h => h >= 5 && h < 12).length;
        const afternoon = hours.filter(h => h >= 12 && h < 17).length;
        const evening = hours.filter(h => h >= 17 && h < 22).length;
        const night = hours.filter(h => h >= 22 || h < 5).length;

        let primeTime = 'Mixed';
        const maxTime = Math.max(morning, afternoon, evening, night);
        if (maxTime === morning) primeTime = 'Morning';
        else if (maxTime === afternoon) primeTime = 'Afternoon';
        else if (maxTime === evening) primeTime = 'Evening';
        else if (maxTime === night) primeTime = 'Late Night';

        // 2. Strongest Mode (Based on mock data or assumption for now as session type might not be granular)
        // Ideally we check session types. Assuming just 'Focus' counts effectively.
        // For now, if we have data, we can call it "Focus Flow" or similar until we have distinct types.
        let strongestMode = 'Deep Work';

        // 3. Pattern (Developing vs Established)
        const pattern = sessions.length > 10 ? 'Established' : 'Developing';

        return { primeTime, strongestMode, pattern };
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    ...formData,
                    last_updated: new Date()
                })
                .eq('user_id', user.id);

            if (error) throw error;

            setProfile({ ...profile, ...formData });
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (e) {
            alert("Failed to update profile");
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const getRankColor = (rank) => {
        switch (rank?.toLowerCase()) {
            case 'diamond': return 'from-[#3B82F6] to-[#1D4ED8]';
            case 'platinum': return 'from-[#E2E8F0] to-[#94A3B8]';
            case 'gold': return 'from-[#F59E0B] to-[#D97706]';
            case 'silver': return 'from-[#CBD5E1] to-[#64748B]';
            default: return 'from-[#92400E] to-[#78350F]'; // Bronze
        }
    };

    const getProgressToNext = (total) => {
        if (total > 50) return 100;
        if (total > 30) return ((total - 30) / 20) * 100;
        if (total > 15) return ((total - 15) / 15) * 100;
        if (total > 5) return ((total - 5) / 10) * 100;
        return (total / 5) * 100;
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-pulse text-[var(--accent)] font-bold text-xl">Accessing neural profile...</div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Profile | MetaLearn</title>
            </Head>

            <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">Neural Profile</h1>
                        <p className="text-[var(--text-secondary)] text-sm font-medium mt-1">
                            System Status: <span className="text-[var(--success)] font-mono uppercase tracking-tighter">Synced</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[var(--surface-highlight)]/10 border border-[var(--border)] hover:bg-[var(--surface-highlight)]/20 transition-all text-xs font-black uppercase tracking-widest text-[var(--text-primary)] shadow-xl shadow-black/5"
                    >
                        {isEditing ? 'Cancel Edit' : (
                            <><Edit2 size={16} /> Edit Profile</>
                        )}
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Rank */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-10 flex flex-col items-center text-center relative overflow-hidden group"
                        >
                            {/* Ambient Glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[var(--accent)]/10 blur-[60px] pointer-events-none" />

                            <div className="relative group mb-6">
                                <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${getRankColor(profile?.rank)} p-1 shadow-2xl shadow-purple-500/20`}>
                                    <div className="w-full h-full rounded-full bg-[var(--surface)] flex items-center justify-center overflow-hidden border-4 border-black/20">
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={80} className="text-[var(--text-secondary)]" />
                                        )}
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 rounded-full bg-white text-black shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
                                    <Camera size={18} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-black mb-1 tracking-tight text-[var(--text-primary)]">
                                {(!profile?.full_name || profile?.full_name === 'Scholar')
                                    ? (user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'Scholar')
                                    : profile.full_name}
                            </h2>
                            <p className="text-[var(--text-secondary)] font-black text-xs uppercase tracking-[0.2em] mb-8">{profile?.qualification || 'Learning Profile'}</p>

                            <div className="w-full pt-8 border-t border-white/5 relative z-10">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <Award size={18} className="text-[var(--accent)]" />
                                        <span className="font-black uppercase tracking-[0.2em] text-[10px] text-gray-500">Neural Rank</span>
                                    </div>
                                    <span className={`font-black text-sm uppercase tracking-wider bg-gradient-to-r ${getRankColor(profile?.rank)} bg-clip-text text-transparent`}>
                                        {profile?.rank || 'Bronze'}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-2 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${getProgressToNext(profile?.total_sessions || 0)}%` }}
                                        className={`h-full bg-gradient-to-r ${getRankColor(profile?.rank)} shadow-[0_0_15px_rgba(59,130,246,0.3)]`}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Growth Progress</p>
                                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                        {profile?.total_sessions || 0} Records
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <div className="glass-card p-8 border-[var(--border)]">
                            <h3 className="text-[10px] font-black mb-8 uppercase tracking-[0.2em] text-[var(--text-secondary)] flex items-center gap-2">
                                <ShieldCheck size={14} className="text-green-500" /> System Metrics
                            </h3>
                            <div className="space-y-6">
                                <StatusRow label="Neural Sync" value="Active" color="text-green-400" />
                                <StatusRow label="Data Clusters" value={profile?.total_sessions || 0} />
                                <StatusRow label="Last Uplink" value="Today" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: DNA & Form */}
                    <div className="md:col-span-2 space-y-6">
                        <AnimatePresence mode="wait">
                            {isEditing ? (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="glass-card p-8"
                                >
                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Edit2 size={20} className="text-[var(--accent)]" /> Configure Profile
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Display Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                    className="w-full bg-[var(--background)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Qualification</label>
                                                <select
                                                    value={formData.qualification}
                                                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                                    className="w-full bg-[var(--background)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all appearance-none"
                                                >
                                                    {qualifications.map(q => <option key={q} value={q}>{q}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Primary Mode</label>
                                                <input
                                                    type="text"
                                                    value={formData.dna_learning_mode}
                                                    onChange={(e) => setFormData({ ...formData, dna_learning_mode: e.target.value })}
                                                    placeholder="e.g. Visual, Audio..."
                                                    className="w-full bg-[var(--background)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Prime Time</label>
                                                <input
                                                    type="text"
                                                    value={formData.dna_preferred_time}
                                                    onChange={(e) => setFormData({ ...formData, dna_preferred_time: e.target.value })}
                                                    placeholder="e.g. Early Morning"
                                                    className="w-full bg-[var(--background)] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[var(--accent)] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleSave}
                                            className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold shadow-lg shadow-[var(--accent)]/20"
                                        >
                                            Save Neural Mapping
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    <div className="glass-card p-10 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/5 border-[var(--border)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px] -z-10" />

                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-4 rounded-2xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20">
                                                <Dna size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black tracking-tight leading-tight">Learning DNA</h3>
                                                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Neural Fingerprint Verified</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <DNACard
                                                title="Prime Time"
                                                value={profile?.dna_preferred_time || 'Analysing...'}
                                                icon={Zap}
                                                color="text-yellow-400"
                                                desc="Peak neural firing"
                                            />
                                            <DNACard
                                                title="Strongest Mode"
                                                value={profile?.dna_learning_mode || 'Analysing...'}
                                                icon={Brain}
                                                color="text-pink-400"
                                                desc="Optimal input chan."
                                            />
                                            <DNACard
                                                title="Pattern"
                                                value={profile?.dna_pattern || 'Developing'}
                                                icon={Target}
                                                color="text-cyan-400"
                                                desc="Session behavior"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Settings */}
                                    <div className="glass-card p-0 overflow-hidden border-[var(--border)]">
                                        <div className="p-6 border-b border-[var(--border)]">
                                            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-[var(--text-primary)]">
                                                <Palette size={18} className="text-[var(--text-secondary)]" /> Preferences
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-white/5">
                                            <PreferenceRow icon={Bell} title="Smart Notifications" subtitle="AI reminders for peak focus times" toggled />
                                            <PreferenceRow icon={Mic} title="Voice Feedback" subtitle="Enable AI coach auditory insights" toggled />
                                            <PreferenceRow icon={Palette} title="Theme Engine" subtitle="Dark mode synchronization" toggled />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-between p-6 glass-card hover:bg-red-500/5 transition-all group border-red-500/10"
                                    >
                                        <div className="flex items-center gap-4 text-red-500">
                                            <LogOut size={20} />
                                            <div className="text-left">
                                                <p className="font-bold">Terminate Session</p>
                                                <p className="text-xs opacity-70">Log out of this neural interface</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="text-red-500 opacity-30 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-green-500 text-white font-bold shadow-xl flex items-center gap-2"
                    >
                        <Check size={18} strokeWidth={3} /> Profile Synchronized
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function DNACard({ title, value, icon: Icon, color, desc }) {
    return (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] group hover:bg-[var(--accent)]/10 transition-all hover:scale-[1.05] shadow-sm">
            <Icon size={20} className={`${color} mb-4 transition-transform group-hover:scale-110`} />
            <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">{title}</h4>
            <p className="font-black text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis mb-1">{value}</p>
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tight opacity-70">{desc}</p>
        </div>
    );
}

function StatusRow({ label, value, color }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors uppercase tracking-tighter">{label}</span>
            <span className={`text-xs font-mono font-black tracking-tighter ${color || 'text-[var(--text-primary)]'}`}>{value}</span>
        </div>
    );
}

function PreferenceRow({ icon: Icon, title, subtitle, toggled }) {
    return (
        <div className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5">
                    <Icon size={18} className="text-[var(--text-secondary)]" />
                </div>
                <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
                </div>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${toggled ? 'bg-[var(--accent)]' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${toggled ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
        </div>
    );
}
