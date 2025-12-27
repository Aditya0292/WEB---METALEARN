import { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { Mail, Lock, User, Calendar, GraduationCap, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [qualification, setQualification] = useState('Student');

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/dashboard');
            } else {
                const { data: { user, session }, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/email-confirmed`,
                        data: {
                            full_name: name,
                            age: age,
                            qualification: qualification
                        }
                    }
                });

                if (error) throw error;

                // Always show success popup - no email confirmation needed
                if (user) {
                    // Create user profile immediately
                    await supabase.from('user_profiles').upsert({
                        user_id: user.id,
                        full_name: name,
                        qualification: qualification,
                        total_sessions: 0,
                        rank: 'Bronze',
                        last_updated: new Date()
                    });

                    setShowSuccessPopup(true); // Show "Successfully Registered" popup
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4 relative overflow-hidden">
            <Head>
                <title>{isLogin ? 'Login' : 'Sign Up'} | MetaLearn</title>
            </Head>

            {/* Premium Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[var(--accent)]/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[var(--accent)]/10 rounded-full blur-[120px]"
                />
            </div>

            {/* SUCCESS POPUP */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[var(--surface)] border border-[var(--accent)]/30 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent pointer-events-none" />

                            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mx-auto mb-6 text-[var(--accent)]">
                                <CheckCircle size={32} />
                            </div>

                            <h3 className="font-display text-2xl font-black uppercase text-[var(--text-primary)] mb-2">Successfully Registered</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
                                Your account has been created successfully. You can now log in with your credentials.
                            </p>

                            <button
                                onClick={() => { setShowSuccessPopup(false); setIsLogin(true); }}
                                className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-[var(--accent)]/20"
                            >
                                Return to Login
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] relative z-10"
            >
                <div className="p-10 border border-gray-800 shadow-2xl relative text-center bg-[#1a1d24] backdrop-blur-3xl rounded-3xl">
                    <div className="mb-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-16 rounded-2xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-[var(--accent)]/10 relative group overflow-hidden p-2"
                        >
                            <img src="/logo.png" alt="MetaLearn" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        </motion.div>
                        <h1 className="font-display text-3xl font-black mb-3 tracking-tight text-white uppercase">
                            {isLogin ? 'Sign In' : 'Neural Uplink'}
                        </h1>
                        <p className="font-display text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] opacity-60">
                            {isLogin ? 'Continue your neural evolution.' : 'Initiate sequence mapping today.'}
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3 text-left"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-3.5">
                            {!isLogin && (
                                <>
                                    <div className="relative group text-left">
                                        <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#0F1115]/20 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-sm text-white font-bold placeholder:text-gray-500/30 focus:outline-none focus:border-blue-500/40 focus:bg-[#0F1115]/40 transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-3.5">
                                        <div className="relative group flex-1 text-left">
                                            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                                <Calendar size={18} />
                                            </div>
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                placeholder="Age"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                                className="w-full bg-[#0F1115]/20 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-sm text-white font-bold placeholder:text-gray-500/30 focus:outline-none focus:border-blue-500/40 focus:bg-[#0F1115]/40 transition-all"
                                            />
                                        </div>
                                        <div className="relative group flex-[1.5] text-left">
                                            <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                                <GraduationCap size={18} />
                                            </div>
                                            <select
                                                required
                                                value={qualification}
                                                onChange={(e) => setQualification(e.target.value)}
                                                className="w-full bg-[#0F1115]/20 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-[10px] font-bold uppercase tracking-widest text-white focus:outline-none focus:border-blue-500/40 focus:bg-[#0F1115]/40 transition-all appearance-none cursor-pointer"
                                            >
                                                <option className="bg-[#1a1d24]">Student</option>
                                                <option className="bg-[#1a1d24]">10th Grade</option>
                                                <option className="bg-[#1a1d24]">12th Grade</option>
                                                <option className="bg-[#1a1d24]">Undergraduate</option>
                                                <option className="bg-[#1a1d24]">Postgraduate</option>
                                                <option className="bg-[#1a1d24]">PhD</option>
                                                <option className="bg-[#1a1d24]">Working Professional</option>
                                                <option className="bg-[#1a1d24]">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="relative group text-left">
                                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    required
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0F1115]/20 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-sm text-white font-bold placeholder:text-gray-500/30 focus:outline-none focus:border-blue-500/40 focus:bg-[#0F1115]/40 transition-all"
                                />
                            </div>

                            <div className="relative group text-left">
                                <div className="absolute left-4.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    required
                                    type="password"
                                    placeholder="PASSWORD"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0F1115]/20 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-sm text-white font-black placeholder:text-gray-500/30 focus:outline-none focus:border-blue-500/40 focus:bg-[#0F1115]/40 transition-all uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ y: 0 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--accent)] text-white font-black py-5 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 mt-6 text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[var(--accent)]/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[var(--background)]/20 border-t-[var(--background)] rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Initialize'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-10 text-center text-xs">
                        <span className="text-[var(--text-secondary)] font-black uppercase tracking-widest opacity-40">
                            {isLogin ? "Neural Profile Missing?" : "Sequence Already Mapped?"}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-black text-[var(--accent)] hover:text-[var(--accent-gradient-end)] transition-colors uppercase tracking-[0.1em]"
                        >
                            {isLogin ? 'Register' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
