import Link from 'next/link';
import { Activity, Plus, Lightbulb, TrendingUp, Settings, FlaskConical, Menu, X, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

function SidebarItem({ icon: Icon, label, active, href }) {
    const content = (
        <div className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all whitespace-nowrap overflow-hidden ${active ? 'text-[var(--text-primary)] bg-[var(--accent)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-highlight)]'}`}>
            {active && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent-gradient-end)]/10 border-l-2 border-[var(--accent)] z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <Icon size={18} className={`shrink-0 z-10 transition-transform group-hover:scale-110 ${active ? 'text-[var(--accent)]' : ''}`} />
            <span className="text-sm font-bold z-10">{label}</span>
            {active && (
                <motion.div
                    layoutId="sidebar-dot"
                    className="ml-auto w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)] z-10"
                />
            )}
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

export default function NavigationBar({ isOpen, setIsOpen, profile }) {
    const router = useRouter();
    // Mobile State
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Toggle function (safe check for Desktop)
    const toggle = () => {
        if (setIsOpen) setIsOpen(!isOpen);
    }

    const isActive = (path) => router.pathname === path;

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <div className="hidden md:flex relative z-50 h-screen">
                <motion.div
                    initial={{ width: 240, opacity: 1 }}
                    animate={{
                        width: isOpen ? 240 : 0,
                        opacity: isOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="bg-transparent border-r border-[var(--border)] flex flex-col overflow-hidden h-full glass-panel"
                >
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <img src="/logo.png" alt="MetaLearn Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] filter" />
                            </div>
                            <span className="font-black text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">MetaLearn</span>
                        </Link>

                        <div className="space-y-1">
                            <SidebarItem icon={Activity} label="Dashboard" href="/dashboard" active={isActive('/dashboard')} />
                            <SidebarItem icon={Plus} label="Log Session" href="/log-session" active={isActive('/log-session')} />
                            <SidebarItem icon={FlaskConical} label="Experiments" href="/experiments" active={isActive('/experiments')} />
                            <SidebarItem icon={TrendingUp} label="Progress" href="/progress" active={isActive('/progress')} />
                            <SidebarItem icon={Lightbulb} label="Insights" href="/insights" active={isActive('/insights')} />
                            <SidebarItem icon={User} label="Profile" href="/profile" active={isActive('/profile')} />
                        </div>
                    </div>

                    <div className="mt-auto p-4 border-t border-[var(--border)] bg-[var(--surface-highlight)]/50">
                        <Link href="/profile">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="glass-card flex items-center gap-3 p-3 group transition-all !rounded-2xl border-[var(--border)]"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-lg">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-white" />
                                    )}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-black text-[var(--text-primary)] truncate leading-tight">
                                        {profile?.full_name || 'Scholar'}
                                    </p>
                                    <p className="text-[10px] font-black text-[var(--accent)] uppercase tracking-widest mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {profile?.rank || 'Bronze'}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="ml-auto text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
                            </motion.div>
                        </Link>
                        <div className="mt-3">
                            <SidebarItem icon={Settings} label="Settings" href="/settings" active={isActive('/settings')} />
                        </div>
                    </div>
                </motion.div >

                <button
                    onClick={toggle}
                    className={`absolute top-8 z-50 p-2 rounded-lg bg-[var(--surface-highlight)]/30 text-[var(--accent)] border border-[var(--border)] hover:bg-[var(--surface-highlight)]/50 transition-all shadow-lg ${isOpen ? 'left-[220px]' : 'left-4'}`}
                >
                    <ChevronRight size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
            </div >

            {/* --- MOBILE TOPBAR --- */}
            < div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border)] z-50 flex items-center justify-between px-4" >
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img src="/logo.png" alt="MetaLearn Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    </div>
                    <span className="font-black text-lg text-[var(--text-primary)] drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">MetaLearn</span>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div >

            {/* --- MOBILE DRAWER Overlay --- */}
            < AnimatePresence >
                {isMobileOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="md:hidden fixed inset-0 top-16 bg-[var(--background)] z-40 p-4 border-l border-[var(--border)]"
                    >
                        <div className="space-y-4">
                            <SidebarItem icon={Activity} label="Dashboard" href="/dashboard" active={isActive('/dashboard')} />
                            <SidebarItem icon={Plus} label="Log Session" href="/log-session" active={isActive('/log-session')} />
                            <SidebarItem icon={FlaskConical} label="Experiments" href="/experiments" active={isActive('/experiments')} />
                            <SidebarItem icon={User} label="Profile" href="/profile" active={isActive('/profile')} />
                            <SidebarItem icon={Lightbulb} label="Insights" href="/insights" active={isActive('/insights')} />
                            <SidebarItem icon={TrendingUp} label="Progress" href="/progress" active={isActive('/progress')} />
                            <div className="h-px bg-[var(--border)] my-4" />
                            <SidebarItem icon={Settings} label="Settings" href="/settings" active={isActive('/settings')} />
                        </div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </>
    );
}
