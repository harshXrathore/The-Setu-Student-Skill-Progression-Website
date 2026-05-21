import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../lib/api";
import { Users, BookOpen, Compass, Settings, Menu, Bell, Search, ShieldCheck, Briefcase, Video, MessageSquare } from "lucide-react";
import { AdminRoute } from "../components/admin/AdminRoute";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { UserTable } from "../components/admin/UserTable";
import { RoleGuideEditor } from "../components/admin/RoleGuideEditor";
import { RoadmapMonitor } from "../components/admin/RoadmapMonitor";
import { UserGrowthChart, RoleDistributionChart, ContentOverviewChart, RevenueChart, TrafficRadarChart } from "../components/admin/AnalyticsCharts";
import { AuditLogViewer } from "../components/admin/AuditLogViewer";
import { BroadcastCenter } from "../components/admin/BroadcastCenter";
import { SystemSettings } from "../components/admin/SystemSettings";
import { JobManager } from "../components/admin/JobManager";
import { CourseManager } from "../components/admin/CourseManager";
import { CommunityManager } from "../components/admin/CommunityManager";
import { CareerManager } from "../components/admin/CareerManager";

export function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab: string) => {
        setSearchParams({ tab }, { replace: true });
    };

    // Prevent Back Button Navigation (Kiosk Mode)
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRoadmaps: 0,
        activeRoles: 0,
        newUsersToday: 0,
        totalJobs: 0,
        totalCourses: 0,
        totalPosts: 0,
        charts: {
            userGrowth: [],
            roleDistribution: []
        }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiRequest<any>('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <AdminRoute>
            <div className="min-h-screen bg-background flex">
                <AdminSidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                    {/* Top Header */}
                    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg"
                            >
                                <Menu className="size-5" />
                            </button>
                            <h2 className="font-semibold text-lg hidden sm:block">
                                {activeTab === 'overview' && "Dashboard Overview"}
                                {activeTab === 'users' && "User Directory"}
                                {activeTab === 'roles' && "Knowledge Base"}
                                {activeTab === 'roadmaps' && "Roadmap Monitor"}
                                {activeTab === 'jobs' && "Job Board Manager"}
                                {activeTab === 'courses' && "Course Manager"}
                                {activeTab === 'community' && "Community Moderation"}
                                {activeTab === 'careers' && "Career Paths Builder"}
                                {activeTab === 'broadcast' && "Communication Center"}
                                {activeTab === 'logs' && "System Audit Logs"}
                                {activeTab === 'settings' && "System Settings"}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative hidden md:block w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Global Search..."
                                    className="w-full pl-9 pr-4 py-2 bg-secondary/50 rounded-full text-sm focus:outline-none ring-1 ring-transparent focus:ring-primary/20"
                                />
                            </div>
                            <button className="relative p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                                <Bell className="size-5" />
                                <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-background"></span>
                            </button>
                        </div>
                    </header>

                    {/* Main Content Scroll Area */}
                    <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50 dark:bg-background/20">
                        <div className="max-w-6xl mx-auto animate-in fade-in duration-300">

                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <StatCard
                                            title="Total Users"
                                            value={stats.totalUsers.toLocaleString()}
                                            change={`+${stats.newUsersToday} today`}
                                            icon={<Users className="size-5" />}
                                            bg="bg-blue-100/50 dark:bg-blue-900/20 text-blue-600"
                                        />
                                        <StatCard
                                            title="Active Roadmaps"
                                            value={stats.totalRoadmaps.toLocaleString()}
                                            change="Generated Paths"
                                            icon={<Compass className="size-5" />}
                                            bg="bg-purple-100/50 dark:bg-purple-900/20 text-purple-600"
                                        />
                                        <StatCard
                                            title="Role Guides"
                                            value={stats.activeRoles.toString()}
                                            change="Knowledge Base"
                                            icon={<BookOpen className="size-5" />}
                                            bg="bg-green-100/50 dark:bg-green-900/20 text-green-600"
                                        />
                                        <StatCard
                                            title="Active Jobs"
                                            value={stats.totalJobs?.toLocaleString() || "0"}
                                            change="Open Positions"
                                            icon={<Briefcase className="size-5" />}
                                            bg="bg-orange-100/50 dark:bg-orange-900/20 text-orange-600"
                                        />
                                        <StatCard
                                            title="Courses"
                                            value={stats.totalCourses?.toLocaleString() || "0"}
                                            change="Learning Modules"
                                            icon={<Video className="size-5" />}
                                            bg="bg-red-100/50 dark:bg-red-900/20 text-red-600"
                                        />
                                        <StatCard
                                            title="Community Posts"
                                            value={stats.totalPosts?.toLocaleString() || "0"}
                                            change="User Discussions"
                                            icon={<MessageSquare className="size-5" />}
                                            bg="bg-indigo-100/50 dark:bg-indigo-900/20 text-indigo-600"
                                        />
                                    </div>


                                    {/* Analytics Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {/* User Growth Chart - Spans 2 cols on XL */}
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow xl:col-span-2">
                                            <div className="mb-6 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-lg tracking-tight">User Analytics</h3>
                                                    <p className="text-sm text-muted-foreground">Total vs Active Users</p>
                                                </div>
                                            </div>
                                            <UserGrowthChart data={stats.charts?.userGrowth || []} />
                                        </div>

                                        {/* Role Distribution Chart */}
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="mb-6">
                                                <h3 className="font-bold text-lg tracking-tight">User Roles</h3>
                                                <p className="text-sm text-muted-foreground">Distribution by expertise</p>
                                            </div>
                                            <RoleDistributionChart data={stats.charts?.roleDistribution || []} />
                                        </div>

                                        {/* Revenue Chart */}
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="mb-6">
                                                <h3 className="font-bold text-lg tracking-tight">Weekly Revenue</h3>
                                                <p className="text-sm text-muted-foreground">Pro subscriptions & courses</p>
                                            </div>
                                            <RevenueChart />
                                        </div>

                                        {/* Traffic Sources */}
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="mb-6">
                                                <h3 className="font-bold text-lg tracking-tight">Traffic Sources</h3>
                                                <p className="text-sm text-muted-foreground">User acquisition channels</p>
                                            </div>
                                            <TrafficRadarChart />
                                        </div>

                                        {/* Content Overview - Compact */}
                                        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
                                            <div className="mb-4">
                                                <h3 className="font-bold text-lg tracking-tight">Platform Content</h3>
                                                <p className="text-sm text-muted-foreground">Active resources</p>
                                            </div>
                                            <ContentOverviewChart data={{ jobs: stats.totalJobs || 0, courses: stats.totalCourses || 0, posts: stats.totalPosts || 0 }} />
                                            <div className="mt-4 pt-4 border-t text-center">
                                                <button className="text-primary text-sm font-medium hover:underline">View All Content Managers</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && <UserTable />}
                            {activeTab === 'roles' && <RoleGuideEditor />}
                            {activeTab === 'roadmaps' && <RoadmapMonitor />}
                            {activeTab === 'jobs' && <JobManager />}
                            {activeTab === 'courses' && <CourseManager />}
                            {activeTab === 'community' && <CommunityManager />}
                            {activeTab === 'careers' && <CareerManager />}
                            {activeTab === 'broadcast' && <BroadcastCenter />}

                            {activeTab === 'logs' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold">Security & Activity Log</h3>
                                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                            Last 100 Events
                                        </span>
                                    </div>
                                    <AuditLogViewer />
                                </div>
                            )}

                            {activeTab === 'settings' && <SystemSettings />}

                        </div>
                    </main>
                </div>
            </div>
        </AdminRoute>
    );
}

function StatCard({ title, value, change, icon, bg }: any) {
    return (
        <div className="group relative overflow-hidden bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${bg.replace('bg-', 'text-')}`}>
                {icon}
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${bg}`}>
                    {icon}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    {change}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
            </div>
        </div>
    );
}
