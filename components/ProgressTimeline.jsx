import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-panel p-3 rounded-lg text-sm shadow-xl border border-[var(--glass-border)]">
                <p className="font-bold mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span style={{ color: entry.color }} className="font-medium">
                            {entry.name}: {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ProgressTimeline({ data, selectedRange = '30d', onRangeChange }) {
    // Chart Data
    const chartData = data || [];

    // Extract dynamic subjects (keys that are not 'date' or internal fields)
    const allKeys = chartData.reduce((keys, entry) => {
        Object.keys(entry).forEach(k => {
            if (k !== 'date' && k !== 'ReviewPoint' && k !== 'No Data' && k !== 'date_formatted' && k !== '_count' && k !== '_totalConf' && k !== 'Overall') {
                keys.add(k);
            }
        });
        return keys;
    }, new Set());

    const subjects = Array.from(allKeys);

    // Color Palette
    const colors = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 w-full"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp className="text-[var(--accent)]" /> Your Learning Journey
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">Confidence vs Time with Forgetting Curve Prediction</p>
                </div>

                {/* Time Range Selector */}
                <div className="flex bg-[var(--background)] rounded-lg p-1">
                    {['7d', '30d', 'all'].map(range => (
                        <button
                            key={range}
                            onClick={() => onRangeChange && onRangeChange(range)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedRange === range
                                ? 'bg-[var(--surface)] text-white shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-secondary)"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Primary Trend Line (Overall) */}
                        <Line
                            type="monotone"
                            dataKey="Overall"
                            stroke="#ffffff"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#ffffff' }}
                            activeDot={{ r: 8 }}
                            connectNulls
                            name="Overall Trend"
                            animationDuration={1500}
                        />

                        {subjects.map((subject, index) => (
                            <Line
                                key={subject}
                                type="monotone"
                                dataKey={subject}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                strokeDasharray="5 5" // Dashed line for individual topics
                                dot={{ r: 3 }}
                                activeDot={{ r: 6 }}
                                animationDuration={1500}
                                connectNulls
                            />
                        ))}

                        {/* Fallback Reference Line if no data */}
                        {subjects.length === 0 && (
                            <ReferenceLine y={2.5} stroke="var(--text-secondary)" strokeDasharray="3 3" label="No Data Yet" />
                        )}

                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
