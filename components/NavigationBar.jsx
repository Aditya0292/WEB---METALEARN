import Link from 'next/link';
import { Activity, Plus, Lightbulb, TrendingUp, Settings, FlaskConical, Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/router';

function SidebarItem({ icon: Icon, label, active, href }) {
    const content = (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors whitespace-nowrap overflow-hidden ${active ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

export default function NavigationBar({ isOpen, setIsOpen }) {
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
                    className="bg-[var(--background)] border-r border-[var(--border)] flex flex-col overflow-hidden h-full"
                >
                    <div className="p-6">
                        <Link href="/" className="flex items-center gap-2 mb-8 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">M</div>
                            <span className="font-bold text-[var(--text-primary)] tracking-tight group-hover:text-[var(--accent)] transition-colors">MetaLearn AI</span>
                        </Link>

                        <div className="space-y-4">
                            <SidebarItem icon={Activity} label="Dashboard" href="/dashboard" active={isActive('/dashboard')} />
                            <SidebarItem icon={Plus} label="Log Session" href="/log-session" active={isActive('/log-session')} />
                            <SidebarItem icon={FlaskConical} label="Experiments" href="/experiments" active={isActive('/experiments')} />
                            <SidebarItem icon={Lightbulb} label="Insights" href="/insights" active={isActive('/insights')} />
                            <SidebarItem icon={TrendingUp} label="Progress" href="/progress" active={isActive('/progress')} />
                        </div>
                    </div>

                    <div className="mt-auto p-6 border-t border-[var(--border)]">
                        <SidebarItem icon={Settings} label="Settings" href="/settings" active={isActive('/settings')} />
                    </div>
                </motion.div>

                <button
                    onClick={toggle}
                    className={`absolute top-8 z-50 p-2 rounded-lg bg-cyan-950/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/50 transition-all shadow-lg shadow-cyan-900/20 ${isOpen ? 'left-[220px]' : 'left-4'}`}
                >
                    <ChevronRight size={20} className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </button>
            </div>

            {/* --- MOBILE TOPBAR --- */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--border)] z-50 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-lg text-[var(--text-primary)]">MetaLearn</span>
                </Link>
                <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* --- MOBILE DRAWER Overlay --- */}
            <AnimatePresence>
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
                            <SidebarItem icon={Lightbulb} label="Insights" href="/insights" active={isActive('/insights')} />
                            <SidebarItem icon={TrendingUp} label="Progress" href="/progress" active={isActive('/progress')} />
                            <div className="h-px bg-[var(--border)] my-4" />
                            <SidebarItem icon={Settings} label="Settings" href="/settings" active={isActive('/settings')} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
