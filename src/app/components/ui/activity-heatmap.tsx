import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";

interface ActivityHeatmapProps {
    isEmpty?: boolean;
}

interface MonthlyActivity {
    label: string;  // "Jan", "Feb", etc.
    count: number;  // total activities in that month
}

export function ActivityHeatmap({ isEmpty = false }: ActivityHeatmapProps) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    const [yearData, setYearData] = useState<MonthlyActivity[]>([]);
    const [totalActivities, setTotalActivities] = useState(0);
    const [loading, setLoading] = useState(!isEmpty);

    useEffect(() => {
        if (isEmpty) {
            setLoading(false);
            return;
        }
        const fetchActivity = async () => {
            try {
                const res = await apiRequest<{ period: string; data: MonthlyActivity[]; total: number }>(
                    '/gamification/activity?period=year'
                );
                setYearData(res.data || []);
                setTotalActivities(res.total || 0);
            } catch {
                // On error, leave as empty (all-zero) — no random fallback
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, [isEmpty]);

    /**
     * Build a stable per-day activity level from monthly totals.
     * The backend returns 12 monthly counts. We distribute activity
     * evenly across each month's days, then scale 0-4.
     */
    const buildDayLevels = (): number[] => {
        if (isEmpty || yearData.length === 0) return Array(365).fill(0);

        // Max monthly count for scaling
        const maxMonthCount = Math.max(...yearData.map(m => m.count), 1);

        const levels: number[] = [];
        for (let m = 0; m < 12; m++) {
            const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
            const monthActivity = yearData[m]?.count ?? 0;
            // Activity per day in this month (can be fractional)
            const activityPerDay = monthActivity / daysInMonth;
            // Level 0-4 relative to the busiest month
            const rawLevel = (activityPerDay / (maxMonthCount / 30)) * 4;
            const level = Math.min(4, Math.round(rawLevel));
            for (let d = 0; d < daysInMonth; d++) {
                levels.push(monthActivity > 0 ? Math.max(1, level) : 0);
            }
        }
        // Pad or trim to exactly 365 cells
        while (levels.length < 365) levels.push(0);
        return levels.slice(0, 365);
    };

    const dayLevels = buildDayLevels();

    // Derived stats
    const totalHours = Math.round(totalActivities * 0.5 * 10) / 10; // estimate 30 min per activity
    const dayOfYear = Math.ceil((Date.now() - new Date(currentYear, 0, 1).getTime()) / 86_400_000);
    const avgPerDay = dayOfYear > 0 ? (totalActivities / dayOfYear).toFixed(1) : "0";

    const colors = [
        "bg-secondary",                         // 0 — no activity
        "bg-green-200 dark:bg-green-900/40",    // 1 — low
        "bg-green-300 dark:bg-green-800/60",    // 2
        "bg-green-400 dark:bg-green-600",       // 3
        "bg-green-500 dark:bg-green-500",       // 4 — highest
    ];

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-bold text-foreground">Contributions</h2>
                {!isEmpty && !loading && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <span className="size-2 bg-secondary rounded-sm"></span>
                            <span>Less</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="size-2 bg-green-500 rounded-sm"></span>
                            <span>More</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground/70">{currentYear}</span>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="h-32 flex items-center justify-center">
                    <div className="animate-pulse text-muted-foreground text-sm">Loading activity...</div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Heatmap Grid */}
                    <div className="flex-1 overflow-x-auto pb-4">
                        <div className="min-w-[700px]">
                            <div className="flex justify-between mb-2 text-xs text-muted-foreground px-1">
                                {months.map(m => <span key={m}>{m}</span>)}
                            </div>
                            <div className="grid grid-rows-7 grid-flow-col gap-1">
                                {dayLevels.map((level, i) => (
                                    <div
                                        key={i}
                                        className={`size-3 rounded-sm ${colors[level]} ${!isEmpty && level > 0 ? "hover:ring-1 hover:ring-foreground/50" : ""} transition-all`}
                                        title={isEmpty || level === 0 ? "No activity" : `Activity level: ${level}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Side Panel */}
                    <div className="flex flex-row md:flex-col gap-6 md:min-w-[200px] md:border-l border-border md:pl-6">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Activities</p>
                            <p className="text-2xl font-bold text-foreground">
                                {isEmpty ? "0" : totalActivities.toLocaleString()}{" "}
                                <span className="text-sm font-normal text-muted-foreground">events</span>
                            </p>
                            <div className="h-10 mt-2 flex items-end gap-1">
                                {(yearData.length > 0 ? yearData : Array(7).fill({ count: 0 })).slice(0, 7).map((m, i) => {
                                    const maxVal = Math.max(...(yearData.length > 0 ? yearData.map(x => x.count) : [1]), 1);
                                    const h = isEmpty ? 4 : Math.max(4, Math.round((m.count / maxVal) * 100));
                                    return <div key={i} className="w-2 bg-green-400 dark:bg-green-600 rounded-t-sm" style={{ height: `${h}%` }} />;
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Estimated Hours</p>
                            <p className="text-2xl font-bold text-foreground">
                                {isEmpty ? "0" : totalHours}{" "}
                                <span className="text-sm font-normal text-muted-foreground">Hours</span>
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Average Per Day</p>
                            <p className="text-2xl font-bold text-foreground">
                                {isEmpty ? "0" : avgPerDay}{" "}
                                <span className="text-sm font-normal text-muted-foreground">activities/day</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
