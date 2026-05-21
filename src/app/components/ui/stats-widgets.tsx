import { motion } from "framer-motion";
import { Trophy, Star, Award, ArrowUp, ArrowDown } from "lucide-react";

// --- Premium Stat Card ---
export function StatCard({ title, value, change, icon, trend = "up", delay = 0 }: { title: string; value: string | number; change: string; icon: React.ReactNode; trend?: "up" | "down" | "neutral"; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="relative overflow-hidden bg-white/50 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-full"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                {icon}
            </div>

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="size-12 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-primary ring-1 ring-primary/20">
                    {icon}
                </div>
            </div>

            <div className="relative z-10 flex items-end justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 leading-tight">{title}</h3>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
                </div>
                {change && (
                    <div className={`flex shrink-0 whitespace-nowrap items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${trend === "up"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : trend === "down"
                            ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}>
                        {trend === "up" && <ArrowUp className="size-3" />}
                        {trend === "down" && <ArrowDown className="size-3" />}
                        {change}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// --- Premium Circular Progress ---
export function CircularProgress({ value, color = "#3b82f6", size = 80 }: { value: number; color?: string; size?: number }) {
    const radius = size * 0.4;
    const circumference = 2 * Math.PI * radius;
    const progress = value / 100;
    const dashoffset = circumference * (1 - progress);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700" />

            <svg className="size-full -rotate-90 transform transition-transform duration-700 group-hover:scale-105" viewBox={`0 0 ${size} ${size}`}>
                {/* Background Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted/20"
                />
                {/* Progress Ring */}
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    className="drop-shadow-sm"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-foreground">{value}%</span>
            </div>
        </div>
    );
}

// --- Premium Sparkline ---
export function TrendSparkline({ color = "#8b5cf6", data = [30, 45, 35, 60, 50, 75, 65] }: { color?: string, data?: number[] }) {
    const width = 100;
    const height = 50;
    const padding = 5;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Map data to SVG coordinates
    const coords = data.map((d, i) => ({
        x: data.length === 1 ? width / 2 : (i / (data.length - 1)) * width,
        y: height - padding - ((d - min) / range) * (height - padding * 2),
    }));

    // Build a smooth polyline path using quadratic bezier midpoints
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
        const mx = (coords[i - 1].x + coords[i].x) / 2;
        const my = (coords[i - 1].y + coords[i].y) / 2;
        d += ` Q ${coords[i - 1].x} ${coords[i - 1].y} ${mx} ${my}`;
    }
    // Finish at last point
    d += ` L ${coords[coords.length - 1].x} ${coords[coords.length - 1].y}`;

    const fillD = `${d} V ${height} H 0 Z`;

    return (
        <div className="h-16 w-full relative overflow-hidden rounded-xl opacity-80 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full p-1" viewBox="0 0 100 50" preserveAspectRatio="none">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id={`grad-${color}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path
                    d={fillD}
                    fill={`url(#grad-${color})`}
                />
                <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="drop-shadow-md"
                    filter="url(#glow)"
                />
            </svg>
        </div>
    );
}

// --- Premium Badge Stack ---
export function BadgeStack() {
    return (
        <div className="flex items-center -space-x-4 hover:space-x-1 transition-all duration-300">
            {[
                { icon: Trophy, from: "from-amber-300", to: "to-orange-500", shadow: "shadow-orange-500/20" },
                { icon: Star, from: "from-blue-300", to: "to-indigo-500", shadow: "shadow-indigo-500/20" },
                { icon: Award, from: "from-emerald-300", to: "to-green-500", shadow: "shadow-green-500/20" }
            ].map((badge, i) => (
                <div key={i} className={`relative size-12 rounded-2xl bg-gradient-to-br ${badge.from} ${badge.to} border-4 border-background flex items-center justify-center shadow-lg ${badge.shadow} transform hover:-translate-y-2 hover:rotate-6 transition-all duration-300 z-${30 - i * 10}`}>
                    <badge.icon className="size-5 text-white drop-shadow-md" />
                </div>
            ))}
        </div>
    );
}

// --- Premium Next Session ---
export function NextSessionWidget() {
    return (
        <div className="flex flex-col items-center justify-center p-3 bg-emerald-50/80 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Up Next</span>
            </div>
            <span className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Tomorrow</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">10:00 AM</span>
        </div>
    )
}
