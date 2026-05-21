import { LayoutDashboard, Users, BookOpen, Compass, Settings, LogOut, Shield, FileText, Megaphone, Briefcase, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../ui/utils";

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export function AdminSidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'jobs', label: 'Job Board', icon: Briefcase },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'community', label: 'Community', icon: Users },
        { id: 'careers', label: 'Career Paths', icon: Target },
        { id: 'roles', label: 'Knowledge Base', icon: BookOpen },
        { id: 'roadmaps', label: 'Roadmap Monitor', icon: Compass },
        { id: 'broadcast', label: 'Broadcasting', icon: Megaphone },
        { id: 'logs', label: 'System Logs', icon: FileText },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('adminSessionActive');
        navigate('/admin/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-sm transform transition-transform duration-200 ease-in-out flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Header */}
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <Shield className="size-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Admin Console</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Main Menu
                    </div>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-black text-white shadow-sm"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("size-4", isActive ? "text-white" : "text-muted-foreground")} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border">
                    <div className="bg-secondary/30 p-3 rounded-lg flex items-center gap-3 mb-3">
                        <div className="size-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Administrator</p>
                            <p className="text-xs text-muted-foreground truncate">System Access</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut className="size-4" />
                        <span>Sign Out</span>
                    </button>

                    <div className="mt-4 text-center">
                        <Link to="/dashboard" className="text-xs text-muted-foreground hover:underline">
                            Return to Main Site
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
}
