import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Zap, Brain, Calendar, Activity, ArrowUp, ArrowRight } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-3 rounded-lg text-sm shadow-xl">
                <p className="font-bold text-[var(--accent)]">{label}</p>
                <p className="text-[var(--text-primary)]">Score: {Math.round(payload[0].value * 100)}%</p>
            </div>
        );
    }
    return null;
};

export default function LearningVectorDashboard({ userProfile, showMetrics = true }) {
    // Default data if no userProfile provided
    const metrics = userProfile || {
        learning_speed: 0.65,
        retention_score: 0.82,
        consistency_score: 0.55,
        error_recovery_rate: 0.70
    };

    const chartData = [
        { subject: 'Speed', A: metrics.learning_speed, fullMark: 1 },
        { subject: 'Retention', A: metrics.retention_score, fullMark: 1 },
        { subject: 'Consistency', A: metrics.consistency_score, fullMark: 1 },
        { subject: 'Recovery', A: metrics.error_recovery_rate, fullMark: 1 },
    ];

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Radar Chart Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex flex-col items-center justify-center min-h-[360px] h-full border-[var(--border)] relative overflow-hidden group"
            >
                {/* Subtle Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--accent)]/5 blur-[60px] -z-10 group-hover:bg-[var(--accent)]/15 transition-colors duration-700" />

                <h3 className="text-sm font-black mb-1 w-full text-left flex items-center gap-2 uppercase tracking-[0.2em] text-[var(--text-primary)]">
                    <Activity className="text-[var(--accent)]" size={18} /> Learning Vector
                </h3>
                <p className="text-[10px] font-black text-[var(--text-secondary)] w-full text-left mb-6 uppercase tracking-[0.2em] opacity-60">Cognitive Blueprint</p>

                <div className="w-full h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid stroke="var(--border)" strokeWidth={1} />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 1]}
                                tick={false}
                                axisLine={false}
                            />
                            <Radar
                                name="Performance"
                                dataKey="A"
                                stroke="var(--accent)"
                                strokeWidth={2}
                                fill="var(--accent)"
                                fillOpacity={0.6}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Metrics Grid - ONLY if showMetrics is true */}
            {
                showMetrics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        <MetricCard
                            title="Learning Speed"
                            val={metrics.learning_speed}
                            icon={Zap}
                            color="text-[var(--speed)]"
                            desc="Confidence gain / min"
                        />
                        <MetricCard
                            title="Retention"
                            val={metrics.retention_score}
                            icon={Brain}
                            color="text-[var(--retention)]"
                            desc="Review effectiveness"
                        />
                        <MetricCard
                            title="Consistency"
                            val={metrics.consistency_score}
                            icon={Calendar}
                            color="text-[var(--consistency)]"
                            desc="Regularity of sessions"
                        />
                        <MetricCard
                            title="Error Recovery"
                            val={metrics.error_recovery_rate}
                            icon={Activity}
                            color="text-[var(--recovery)]"
                            desc="Bounce back from errors"
                        />
                    </div>
                )
            }
        </div>
    );
}

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

export function CountingNumber({ value }) {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 30, stiffness: 200 }); // Snappier
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            motionValue.set(value);
        }
    }, [motionValue, isInView, value]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = Math.round(latest) + "%";
            }
        });
    }, [springValue]);

    return <span ref={ref} className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">0%</span>;
}

export function MetricCard({ title, val, icon: Icon, color, desc }) {
    const percentage = Math.round(val * 100);

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card p-5 flex flex-col justify-between h-full border-[var(--border)] group relative overflow-hidden shadow-lg hover:shadow-2xl transition-all"
        >
            <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg bg-[var(--surface-highlight)]/10 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                </div>
            </div>

            <div className="mt-4">
                <CountingNumber value={percentage} />
                <p className="font-black text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors uppercase tracking-widest mt-1">{title}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-tight font-medium opacity-70">{desc}</p>
            </div>
        </motion.div>
    );
}
