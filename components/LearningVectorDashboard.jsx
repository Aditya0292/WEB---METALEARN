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

export default function LearningVectorDashboard({ userProfile }) {
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
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Radar Chart Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]"
            >
                <h3 className="text-xl font-bold mb-2 w-full text-left flex items-center gap-2">
                    <Activity className="text-[var(--accent)]" /> Learning Vector
                </h3>
                <p className="text-sm text-[var(--text-secondary)] w-full text-left mb-4">Visual representation of your study habits</p>

                <div className="w-full h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="var(--glass-border)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                            <Radar
                                name="Performance"
                                dataKey="A"
                                stroke="var(--accent)"
                                strokeWidth={3}
                                fill="var(--accent)"
                                fillOpacity={0.3}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="flex-1 grid grid-cols-2 gap-4">
                <MetricCard
                    title="Learning Speed"
                    val={metrics.learning_speed}
                    icon={Zap}
                    color="text-yellow-500"
                    desc="Confidence gain / min"
                />
                <MetricCard
                    title="Retention"
                    val={metrics.retention_score}
                    icon={Brain}
                    color="text-pink-500"
                    desc="Review effectiveness"
                />
                <MetricCard
                    title="Consistency"
                    val={metrics.consistency_score}
                    icon={Calendar}
                    color="text-blue-500"
                    desc="Regularity of sessions"
                />
                <MetricCard
                    title="Error Recovery"
                    val={metrics.error_recovery_rate}
                    icon={Activity}
                    color="text-green-500"
                    desc="Bounce back from errors"
                />
            </div>
        </div>
    );
}

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

function CountingNumber({ value }) {
    const ref = useRef(null);
    const motionValue = useMotionValue(0);
    const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 });
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

    return <span ref={ref} className="text-3xl font-bold text-[var(--accent)]">0%</span>;
}

function MetricCard({ title, val, icon: Icon, color, desc }) {
    const percentage = Math.round(val * 100);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-5 flex flex-col justify-between h-full group"
        >
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-[var(--background)] ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="flex items-center text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                    <ArrowUp size={12} className="mr-1" /> 5%
                </div>
            </div>

            <div className="mt-4">
                <CountingNumber value={percentage} />
                <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{desc}</p>
            </div>
        </motion.div>
    );
}
