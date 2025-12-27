import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function EmailConfirmed() {
    const router = useRouter();
    const [status, setStatus] = useState('verifying'); // verifying, success, error

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            try {
                // Supabase automatically handles the hash fragment and sets the session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    // Create user profile if it doesn't exist
                    const { data: existingProfile } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .single();

                    if (!existingProfile) {
                        await supabase.from('user_profiles').upsert({
                            user_id: session.user.id,
                            full_name: session.user.user_metadata?.full_name || 'User',
                            qualification: session.user.user_metadata?.qualification || 'Student',
                            total_sessions: 0,
                            rank: 'Bronze',
                            last_updated: new Date()
                        });
                    }

                    setStatus('success');
                } else {
                    setStatus('success'); // Still show success even if no session
                }
            } catch (err) {
                console.error('Email confirmation error:', err);
                setStatus('error');
            }
        };

        handleEmailConfirmation();
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4 relative overflow-hidden">
            <Head>
                <title>Email Confirmed | MetaLearn</title>
            </Head>

            {/* Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.05, 0.1, 0.05],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#1a1d24] border border-gray-800 p-12 rounded-3xl shadow-2xl text-center">
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                            }`}
                    >
                        <CheckCircle size={56} strokeWidth={2.5} />
                    </motion.div>

                    {/* Title */}
                    <h1 className="font-display text-4xl md:text-5xl font-black mb-6 tracking-tight text-white uppercase">
                        {status === 'verifying' ? 'Verifying...' : status === 'error' ? 'Verification Error' : 'Email Confirmed'}
                    </h1>

                    {/* Description - BOLD and LARGER */}
                    <p className="text-white text-lg md:text-xl font-bold mb-10 leading-relaxed">
                        {status === 'verifying' && 'Setting up your neural uplink...'}
                        {status === 'success' && 'Your email has been successfully verified.'}
                        {status === 'error' && 'There was an issue verifying your email.'}
                    </p>

                    {/* CTA Button - BOLD text */}
                    <Link href="/auth">
                        <motion.button
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ y: 0 }}
                            className="w-full bg-blue-500 text-white font-black py-6 rounded-2xl hover:brightness-110 transition-all flex items-center justify-center gap-3 text-sm md:text-base uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20"
                        >
                            Return to Login
                            <ArrowRight size={20} />
                        </motion.button>
                    </Link>

                    {/* Footer Note */}
                    <p className="mt-8 text-xs text-gray-500 font-black uppercase tracking-widest opacity-40">
                        {status === 'success' ? 'Neural uplink activated' : 'Ready to begin'}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
