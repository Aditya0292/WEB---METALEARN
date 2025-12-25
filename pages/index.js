import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script'; // Import Next.js Script
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useScroll, useSpring as useSpringScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Activity, Mic, TrendingUp, Brain, Zap, Clock, ChevronRight, Play, Plus } from 'lucide-react';
import LearningVectorDashboard from '@/components/LearningVectorDashboard';
import VoiceCoachingPlayer from '@/components/VoiceCoachingPlayer';

// --- Components ---

function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50 transition-all duration-300">
      <div className="w-full h-16 px-6 rounded-full bg-[#15151A]/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold text-lg group-hover:scale-105 transition-transform">
            M
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-gray-200 transition-colors">MetaLearn</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</button>
          <Link href="/dashboard" className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="text-sm font-medium text-gray-400 hover:text-white transition-colors relative group">
      {children}
    </a>
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
      className="group relative p-8 rounded-2xl bg-[#15151A]/60 backdrop-blur-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -inset-px bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a1f2e] to-[#0d1117] border border-white/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all duration-300 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]">
          <Icon size={28} />
        </div>
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300">{desc}</p>
      </div>
    </motion.div>
  )
}


function SidebarItem({ icon: Icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
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
  const x = useTransform(mouseX, [-1000, 1000], [20, -20]);
  const y = useTransform(mouseY, [-1000, 1000], [20, -20]);

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
    <div className="min-h-screen bg-[#0B0B0E] text-white selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      <Head>
        <title>MetaLearn AI | The Future of Learning</title>
      </Head>

      {/* Script for Spline */}
      <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.27/build/spline-viewer.js" strategy="afterInteractive" />

      <Navbar />

      <main>
        {/* --- HERO SECTION --- */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMove}
          className="relative min-h-[140vh] flex flex-col items-center pt-32 px-6 overflow-hidden md:px-0"
        >
          {/* SPLINE BACKGROUND */}
          <motion.div
            style={{ x, y }}
            className="absolute inset-0 z-0 scale-105 -translate-y-[5%]" // Reduced Scale (Zoom out) and adjusted position
          >
            {/* @ts-ignore */}
            <spline-viewer url="https://prod.spline.design/SM-CqQU8sBrOLdOW/scene.splinecode"></spline-viewer>

            {/* Overlay to dim it slightly so text pops - REDUCED OPACITY */}
            <div className="absolute inset-0 bg-[#0B0B0E]/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0E] via-transparent to-[#0B0B0E] pointer-events-none" />
          </motion.div>

          <div className="relative z-10 text-center max-w-5xl mx-auto mt-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-xs font-medium text-cyan-400 mb-8 backdrop-blur-sm pointer-events-auto"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
              AI-Powered Meta-Learning Engine v1.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold tracking-tight mb-8 drop-shadow-2xl"
            >
              Master any skill. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 font-extrabold pb-2">
                In record time.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              The first intelligent coach that analyzes <strong>how</strong> you learn, not just <strong>what</strong> you learn. Optimized for retention, speed, and mastery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pointer-events-auto"
            >
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]">
                Start Learning Now
                <ArrowRight size={20} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold flex items-center justify-center gap-3 transition-colors backdrop-blur-sm group">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Play size={12} fill="currentColor" />
                </span>
                Watch 1-min Demo
              </button>
            </motion.div>
          </div>

          {/* --- DASHBOARD PREVIEW --- */}
          <motion.div
            className="relative max-w-[1240px] w-full mx-auto mt-32 z-20 pointer-events-auto" // Increased Margin Top
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Browser Wrap */}
            <div className="rounded-2xl border border-white/10 bg-[#15151A]/90 backdrop-blur-2xl shadow-[0_0_100px_-20px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col h-[800px]">

              {/* Browser Header */}
              <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2 bg-[#000000]/40 shrink-0">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-1.5 rounded-md bg-[#ffffff]/5 text-[12px] text-gray-500 font-mono flex items-center gap-2 border border-white/5">
                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                    https://metalearn.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Internal Layout */}
              <div className="flex flex-1 overflow-hidden relative">

                {/* Sidebar */}
                <motion.div
                  initial={{ width: 240, opacity: 1 }}
                  animate={{
                    width: isSidebarOpen ? 240 : 0,
                    opacity: isSidebarOpen ? 1 : 0
                  }}
                  className="bg-[#0B0B0E] border-r border-white/5 flex flex-col overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">M</div>
                      <span className="font-bold text-white tracking-tight">MetaLearn AI</span>
                    </div>

                    <div className="space-y-2">
                      <SidebarItem icon={Activity} label="Dashboard" active />
                      <SidebarItem icon={Plus} label="Log Session" />
                      <SidebarItem icon={Brain} label="Insights" />
                      <SidebarItem icon={TrendingUp} label="Progress" />
                    </div>
                  </div>

                  <div className="mt-auto p-6 border-t border-white/5">
                    <SidebarItem icon={Activity} label="Settings" /> {/* Using Activity as placeholder for Settings if Cog not available */}
                  </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#0B0B0E] p-8 relative">

                  {/* Toggle Button (Absolute to not shift layout unexpectedly, or in a header) */}
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-8 left-4 z-10 p-2 rounded-lg bg-cyan-950/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-900/50 transition-colors shadow-lg shadow-cyan-900/20"
                  >
                    <ChevronRight size={20} className={`transform transition-transform ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  <div className={`transition-all duration-300 ${isSidebarOpen ? 'pl-4' : 'pl-12'}`}>
                    {/* Header Row */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-8">
                      <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Welcome back, Scholar</h1>
                        <p className="text-gray-500 text-sm mt-1">Your neural pathways are strengthening.</p>
                      </div>
                      <div className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer hover:bg-cyan-500 transition-colors">
                        <Plus size={16} /> Log Session
                      </div>
                    </div>

                    {/* Player Row */}
                    <div className="mb-8">
                      <VoiceCoachingPlayer coachingData={mockCoaching} />
                    </div>

                    {/* Charts Row */}
                    <LearningVectorDashboard userProfile={mockProfile} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>


        {/* --- FEATURES SECTION --- */}
        <section className="py-32 px-6 relative bg-[#0B0B0E] z-10" id="features">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">The Intelligence Layer</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                We replaced traditional LMS logic with a dynamic learning vector engine powered by Claude 3.5.
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
        <footer className="border-t border-white/5 py-12 bg-[#050507] text-gray-500 text-sm text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 MetaLearn AI. Designed and Developed by <span className="font-bold text-gray-300">Aditya Hawaldar</span>.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
