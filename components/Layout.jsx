import { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar';
import ThemeToggle from './ThemeToggle';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import { supabase } from '@/lib/supabaseClient';

export default function Layout({ children, user: authUser }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [profile, setProfile] = useState(null);

    const fetchProfile = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
            // 1. Get database profile
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            // 2. AGGRESSIVE IDENTITY RECOVERY from Metadata
            const meta = currentUser.user_metadata || {};
            const nameFromAuth = meta.full_name || meta.display_name || meta.name || currentUser.email?.split('@')[0];

            // 3. AUTO-REPAIR: If DB name is missing or generic, but Auth has a real name, SAVE IT.
            const dbName = data?.full_name;
            const isGeneric = !dbName || dbName === 'Scholar' || dbName === 'aditya'; // Added specific user check just in case

            if (nameFromAuth && isGeneric) {
                await supabase.from('user_profiles').upsert({
                    user_id: currentUser.id,
                    full_name: nameFromAuth,
                    last_updated: new Date().toISOString()
                });
            }

            if (data) {
                setProfile({
                    ...data,
                    full_name: (isGeneric && nameFromAuth) ? nameFromAuth : (dbName || 'Scholar')
                });
            } else {
                setProfile({
                    full_name: nameFromAuth || 'Scholar',
                    rank: 'Bronze'
                });
            }
        }
    };

    useEffect(() => {
        setTimeout(() => fetchProfile(), 0);
    }, [authUser]);


    // Mouse Parallax Logic
    // Mouse Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [winSize, setWinSize] = useState({ w: 1000, h: 800 });

    useEffect(() => {
        setTimeout(() => setWinSize({ w: window.innerWidth, h: window.innerHeight }), 0);

        const handleMouseMove = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        const handleResize = () => {
            setWinSize({ w: window.innerWidth, h: window.innerHeight });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
        };
    }, [x, y]);

    // Smooth spring animation
    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    // Transform ranges for background elements
    const moveX1 = useTransform(springX, [0, winSize.w], [20, -20]);
    const moveY1 = useTransform(springY, [0, winSize.h], [20, -20]);

    const moveX2 = useTransform(springX, [0, winSize.w], [-20, 20]);
    const moveY2 = useTransform(springY, [0, winSize.h], [-20, 20]);

    return (
        <div className="flex h-screen bg-[var(--background)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300">
            <NavigationBar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} profile={profile} />

            <main className="flex-1 overflow-y-auto relative bg-[var(--background)] transition-all duration-300">
                {/* Parallax Background Blobs */}
                <motion.div
                    style={{ x: moveX1, y: moveY1 }}
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 opacity-30 blur-[120px] rounded-full pointer-events-none mix-blend-screen"
                />
                <motion.div
                    style={{ x: moveX2, y: moveY2 }}
                    className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 opacity-30 blur-[100px] rounded-full pointer-events-none mix-blend-screen"
                />

                {/* Top Right Theme Toggle */}
                <div className="hidden md:block absolute top-6 right-8 z-50">
                    <ThemeToggle />
                </div>

                <div className="container mx-auto px-4 py-8 md:p-8 relative z-10 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
