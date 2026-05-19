import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import {
  LayoutDashboard,
  Compass,
  Award,
  Briefcase,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  HelpCircle,
  Bell,
  Search,
  Menu,
  X,
  Zap,
  User,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { BubblesIcon } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useProfile } from "../context/profile-context";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { getFileUrl } from "../lib/api";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchData, setSearchData] = useState<{ id: string, label: string, type: string, targetPath: string, }[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Populate simple local index of available pages for search
    setSearchData([
      { id: "p1", label: "Career Explorer", type: "Page", targetPath: "/dashboard/career-explorer" },
      { id: "p2", label: "My Skills & Roadmap", type: "Page", targetPath: "/dashboard/my-skills" },
      { id: "p3", label: "Mistake Tracker", type: "Page", targetPath: "/dashboard/mistake-tracker" },
      { id: "p4", label: "Job Board", type: "Page", targetPath: "/dashboard/job-board" },
      { id: "p5", label: "Learning & Courses", type: "Page", targetPath: "/dashboard/learning" },
      { id: "p6", label: "Find Mentors", type: "Page", targetPath: "/dashboard/mentors" },
      { id: "p7", label: "Community", type: "Page", targetPath: "/dashboard/community" },
      { id: "p8", label: "Achievements & Badges", type: "Page", targetPath: "/dashboard/achievements" },
      { id: "p9", label: "Profile Settings", type: "Page", targetPath: "/dashboard/profile" },
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSearchResults = (() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return searchData.filter(item => 
      item.label.toLowerCase().includes(lowerQuery) || 
      item.type.toLowerCase().includes(lowerQuery)
    );
  })();

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<any[]>('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up polling for realtime updates (every 10 seconds)
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('/notifications/read-all', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // Helper to check if a route is active
  const isActive = (path: string) => {
    // Exact match for dashboard home or sub-routes
    if (path === "" && location.pathname === "/dashboard") return true;
    if (path === "" && location.pathname === "/dashboard/") return true;
    return location.pathname.startsWith(`/dashboard/${path}`);
  };

  const menuItems = [
    { id: "", label: "Dashboard", icon: LayoutDashboard }, // Empty string for root /dashboard
    { id: "career-explorer", label: "Career Explorer", icon: Compass },
    { id: "my-skills", label: "My Skills", icon: Award },
    { id: "mistake-tracker", label: "Mistake Tracker", icon: AlertTriangle },
    { id: "job-board", label: "Job Board", icon: Briefcase },
    { id: "learning", label: "Learning (Courses)", icon: BookOpen },
    { id: "mentors", label: "Mentors", icon: Users },
    { id: "community", label: "Community", icon: MessageSquare },
    { id: "ai-chat", label: "AI Chat Assistant", icon: BubblesIcon },
    { id: "achievements", label: "Achievements & Badges", icon: Trophy },
    { id: "support", label: "Support & Settings", icon: HelpCircle },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("generatedSkills");
    window.location.href = "/login";
  };

  return (
    <div className="h-screen flex bg-background transition-colors duration-300">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="size-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">The-Setu</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.id);
              return (
                <Link
                  key={item.id}
                  to={item.id === "" ? "/dashboard" : `/dashboard/${item.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active
                    ? "bg-secondary text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                >
                  <Icon className="size-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar User Profile */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => {
                navigate("/dashboard/profile");
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full hover:bg-secondary/50 p-2 rounded-lg transition-colors text-left"
            >
              <Avatar className="size-10 border-2 border-primary/10 shadow-sm">
                <AvatarImage src={profile.general.avatar ? getFileUrl(profile.general.avatar) : undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {profile.general.firstName?.[0] || 'U'}{profile.general.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile.general.firstName} {profile.general.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{profile.general.email || "user@example.com"}</p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 transition-colors duration-300">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="size-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl">
              <div className="relative group" ref={searchRef}>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder="Search pages and resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-12 pr-6 py-2.5 bg-secondary/80 hover:bg-secondary border-none rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium placeholder:text-muted-foreground/70"
                />
                
                {/* Search Dropdown */}
                {isSearchFocused && searchQuery.trim() !== "" && (
                  <div className="absolute top-12 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-80 overflow-y-auto w-full p-2">
                      <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 pt-2 uppercase tracking-wider">
                        Search Results
                      </div>
                      {filteredSearchResults.length > 0 ? (
                        filteredSearchResults.map((result) => (
                          <button
                            key={result.id}
                            className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors flex items-center justify-between group/item"
                            onClick={() => {
                              navigate(result.targetPath);
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                                <Search className="size-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{result.label}</p>
                                <p className="text-xs text-muted-foreground">{result.type}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No results found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* AI Assistant Button */}
            <button onClick={() => navigate("/dashboard/ai-chat")} className="relative group hidden md:block">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-teal-400 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-[1px]"></div>
              <div className="relative px-5 py-2 bg-background rounded-full flex items-center gap-2 transition-all">
                <span className="text-sm font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">AI Assistant</span>
                <span className="flex">
                  <div className="size-2 bg-foreground rounded-full animate-pulse mr-0.5"></div>
                  <div className="size-1.5 bg-foreground rounded-full animate-pulse delay-75"></div>
                </span>
                <Zap className="size-3.5 text-foreground fill-current animate-pulse" />
              </div>
            </button>

            {/* AI Assistant Button (Mobile) */}
            <button onClick={() => navigate("/dashboard/ai-chat")} className="relative group block md:hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 via-teal-400 to-purple-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur-[1px]"></div>
              <div className="relative size-10 bg-background rounded-full flex items-center justify-center transition-all">
                <span className="text-xs font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">AI</span>
              </div>
            </button>

            <ModeToggle />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors outline-none">
                  <Bell className="size-5" />
                  {notifications.filter((n: any) => !n.read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-background"></span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {notifications.some(n => !n.read) && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <DropdownMenuItem
                        key={notification._id}
                        onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                        className={`p-4 cursor-pointer flex items-start gap-3 rounded-none border-b border-border last:border-0 ${notification.read ? 'opacity-70 bg-background hover:bg-muted/30 focus:bg-muted/30' : 'bg-primary/5 hover:bg-primary/10 focus:bg-primary/10'}`}
                      >
                        <div className={`p-2 rounded-full shrink-0 ${notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                          notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                            notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          }`}>
                          {notification.type === 'success' ? <Trophy className="size-4" /> :
                            notification.type === 'warning' ? <AlertTriangle className="size-4" /> :
                              notification.type === 'error' ? <X className="size-4" /> :
                                <Bell className="size-4" />
                          }
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className={`text-sm leading-none ${notification.read ? 'font-medium' : 'font-bold'}`}>{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="size-2 rounded-full bg-primary shrink-0 self-center"></div>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-border">
                  <button className="w-full text-center text-xs text-primary font-medium hover:underline py-2">
                    View all notifications
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors outline-none cursor-pointer">
                  <Avatar className="size-8 border-2 border-primary/10 shadow-sm">
                    <AvatarImage src={profile.general.avatar ? getFileUrl(profile.general.avatar) : undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {profile.general.firstName?.[0] || 'U'}{profile.general.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-foreground">
                    {profile.general.firstName} {profile.general.lastName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/dashboard/profile")}>
                  <User className="mr-2 size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background/50">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
