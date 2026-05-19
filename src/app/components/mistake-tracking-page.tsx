import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    AlertTriangle, CheckCircle, Clock, Zap,
    ArrowRight, TrendingUp, AlertCircle, PlayCircle, BarChart2, PieChart as PieChartIcon, Activity, Sparkles, Plus, Undo
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";
import { getMistakeAnalytics, resolveMistake, reopenMistake, logManualMistake, MistakeAnalytics } from "../lib/learningApi";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Skeleton } from "./ui/skeleton";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from "next-themes";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MistakeTrackingPage() {
    const { theme, resolvedTheme } = useTheme();
    const isDarkMode = theme === 'dark' || resolvedTheme === 'dark';
    
    const [analytics, setAnalytics] = useState<MistakeAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
    
    // New UX states
    const [reopeningIds, setReopeningIds] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [manualForm, setManualForm] = useState({ title: '', description: '', skillTag: '', category: 'conceptual', severity: 3 });
    const [submittingManual, setSubmittingManual] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const data = await getMistakeAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleResolve = async (id: string) => {
        setResolvingIds(prev => new Set(prev).add(id));
        try {
            await resolveMistake(id);
            await fetchAnalytics();
        } catch (error) {
            console.error(error);
        } finally {
            setResolvingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const handleReopen = async (id: string) => {
        setReopeningIds(prev => new Set(prev).add(id));
        try {
            await reopenMistake(id);
            await fetchAnalytics();
        } catch (error) {
            console.error(error);
        } finally {
            setReopeningIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingManual(true);
        try {
            await logManualMistake(manualForm);
            setIsManualDialogOpen(false);
            setManualForm({ title: '', description: '', skillTag: '', category: 'conceptual', severity: 3 });
            await fetchAnalytics();
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingManual(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-muted/20 p-4 md:p-8 space-y-8">
                <div className="mx-auto max-w-7xl animate-pulse space-y-8">
                    <div className="space-y-4 pt-4">
                        <Skeleton className="h-10 w-[300px]" />
                        <Skeleton className="h-4 w-[500px] max-w-full" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-[400px] md:col-span-2 rounded-xl" />
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 mt-8">
                        <Skeleton className="h-[300px] rounded-xl" />
                        <Skeleton className="h-[300px] rounded-xl" />
                        <Skeleton className="h-[300px] rounded-xl" />
                        <Skeleton className="h-[300px] rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return <div className="min-h-screen bg-muted/40 p-4 md:p-8 flex items-center justify-center">Failed to load analytics.</div>;
    }

    const { 
        analysis, recommendations, 
        skillDistribution, mistakeTrend, categoryDistribution, resolutionStats 
    } = analytics;
    
    const { weakSkillsSorted, severityPointsBySkill, mistakeRecords } = analysis;

    // Transform into pattern array for UI
    const totalSeverity = Object.values(severityPointsBySkill).reduce((a, b) => a + b, 0) || 1;
    const strugglePatterns = weakSkillsSorted.slice(0, 4).map(skill => {
        const severityScore = severityPointsBySkill[skill];
        return {
            topic: skill,
            errorRate: Math.round((severityScore / totalSeverity) * 100)
        };
    });

    // Custom Insight Logic
    const mostCommonSkill = skillDistribution && skillDistribution.length > 0 ? skillDistribution[0].skill : "None";
    const unresolvedCount = resolutionStats?.find(s => s.status === 'open')?.count || 0;
    
    // Calculate trend percentage (comparing last two weeks if available)
    let trendMessage = "Not enough data to calculate trend.";
    let trendIcon = <Activity className="size-4 mt-0.5 text-blue-500 flex-shrink-0" />;
    
    if (mistakeTrend && mistakeTrend.length >= 2) {
        const lastWeek = mistakeTrend[mistakeTrend.length - 2].count;
        const thisWeek = mistakeTrend[mistakeTrend.length - 1].count;
        if (lastWeek > 0) {
            const diff = ((thisWeek - lastWeek) / lastWeek) * 100;
            if (diff < 0) {
                trendMessage = `Your mistakes decreased by ${Math.abs(Math.round(diff))}% this week!`;
                trendIcon = <TrendingUp className="size-4 mt-0.5 text-green-500 flex-shrink-0" />;
            } else if (diff > 0) {
                trendMessage = `Your mistakes increased by ${Math.round(diff)}% this week.`;
                trendIcon = <AlertTriangle className="size-4 mt-0.5 text-red-500 flex-shrink-0" />;
            } else {
                trendMessage = "Your mistake rate is stable.";
            }
        }
    } else if (mistakeTrend && mistakeTrend.length === 1) {
        trendMessage = "Keep logging mistakes to unlock trend data.";
    }

    const axisTextColor = isDarkMode ? "#a1a1aa" : "#71717a";

    const customTooltipStyle = {
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        color: isDarkMode ? '#f8fafc' : '#0f172a'
    };

    const legendFormatter = (value: string) => (
        <span style={{ color: isDarkMode ? '#e2e8f0' : '#334155' }}>{value}</span>
    );

    const totalMistakesForResolution = resolutionStats ? resolutionStats.reduce((acc, curr) => acc + curr.count, 0) : 0;
    const resolvedMistakesCount = resolutionStats ? (resolutionStats.find(s => s.status === 'resolved')?.count || 0) : 0;
    const resolvedPercentage = totalMistakesForResolution > 0 ? Math.round((resolvedMistakesCount / totalMistakesForResolution) * 100) : 0;

    const renderCategoryLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        if (percent < 0.05) return null; // Don't show labels for tiny slices
        return (
            <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20 relative">
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8 relative z-10">

                {/* Header */}
                <div className="flex flex-col gap-2 pt-4">
                    <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-sm">Intelligence Engine</Badge>
                        <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 shadow-sm rounded-full"><Plus className="size-4" /> Log Mistake</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Log a New Mistake</DialogTitle>
                                    <DialogDescription>Manually track an error to update your analytics engine.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Mistake Title</Label>
                                        <Input id="title" required value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} placeholder="e.g., Forgot dependency array" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Skill Tag</Label>
                                            <Input required value={manualForm.skillTag} onChange={e => setManualForm({...manualForm, skillTag: e.target.value})} placeholder="e.g., React" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Severity (1-5)</Label>
                                            <Input type="number" min="1" max="5" required value={manualForm.severity} onChange={e => setManualForm({...manualForm, severity: parseInt(e.target.value)})} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select value={manualForm.category} onValueChange={v => setManualForm({...manualForm, category: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="conceptual">Conceptual</SelectItem>
                                                <SelectItem value="syntax">Syntax</SelectItem>
                                                <SelectItem value="logic">Logic</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={submittingManual}>
                                            {submittingManual ? <Activity className="size-4 mr-2 animate-spin" /> : "Save Mistake"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Mistake Tracking & Correction
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">Analyze your learning patterns with AI-driven insights and turn knowledge gaps into proven mastery.</p>
                </div>

                {/* Top Section: Insights & Pattern Recognition Dashboard */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Visual Analytics */}
                    <Card className="md:col-span-2 shadow-lg shadow-black/5 border-border/40 bg-card/60 backdrop-blur-xl hover:shadow-xl hover:bg-card/80 transition-all duration-500">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <BarChart2 className="h-5 w-5 text-primary" />
                                        Intelligent Pattern Recognition
                                    </CardTitle>
                                    <CardDescription>Algorithms proactively monitoring your weak areas based on assessment tracking.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    LIVE
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-7 mt-2">
                            {strugglePatterns.length === 0 ? <div className="text-muted-foreground flex items-center gap-2"><CheckCircle className="size-5 text-green-500"/> No mistakes logged yet. Flawless execution!</div> :
                                strugglePatterns.map((pattern, index) => (
                                    <div key={index} className="space-y-2 group">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-bold text-base group-hover:text-primary transition-colors">{pattern.topic}</span>
                                            <Badge variant="secondary" className="font-mono bg-background/50 backdrop-blur-sm border-border/50">
                                                {pattern.errorRate}% Weakness
                                            </Badge>
                                        </div>
                                        <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
                                                    pattern.errorRate > 40 ? "bg-gradient-to-r from-red-500 to-rose-400" :
                                                        pattern.errorRate > 20 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                                                )}
                                                style={{ width: `${Math.max(pattern.errorRate, 5)}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>

                    {/* Dynamic Insight  */}
                    <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-background border-indigo-500/20 shadow-lg shadow-indigo-500/5 backdrop-blur-xl flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-1 group">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="h-5 w-5" />
                                AI Insight
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1">
                            <div className="text-center py-2 transform group-hover:scale-105 transition-transform duration-500">
                                {weakSkillsSorted.length > 0 ? (
                                    <>
                                        <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500 block pb-1">{weakSkillsSorted[0]}</span>
                                        <p className="text-lg font-bold mt-1 text-foreground">Primary Weakness detected</p>
                                        <p className="text-sm text-muted-foreground mt-2 px-2 leading-relaxed">
                                            We detected a concentrated pattern of errors. Focus your active learning here to drastically improve.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-400 block pb-1">All Clear</span>
                                        <p className="text-sm text-muted-foreground mt-2 px-4 leading-relaxed">Keep crushing those quizzes, your accuracy is remarkable!</p>
                                    </>
                                )}
                            </div>
                            
                            <div className="bg-card/50 backdrop-blur-md rounded-xl p-4 space-y-3.5 mt-4 text-sm border border-border/40 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                                <div className="flex gap-3 items-start text-muted-foreground relative">
                                    <Zap className="size-4 mt-0.5 text-amber-500 flex-shrink-0" />
                                    <span className="leading-snug">Most common skill failure: <strong className="text-foreground">{mostCommonSkill}</strong>.</span>
                                </div>
                                <div className="flex gap-3 items-start text-muted-foreground relative">
                                    {trendIcon}
                                    <span className="leading-snug">{trendMessage}</span>
                                </div>
                                <div className="flex gap-3 items-start text-muted-foreground relative">
                                    <AlertCircle className="size-4 mt-0.5 text-rose-500 flex-shrink-0" />
                                    <span className="leading-snug">Currently <strong className="text-foreground">{unresolvedCount}</strong> unresolved mistake{unresolvedCount !== 1 && 's'}.</span>
                                </div>
                            </div>
                        </CardContent>
                        {recommendations.length > 0 && (
                            <CardFooter className="pb-6">
                                <Link to={`/dashboard/courses/${recommendations[0]._id}`} className="w-full">
                                    <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg transition-all" variant="default">
                                        <PlayCircle className="h-4 w-4" />
                                        Launch Recommended Training
                                    </Button>
                                </Link>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* GRAPHICAL ANALYTICS SECTION */}
                <div className="space-y-6 pt-8 relative z-10 w-full overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <PieChartIcon className="h-6 w-6 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Mistake Analytics Data</h2>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Mistakes by Skill */}
                        <Card className="shadow-md border-border/40 bg-card/60 backdrop-blur-md hover:bg-card/80 hover:shadow-lg transition-all">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold">Mistakes by Skill</CardTitle>
                                <CardDescription>Total raw error counts</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px] w-[100%]">
                                {skillDistribution && skillDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={skillDistribution} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                            <XAxis dataKey="skill" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: axisTextColor }} />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisTextColor }} />
                                            <RechartsTooltip cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}} contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                                            <Bar dataKey="count" fill="url(#colorSkill)" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                            <defs>
                                                <linearGradient id="colorSkill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border/50">No skill data available</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mistake Trend */}
                        <Card className="shadow-md border-border/40 bg-card/60 backdrop-blur-md hover:bg-card/80 hover:shadow-lg transition-all">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold">Mistake Trend</CardTitle>
                                <CardDescription>Weekly incidence history</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px]">
                                {mistakeTrend && mistakeTrend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={mistakeTrend} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
                                            <XAxis dataKey="week" axisLine={false} tickLine={false} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: axisTextColor }} />
                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisTextColor }} />
                                            <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                                            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }} activeDot={{ r: 8, strokeWidth: 0 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border/50">No trend data available</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Category Distribution */}
                        <Card className="shadow-md border-border/40 bg-card/60 backdrop-blur-md hover:bg-card/80 hover:shadow-lg transition-all">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-lg font-bold">Category Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[280px]">
                                {categoryDistribution && categoryDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryDistribution}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={0}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="count"
                                                nameKey="category"
                                                stroke="none"
                                                labelLine={false}
                                                label={renderCategoryLabel}
                                            >
                                                {categoryDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 'bold' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" className="capitalize text-sm font-medium" formatter={legendFormatter} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border/50">No category data available</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resolution Stats */}
                        <Card className="shadow-md border-border/40 bg-card/60 backdrop-blur-md hover:bg-card/80 hover:shadow-lg transition-all">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-lg font-bold">Resolution Progress</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[280px]">
                                {resolutionStats && resolutionStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="font-bold text-3xl" fill={isDarkMode ? '#f8fafc' : '#0f172a'}>
                                                {resolvedPercentage}%
                                            </text>
                                            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-xs font-medium" fill={isDarkMode ? '#94a3b8' : '#64748b'}>
                                                Resolved
                                            </text>
                                            <Pie
                                                data={resolutionStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="count"
                                                nameKey="status"
                                                stroke="none"
                                            >
                                                {resolutionStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.status === 'resolved' ? '#10b981' : '#ef4444'} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 'bold', textTransform: 'capitalize' }} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" className="capitalize text-sm font-medium" formatter={legendFormatter} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed border-border/50">No resolution data available</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>


                {/* Middle Section: Active Mistakes Record */}
                <div className="space-y-6 pt-8 relative z-10 w-full">
                    
                    {/* Derived filtered records */}
                    {(() => {
                        const filteredRecords = mistakeRecords.filter(m => selectedCategory === 'all' || m.category === selectedCategory);
                        return (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-lg">
                                            <AlertCircle className="h-6 w-6 text-rose-500" />
                                        </div>
                                        <h2 className="text-2xl font-bold tracking-tight">Active Warning Log</h2>
                                    </div>
                                    <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-4">
                                        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
                                            <TabsList className="grid w-full grid-cols-4 sm:flex shadow-sm rounded-full">
                                                <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                                                <TabsTrigger value="conceptual" className="rounded-full">Concept</TabsTrigger>
                                                <TabsTrigger value="syntax" className="rounded-full">Syntax</TabsTrigger>
                                                <TabsTrigger value="logic" className="rounded-full">Logic</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                        <Badge variant="outline" className="text-sm px-3 py-1.5 font-medium whitespace-nowrap bg-background shadow-sm border-border/60">
                                            {filteredRecords.filter(m => m.status === 'open').length} Issues Open
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                                    {filteredRecords.length === 0 && (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm border border-dashed border-border/60 rounded-xl text-muted-foreground">
                                <CheckCircle className="size-12 mb-3 text-green-500/50" />
                                <p className="text-lg font-medium text-foreground">You have zero open mistakes.</p>
                                <p className="text-sm">Great job keeping your record clean!</p>
                            </div>
                        )}
                        {filteredRecords.map((mis) => (
                            <Card key={mis._id} className={cn(
                                "relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full bg-card/80 backdrop-blur-md border-t-4",
                                mis.severity >= 4 ? 'border-t-rose-500 hover:shadow-rose-500/10' : 
                                mis.severity >= 3 ? 'border-t-amber-500 hover:shadow-amber-500/10' : 
                                'border-t-blue-500 hover:shadow-blue-500/10'
                            )}>
                                {/* Gradient Background Hint */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10 pointer-events-none transition-opacity group-hover:opacity-20",
                                    mis.severity >= 4 ? 'bg-rose-500' : 
                                    mis.severity >= 3 ? 'bg-amber-500' : 
                                    'bg-blue-500'
                                )} />
                                
                                <CardHeader className="pb-3 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className={cn(
                                            "p-2.5 rounded-xl shadow-sm", 
                                            mis.severity >= 4 ? "text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20" : 
                                            mis.severity >= 3 ? "text-amber-600 bg-amber-50 border border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20" : 
                                            "text-blue-600 bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20"
                                        )}>
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <Badge variant={mis.severity >= 4 ? 'destructive' : 'secondary'} className={cn(
                                                "shadow-sm",
                                                mis.severity < 4 && "bg-secondary/50 backdrop-blur-md border-border/50"
                                            )}>
                                                Severity {mis.severity}/5
                                            </Badge>
                                            {mis.count > 1 && (
                                                <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur font-bold border-rose-200 text-rose-600 dark:border-rose-500/30 dark:text-rose-400">
                                                    Failed {mis.count}x
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 relative z-10">
                                    <h3 className="font-bold text-lg leading-tight mb-2 tracking-tight text-foreground">{mis.title}</h3>
                                    <p className="text-sm text-muted-foreground/90 mb-5 leading-relaxed">{mis.description}</p>
                                    <div className="flex flex-wrap gap-2 mt-auto">
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-border/60 hover:bg-background transition-colors">{mis.skillTag}</Badge>
                                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-border/60 hover:bg-background transition-colors capitalize">{mis.category}</Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 pb-5 relative z-10 border-t border-border/50 mt-4 bg-muted/10">
                                    {mis.status === 'open' ? (
                                        <Button 
                                            onClick={() => handleResolve(mis._id)} 
                                            disabled={resolvingIds.has(mis._id)}
                                            variant="outline" 
                                            className="w-full font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:border-emerald-500/30 transition-all duration-300"
                                        >
                                            {resolvingIds.has(mis._id) ? (
                                                <div className="flex items-center"><Activity className="size-4 mr-2 animate-spin" />Processing...</div>
                                            ) : (
                                                <div className="flex items-center"><CheckCircle className="size-4 mr-2" />Mark as Researched & Resolved</div>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleReopen(mis._id)} 
                                            disabled={reopeningIds.has(mis._id)}
                                            variant="outline" 
                                            className="w-full font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:border-rose-500/30 transition-all duration-300"
                                        >
                                            {reopeningIds.has(mis._id) ? (
                                                <div className="flex items-center"><Activity className="size-4 mr-2 animate-spin" />Processing...</div>
                                            ) : (
                                                <div className="flex items-center"><Undo className="size-4 mr-2" />Reopen Mistake</div>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                            </>
                        );
                    })()}
                </div>

                {/* Bottom Section: AI Curated Recommendations */}
                {recommendations.length > 0 && (
                    <div className="space-y-6 pt-10 mt-6 border-t border-border/40 relative z-10">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Zap className="h-6 w-6 text-amber-500" />
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight">AI Targeted Interventions</h2>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-2xl mt-1">
                                We dynamically pulled these exact courses from the library because they directly target your weakest identified skills: <span className="font-bold text-foreground bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{weakSkillsSorted.slice(0, 3).join(', ')}</span>
                            </p>
                        </div>

                        <div className="grid gap-5 md:grid-cols-3 mt-4">
                            {recommendations.map(course => (
                                <Card key={course._id} className="shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 bg-card/80 backdrop-blur-md border-border/50 overflow-hidden group">
                                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                                    <CardHeader className="pb-3 pt-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-md">{course.skillTag}</Badge>
                                            <Badge variant="secondary" className="text-xs bg-secondary/50 backdrop-blur-md">{course.difficulty}</Badge>
                                        </div>
                                        <CardTitle className="text-base font-bold leading-tight group-hover:text-primary transition-colors">{course.title}</CardTitle>
                                    </CardHeader>
                                    <CardFooter className="pb-5">
                                        <Link to={`/dashboard/courses/${course._id}`} className="w-full">
                                            <Button variant="secondary" size="sm" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm relative overflow-hidden">
                                                <span className="relative z-10 flex items-center gap-2">Start Course <ArrowRight className="h-3 w-3" /></span>
                                                <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            
        </div>
    );
}
