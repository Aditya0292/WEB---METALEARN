import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import { useMemo } from 'react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-4 rounded-2xl text-sm shadow-2xl border border-[var(--border)] backdrop-blur-xl bg-[var(--surface)]/80">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">{label}</p>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
                    <span className="text-2xl font-black text-[var(--text-primary)]">
                        {payload[0].value.toFixed(1)}
                    </span>
                    <span className="text-xs font-black text-[var(--text-secondary)] opacity-50">/ 5.0</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function ProgressTimeline({ data, selectedRange = '30d', onRangeChange }) {
    const chartData = data || [];

    const averageScore = useMemo(() => {
        if (!chartData || chartData.length === 0 || chartData[0]['No Data'] === 0) return "0.0";
        const total = chartData.reduce((sum, item) => sum + (item.Overall || 0), 0);
        return (total / chartData.length).toFixed(1);
    }, [chartData]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-10 w-full border border-[var(--border)] relative overflow-hidden group"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[var(--accent)]/10 transition-colors duration-700" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8 relative z-10">
                <div className="flex gap-10">
                    <div>
                        <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <TrendingUp size={12} className="text-[var(--accent)]" /> Neural Trajectory
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-[var(--text-primary)]">{averageScore}</span>
                            <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Avg Stability</span>
                        </div>
                    </div>
                </div>

                {/* Time Range Selector */}
                <div className="flex bg-[var(--surface-highlight)]/10 border border-[var(--border)] rounded-2xl p-1 backdrop-blur-md relative">
                    {['7d', '30d', 'all'].map(range => (
                        <button
                            key={range}
                            onClick={() => onRangeChange && onRangeChange(range)}
                            className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 z-10 ${selectedRange === range
                                ? 'text-[var(--background)]'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {selectedRange === range && (
                                <motion.div
                                    layoutId="timeline-range-pill"
                                    className="absolute inset-0 bg-[var(--accent)] rounded-xl z-[-1] shadow-lg shadow-[var(--accent)]/20"
                                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                />
                            )}
                            {range === 'all' ? 'ALL' : range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full ml-[-20px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.03)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#4b5563"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                        />
                        <YAxis
                            stroke="#4b5563"
                            fontSize={10}
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            dx={-10}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                        />

                        {/* Aesthetic Area Under the line */}
                        <Line
                            type="monotone"
                            dataKey="Overall"
                            stroke="var(--accent)"
                            strokeWidth={4}
                            dot={false}
                            activeDot={{
                                r: 6,
                                fill: 'var(--accent)',
                                stroke: 'var(--background)',
                                strokeWidth: 2,
                                shadowBlur: 10,
                                shadowColor: 'var(--accent)'
                            }}
                            connectNulls
                            animationDuration={2000}
                        />

                        <Area
                            type="monotone"
                            dataKey="Overall"
                            fill="url(#lineGradient)"
                            stroke="none"
                            connectNulls
                            animationDuration={2000}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] opacity-40">
                <Info size={14} />
                Bio-Metric synchronization complete. All units calibrated.
            </div>
        </motion.div>
    );
}
