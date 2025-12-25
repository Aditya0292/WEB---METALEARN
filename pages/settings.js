import Head from 'next/head';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Moon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function SettingsPage() {
    return (
        <>
            <Head>
                <title>Settings | MetaLearn AI</title>
            </Head>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto"
            >
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Settings className="text-[var(--accent)]" /> Settings
                    </h1>
                    <p className="text-[var(--text-secondary)]">Manage your preferences and account.</p>
                </div>

                <div className="glass-card p-0 overflow-hidden">
                    <div className="border-b border-[var(--border)] p-6 flex flex-col gap-6">
                        {/* Profile Section */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl">
                                S
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Scholar User</h2>
                                <p className="text-[var(--text-secondary)]">scholar@metalearn.ai</p>
                            </div>
                            <button className="ml-auto px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--surface)]"><Moon size={20} /></div>
                                <div>
                                    <h3 className="font-medium">Appearance</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Toggle Light/Dark Theme</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--surface)]"><Bell size={20} /></div>
                                <div>
                                    <h3 className="font-medium">Notifications</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Daily reminders & Reports</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--accent)]"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[var(--surface)]"><Shield size={20} /></div>
                                <div>
                                    <h3 className="font-medium">Data Privacy</h3>
                                    <p className="text-xs text-[var(--text-secondary)]">Manage your neural data</p>
                                </div>
                            </div>
                            <button className="text-sm font-medium text-[var(--accent)] hover:underline">View Policy</button>
                        </div>
                    </div>

                    <div className="p-6 bg-[var(--surface)]/50 border-t border-[var(--border)]">
                        <button className="text-red-500 font-medium hover:text-red-400 text-sm">Log Out</button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
