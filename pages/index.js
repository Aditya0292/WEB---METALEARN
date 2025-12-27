import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script'; // Import Next.js Script
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useScroll, useSpring as useSpringScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Activity, Mic, TrendingUp, Brain, Zap, Clock, ChevronRight, Play, Plus } from 'lucide-react';
import LearningVectorDashboard from '@/components/LearningVectorDashboard';
import VoiceCoachingPlayer from '@/components/VoiceCoachingPlayer';
import Typewriter from '@/components/Typewriter';

// --- Components ---

function Navbar() {
  const { scrollY } = useScroll();
  // Hardcoded Dark Mode Surface RGB: 31, 41, 55 for #1F2937
  const navBg = useTransform(scrollY, [0, 100], ["rgba(31, 41, 55, 0.5)", "rgba(31, 41, 55, 0.8)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.05)"]);
  const navScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  return (
    <motion.nav
      style={{ scale: navScale }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 transition-all duration-300"
    >
      <motion.div
        style={{ backgroundColor: navBg, borderColor: navBorder }}
        className="w-full h-16 px-6 rounded-full backdrop-blur-md border border-transparent shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-between"
      >

        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img src="/logo.png" alt="MetaLearn" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </div>
          <span className="font-display font-black text-lg tracking-tight text-white group-hover:text-blue-500 transition-colors uppercase drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">MetaLearn</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/auth" className="font-display hidden md:block text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/auth" className="font-display px-5 py-2 rounded-full bg-[var(--accent)] text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-[var(--accent)]/20 border border-[var(--accent)]/10">
            Get Started
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="font-display text-sm font-medium text-gray-400 hover:text-[var(--accent)] transition-colors relative group">
      {children}
    </a>
  )
}

function MagneticButton({ children, className }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  }

  const { x, y } = position;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 3D Card
function FeatureCard({ title, desc, icon: Icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      // REMOVED glass-card class to prevent light mode bleed.
      // Hardcoded bg-[#13151a] for deep dark card.
      className="group relative p-10 rounded-[32px] border border-gray-800 hover:border-blue-500/50 transition-all duration-500 shadow-2xl bg-[#13151a] overflow-hidden"
    >
      {/* Glossy Overlay - Adjusted for Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-gray-800 flex items-center justify-center text-blue-500 mb-8 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 shadow-xl">
          <Icon size={32} />
        </div>
        <h3 className="text-2xl font-black mb-4 text-white group-hover:text-blue-500 transition-colors uppercase tracking-tight">{title}</h3>
        <p className="font-display text-gray-400 leading-relaxed text-sm group-hover:text-white font-medium opacity-60 group-hover:opacity-100 transition-all">{desc}</p>
      </div>
    </motion.div>
  )
}


function SidebarItem({ icon: Icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/20' : 'text-gray-400 hover:text-white hover:bg-gray-800/10'}`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export default function Home() {
  const { scrollYProgress } = useScroll();

  // Interaction
  const heroRef = useRef(null);
  const splinerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function handleHeroMove({ clientX, clientY, currentTarget }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);

    // Manually move the Spline container if desired, but let's assume the scene handles it or we do slight parallax
    // We can translate the container slightly opposite to cursor for depth
  }

  // Container Parallax
  const x = useTransform(mouseX, [-1000, 1000], [15, -15]);
  const y = useTransform(mouseY, [-1000, 1000], [15, -15]);

  // Scroll Progress Transforms for Hero
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.9]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);


  // Mock Data for Preview
  const mockCoaching = {
    insight_text: "Great job maintaining consistency! Your retention in Physics has improved by 15% since you started 30-minute intervals.",
    audio_url: null, // Just UI
    pattern_detected: "Optimal Retention"
  };

  // Remove Spline Logo
  useEffect(() => {
    const removeLogo = () => {
      const viewer = document.querySelector('spline-viewer');
      if (viewer && viewer.shadowRoot) {
        const logo = viewer.shadowRoot.querySelector('#logo');
        if (logo) {
          logo.remove();
        }
      }
    };

    // Attempt to remove logo periodically as it loads
    const interval = setInterval(removeLogo, 500);
    const timeout = setTimeout(() => clearInterval(interval), 10000); // Stop checking after 10s

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const mockProfile = {
    learning_speed: 0.72,
    retention_score: 0.85,
    consistency_score: 0.90,
    error_recovery_rate: 0.65
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <Head>
        <title>MetaLearn | The Future of Learning</title>
      </Head>

      {/* Script for Spline */}
      <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.27/build/spline-viewer.js" strategy="afterInteractive" />

      <Navbar />

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gradient-end)] z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <main>
        {/* --- HERO SECTION --- */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMove}
          className="relative min-h-[120vh] flex flex-col items-center pt-32 px-6 overflow-hidden md:px-0"
        >
          {/* SPLINE BACKGROUND - Hidden on mobile for performance */}
          <motion.div
            style={{ x, y }}
            className="hidden md:block absolute inset-0 z-0 scale-105 -translate-y-[5%]"
          >
            {/* @ts-ignore */}
            <spline-viewer url="https://prod.spline.design/SM-CqQU8sBrOLdOW/scene.splinecode"></spline-viewer>

            {/* Overlay removed as per user request to keep it dark */}
            <div className="absolute inset-0 pointer-events-none" />
          </motion.div>

          {/* Floating Parallax Glows - Hidden on mobile for performance */}
          <motion.div
            style={{ y: useTransform(scrollY, [0, 1000], [0, -200]) }}
            className="hidden md:block absolute top-1/4 -left-20 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[120px] pointer-events-none"
          />
          <motion.div
            style={{ y: useTransform(scrollY, [0, 1000], [0, 200]) }}
            className="hidden md:block absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--accent-gradient-end)]/5 rounded-full blur-[120px] pointer-events-none"
          />

          <motion.div
            style={{ scale: heroScale, opacity: heroOpacity, y: heroY }}
            className="relative z-10 text-center max-w-5xl mx-auto mt-10 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)] mb-10 backdrop-blur-md pointer-events-auto"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent-glow)]" />
              Neural Engine v4.2 Active
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-7xl md:text-[10rem] leading-[0.85] font-bold tracking-tighter mb-8 drop-shadow-2xl uppercase"
            >
              Master any skill. <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-600 to-slate-400 text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] text-4xl md:text-7xl font-bold pb-2 block mt-2">
                <Typewriter
                  phrases={[
                    "In record time.",
                    "With neural precision.",
                    "At cognitive peak.",
                    "Without burnout."
                  ]}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-lg text-gray-200 max-w-2xl mx-auto mb-12 leading-relaxed font-bold uppercase tracking-widest drop-shadow-md"
            >
              Synchronize your cognitive throughput with our neural vector engine. Optimized for stability, velocity, and mastery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center pointer-events-auto mb-20"
            >
              <MagneticButton className="w-full sm:w-auto">
                <Link href="/auth" className="w-full px-10 py-5 rounded-2xl bg-[var(--accent)] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-[1.05] shadow-2xl shadow-[var(--accent)]/30 border border-[var(--accent)]/20">
                  Join the Laboratory
                  <ArrowRight size={20} />
                </Link>
              </MagneticButton>
              <MagneticButton className="w-full sm:w-auto">
                <button className="w-full px-10 py-5 rounded-2xl bg-[#374151]/5 border border-gray-700 hover:bg-[#374151]/10 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all backdrop-blur-md group">
                  <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all text-[var(--accent)]">
                    <Play size={14} fill="currentColor" />
                  </span>
                  Neural Protocol Demo
                </button>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* --- DASHBOARD PREVIEW --- */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative max-w-6xl w-full mx-auto mt-2 mb-[-4rem] z-20 pointer-events-auto px-6 md:px-0"
          >
            {/* Soft Ambient Radiance - ENHANCED */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/20 blur-[150px] rounded-full opacity-60 pointer-events-none -z-10" />

            {/* Main Preview Container - GRADIENT BORDER WRAPPER */}

            {/* STACKED LAYER BEHIND (Immersed Depth) */}
            <div className="absolute top-4 left-4 right-4 bottom-4 bg-[#0F1115]/50 border border-white/5 rounded-[30px] -z-10 scale-[0.98] translate-y-4 blur-sm" />

            {/* Main Preview Container - GRADIENT BORDER WRAPPER */}
            <div className="relative p-[2px] rounded-[30px] bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-2xl mx-auto max-w-6xl">
              <div className="dark relative rounded-[29px] bg-[#0F1115]/90 backdrop-blur-3xl overflow-hidden flex h-[700px] text-left">

                {/* Internal Gloss Highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/10 opacity-50 pointer-events-none z-20" />

                {/* MOCKED SIDEBAR */}
                <div className="w-64 border-r border-[#262626] bg-[#0F1115] hidden md:flex flex-col p-6">
                  <div className="flex items-center gap-2 mb-8 opacity-50">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">M</div>
                    <span className="font-black text-white tracking-tight">MetaLearn</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-white cursor-default">
                      <Activity size={18} className="text-blue-500" />
                      <span className="text-sm font-bold">Dashboard</span>
                    </div>
                    {['Log Session', 'Experiments', 'Profile', 'Insights', 'Progress'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 opacity-60">
                        <div className="w-4 h-4 rounded-sm bg-gray-700" />
                        <span className="text-sm font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-blue-600" />
                    <div>
                      <div className="w-20 h-3 bg-gray-700 rounded mb-1" />
                      <div className="w-12 h-2 bg-gray-800 rounded" />
                    </div>
                  </div>
                </div>

                {/* MOCKED MAIN CONTENT */}
                <div className="flex-1 overflow-hidden relative bg-[#0F1115] text-white flex flex-col">

                  {/* Background Glows */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] pointer-events-none" />

                  {/* Bottom Content Fade Mask */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F1115] via-[#0F1115]/80 to-transparent z-10 pointer-events-none" />

                  {/* Scrollable Content Area */}
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-0">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">System Dashboard</h1>
                        <p className="text-gray-400 text-sm font-medium">
                          Neural Sync: <span className="text-green-500 font-mono uppercase tracking-tighter">Connected</span>
                        </p>
                      </div>
                      <div className="px-6 py-3 rounded-xl bg-blue-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-2 border border-blue-400/20">
                        <Plus size={16} strokeWidth={3} /> Log Session
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { l: 'Total Deep Work', v: '3.5h', i: Clock, c: 'text-indigo-400' },
                        { l: 'Total Sessions', v: '4', i: Brain, c: 'text-purple-400' },
                        { l: 'Neural Streak', v: '0 Days', i: Zap, c: 'text-orange-400' },
                        { l: 'Current Rank', v: 'Bronze', i: Activity, c: 'text-blue-500', r: true }
                      ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between h-24 md:h-32">
                          <div className={`p-1.5 rounded-lg bg-white/5 w-fit ${stat.c}`}><stat.i size={14} /></div>
                          <div>
                            <p className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">{stat.l}</p>
                            <h4 className={`text-lg md:text-xl font-black tracking-tight ${stat.r ? 'text-[#DCC48E]' : 'text-white'}`}>{stat.v}</h4>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Neural Parameters Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[
                        { t: 'Learning Speed', v: '35%', c: 'text-[#eab308]' },
                        { t: 'Retention', v: '50%', c: 'text-[#0ea5e9]' },
                        { t: 'Consistency', v: '14%', c: 'text-[#ec4899]' },
                        { t: 'Error Recovery', v: '75%', c: 'text-[#22c55e]' }
                      ].map((m, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className={`mb-2 ${m.c}`}><Zap size={14} /></div>
                          <div className="text-xl md:text-2xl font-black text-white">{m.v}</div>
                          <div className="text-[8px] md:text-[10px] font-black uppercase tracking-wider text-white mt-1">{m.t}</div>
                          <div className="text-[8px] md:text-[9px] text-gray-500 mt-1">Confidence gain / min</div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Row: AI + Radar */}
                    <div className="flex flex-col md:grid md:grid-cols-4 gap-6 items-stretch h-auto md:h-96 pb-20 md:pb-0">
                      <div className="w-full md:col-span-3 h-auto md:h-full">
                        <VoiceCoachingPlayer coachingData={mockCoaching} />
                      </div>
                      <div className="w-full md:col-span-1 h-80 md:h-full">
                        <LearningVectorDashboard userProfile={mockProfile} showMetrics={false} />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </motion.div>


          {/* FADE OVERLAY TO COVER GAP - Per user request */}
          {/* Hardcoded Dark Mode Background: bg-[#0F1115] */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0F1115] to-transparent pointer-events-none z-30" />
        </section>


        {/* --- FEATURES SECTION --- */}
        <section className="py-32 px-6 relative bg-[#0F1115] z-10" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="font-display text-4xl md:text-6xl font-black mb-6 text-white uppercase tracking-tighter">The Intelligence Layer</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                Synchronized with the latest neural vector architecture.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                title="Learning Vector Analysis"
                desc="Your brain isn't static. Our real-time radar chart visualizes Speed, Retention, and Consistency as they evolve."
                icon={Activity}
                delay={0.1}
              />
              <FeatureCard
                title="AI Voice Coaching"
                desc="Get spoken feedback from a human-like AI coach that sounds empathetic, specific, and surprisingly insightful."
                icon={Mic}
                delay={0.2}
              />
              <FeatureCard
                title="Forgetting Curve Prediction"
                desc="We calculate exactly when you're about to forget a topic and schedule a micro-revision just in time."
                icon={TrendingUp}
                delay={0.3}
              />
              <FeatureCard
                title="Meta-Learning Loop"
                desc="The system A/B tests study strategies on you (e.g. Pomodoro vs Deep Work) to find your biological optimum."
                icon={Brain}
                delay={0.4}
              />
              <FeatureCard
                title="Instant Pattern Recognition"
                desc="Claude 3.5 scans your logs to find hidden correlations like 'You fail calculus more often after 8 PM'."
                icon={Zap}
                delay={0.5}
              />
              <FeatureCard
                title="Optimal Duration Discovery"
                desc="Stop burnout. We identify your precise maximum focus window (e.g., 42 minutes) and alert you to break."
                icon={Clock}
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="font-display border-t border-gray-800 py-16 bg-[#0F1115] text-gray-500 text-[10px] font-black uppercase tracking-widest text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-80">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <img src="/logo.png" alt="MetaLearn Logo" className="w-5 h-5 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
              <p className="text-gray-400">© 2025 MetaLearn. Neural Design by <a href="https://www.linkedin.com/in/aditya-havaldar-205951288/" target="_blank" rel="noopener noreferrer" className="font-black text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer drop-shadow-md hover:drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Aditya Hawaldar</a>.</p>
            </div>
            <div className="flex gap-8 mt-6 md:mt-0">
              <a href="#" className="hover:text-[var(--accent)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--accent)] transition-colors">Terms</a>
              <a href="#" className="hover:text-[var(--accent)] transition-colors">X / Neural</a>
            </div>
          </div>
        </footer>
      </main>
    </div >
  );
}
