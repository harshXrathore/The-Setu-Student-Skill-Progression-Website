import { useState, useEffect, useRef } from "react";
import { Link, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { apiRequest } from "../lib/api";
import {
    LogOut,
    GraduationCap,
    LayoutDashboard,
    Users,
    FileCheck,
    Settings,
    Menu,
    X,
    User,
    Calendar,
    CalendarPlus,
    Send,
    BookOpen,
    Search,
    Sparkles
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { ModeToggle } from "./mode-toggle";
import { MentorStats, StudentRoster, ReviewQueue, ScheduleOverview } from "./mentor-features";
import { CircularProgress } from "./ui/stats-widgets";
import { ProfilePage } from "./profile-page";
import { SessionsPage } from "./mentor/sessions-page";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useProfile } from "../context/profile-context";
import { MentorProfileDialog } from "./mentor-profile-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MyStudentsPage } from "./mentor/my-students-page";
import { StudentDetailsPage } from "./mentor/student-detail-page";
import { ReviewsPage } from "./mentor/reviews-page";
import { SettingsPage } from "./mentor/settings-page";
import { NotificationsPage } from "./mentor/notifications-page";
import { NotificationDropdown } from "./notification-dropdown";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

const QuickActionModal = ({
    isOpen,
    onClose,
    action,
    students
}: {
    isOpen: boolean,
    onClose: () => void,
    action: string | null,
    students: any[]
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (action === "Schedule Session") {
                await apiRequest("/mentors/schedule", {
                    method: "POST",
                    body: JSON.stringify(formData)
                });
                alert("Session scheduled successfully!");
            } else if (action === "Broadcast Message") {
                await apiRequest("/mentors/broadcast", {
                    method: "POST",
                    body: JSON.stringify(formData)
                });
                alert("Message broadcasted successfully!");
            } else if (action === "Share Resource") {
                await apiRequest("/mentors/share-resource", {
                    method: "POST",
                    body: JSON.stringify(formData)
                });
                alert("Resource shared successfully!");
            }
            onClose();
            setFormData({});
        } catch (error) {
            console.error("Action failed", error);
            alert("Action failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{action}</DialogTitle>
                    <DialogDescription>
                        {action === "Schedule Session" && "Schedule a new direct session with a student."}
                        {action === "Broadcast Message" && "Send a message to all your assigned students."}
                        {action === "Share Resource" && "Quickly share a helpful link or resource."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {action !== "Broadcast Message" && (
                        <div className="space-y-2">
                            <Label>Select Student</Label>
                            <select
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.studentId || ""}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                            >
                                <option value="" disabled>Select a student...</option>
                                {students.map((st: any) => (
                                    <option key={st.id || st._id} value={st.id || st._id}>{st.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {action === "Schedule Session" && (
                        <>
                            <div className="space-y-2">
                                <Label>Topic</Label>
                                <Input required placeholder="e.g. Resume Review" value={formData.topic || ""} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date & Time</Label>
                                <Input required type="datetime-local" value={formData.date || ""} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                        </>
                    )}

                    {action === "Broadcast Message" && (
                        <>
                            <div className="space-y-2">
                                <Label>Message Title</Label>
                                <Input required placeholder="Important Update" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Message Body</Label>
                                <Textarea required placeholder="Type your message here..." className="min-h-[100px]" value={formData.message || ""} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                            </div>
                        </>
                    )}

                    {action === "Share Resource" && (
                        <>
                            <div className="space-y-2">
                                <Label>Resource Title</Label>
                                <Input required placeholder="e.g. React Docs" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>URL</Label>
                                <Input required type="url" placeholder="https://..." value={formData.url || ""} onChange={(e) => setFormData({ ...formData, url: e.target.value })} />
                            </div>
                        </>
                    )}

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white">
                            {loading ? "Processing..." : "Submit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export function MentorDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useProfile();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem("userName") || "Mentor";

    // --- Search Feature State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchData, setSearchData] = useState<{ id: string, label: string, type: string, targetPath: string, }[]>([]);
    const [filteredResults, setFilteredResults] = useState<{ id: string, label: string, type: string, targetPath: string, }[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    // --- Quick Actions State ---
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [myStudents, setMyStudents] = useState<any[]>([]);

    // --- AI Companion State ---
    const [aiOpen, setAiOpen] = useState(false);
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: 'Hi! I am your Mentor AI companion. Ask me anything about student motivation, study plans, feedback strategies, or how to handle mentoring challenges.' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const aiEndRef = useRef<HTMLDivElement>(null);

    // Fetch Global Search Data on Mount
    useEffect(() => {
        const fetchSearchData = async () => {
            try {
                // Fetch basic global context logic (Parallel)
                const [studentsRes, reviewsRes, sessionsRes] = await Promise.all([
                    apiRequest<any[]>("/mentors/students").catch(() => []),
                    apiRequest<any[]>("/mentors/reviews").catch(() => []),
                    apiRequest<any[]>("/mentors/sessions").catch(() => [])
                ]);

                const globalSearchPool: any[] = [];

                studentsRes.forEach(student => {
                    globalSearchPool.push({ id: student.id || student._id, label: student.name || 'Student', type: 'Student', targetPath: '/mentor-dashboard/students' });
                });

                setMyStudents(studentsRes);

                reviewsRes.forEach(review => {
                    globalSearchPool.push({ id: review._id, label: review.title || 'Review Task', type: 'Review', targetPath: '/mentor-dashboard/reviews' });
                });

                sessionsRes.forEach(session => {
                    globalSearchPool.push({ id: session._id, label: session.topic || 'Mentorship Session', type: 'Session', targetPath: '/mentor-dashboard/sessions' });
                });

                setSearchData(globalSearchPool);
            } catch (err) {
                console.error("Failed fetching search contexts", err);
            }
        };
        fetchSearchData();
    }, []);

    // Auto-scroll AI chat
    useEffect(() => {
        if (aiOpen) aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [aiMessages, aiOpen]);

    const sendAiMessage = async () => {
        if (!aiInput.trim() || aiLoading) return;
        const userMsg = aiInput.trim();
        setAiInput('');
        setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setAiLoading(true);
        try {
            const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqApiKey}` },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an expert mentor coach AI assistant embedded inside a mentoring platform called The-Setu. 
Your role is to help mentors with:
- Student motivation strategies and psychological support
- Creating personalised study plans and learning paths
- Writing constructive assignment feedback
- Handling difficult mentoring situations
- Career advice and professional development guidance
Keep responses concise, practical, and warm. Use bullet points for clarity. Always be encouraging.`
                        },
                        ...aiMessages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMsg }
                    ],
                    max_tokens: 512,
                    temperature: 0.7
                })
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error?.message || response.statusText || "Failed to fetch response");
            }
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || data.error?.message || 'Sorry, I could not generate a response right now.';
            setAiMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (err: any) {
            setAiMessages(prev => [...prev, { role: 'assistant', content: `API Error: ${err.message}` }]);
        } finally {
            setAiLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredResults([]);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();
        const matches = searchData.filter(item =>
            item.label.toLowerCase().includes(lowerQuery) ||
            item.type.toLowerCase().includes(lowerQuery)
        );
        setFilteredResults(matches.slice(0, 5)); // limit dropdown items
    }, [searchQuery, searchData]);

    // Handle outside click for search dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Build a rich mentor object combining the API profile state with local fallback data
    const richMentorData = {
        ...profile,
        user: profile.user || { name: userName, isVerified: true }
    };

    const QUICK_ACTIONS = [
        { label: "Schedule Session", icon: CalendarPlus, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20" },
        { label: "Broadcast Message", icon: Send, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
        { label: "Share Resource", icon: BookOpen, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20" },
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Simple active state check
    const isActive = (path: string) => {
        if (path === "/mentor-dashboard") {
            return location.pathname === "/mentor-dashboard" || location.pathname === "/mentor-dashboard/";
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    const NavItem = ({ icon: Icon, label, path, badge }: { icon: any, label: string, path: string, badge?: string }) => (
        <Link
            to={path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive(path)
                    ? 'bg-gradient-to-r from-teal-500/10 to-transparent text-teal-700 dark:text-teal-400 font-semibold border-l-4 border-teal-500'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground border-l-4 border-transparent'
                }`}
        >
            <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive(path) ? 'text-teal-600 dark:text-teal-400' : 'text-muted-foreground group-hover:text-foreground'}`} />
            <span className="relative z-10">{label}</span>
            {badge && (
                <span className="absolute right-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
            {/* Hover Glow */}
            {!isActive(path) && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            )}
        </Link>
    );

    return (
        <>
            <div className="h-screen bg-slate-50/50 dark:bg-background flex">
                {/* Sidebar Desktop */}
                <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 bg-background/80 backdrop-blur-xl border-r border-border/40 z-30 shadow-sm relative">
                    {/* Subtle Sidebar Glow */}
                    <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-teal-500/20 to-transparent" />

                    <div className="p-6 border-b border-border/40">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="bg-gradient-to-br from-teal-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/30">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-extrabold text-xl leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">The-Setu</h1>
                                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.2em]">Mentor</span>
                            </div>
                        </div>

                        <MentorProfileDialog mentor={richMentorData}>
                            <button className="w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-2xl">
                                <div className="flex items-center gap-3 p-3.5 bg-gradient-to-br from-secondary/50 to-background rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer group text-left">
                                    <div className="relative">
                                        <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-indigo-500 text-white font-bold">{userName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-background bg-green-500 rounded-full" />
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <h3 className="text-sm font-bold truncate text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{userName}</h3>
                                        <p className="text-[11px] font-medium text-muted-foreground truncate uppercase tracking-wider mt-0.5">Senior Mentor</p>
                                    </div>
                                </div>
                            </button>
                        </MentorProfileDialog>
                    </div>

                    <ScrollArea className="flex-1 px-4 py-8">
                        <nav className="space-y-1.5">
                            <NavItem icon={LayoutDashboard} label="Dashboard" path="/mentor-dashboard" />
                            <NavItem icon={Calendar} label="Sessions" path="/mentor-dashboard/sessions" />
                            <NavItem icon={Users} label="My Students" path="/mentor-dashboard/students" />
                            <NavItem icon={FileCheck} label="Reviews" path="/mentor-dashboard/reviews" badge="5" />
                        </nav>
                    </ScrollArea>
                </aside>

                {/* Mobile Header & Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Global Navbar */}
                    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 lg:px-8 h-16 flex items-center justify-between shrink-0">
                        {/* Mobile Menu Toggle & Title */}
                        <div className="flex items-center gap-2 lg:hidden">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                            <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400 ml-1" />
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden sm:block relative" ref={searchRef}>
                            <div className="relative group w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-teal-500 transition-colors" />
                                <Input
                                    placeholder="Search students, reviews, or resources..."
                                    className="pl-10 w-full bg-secondary/50 border-border/50 rounded-full focus-visible:ring-teal-500/50 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                />
                            </div>

                            {/* Search Dropdown */}
                            {isSearchFocused && searchQuery.trim() !== "" && (
                                <div className="absolute top-12 left-0 w-full bg-background border border-border/50 shadow-xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredResults.length > 0 ? (
                                        <div className="py-2">
                                            <div className="px-3 pb-2 pt-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Results</p>
                                            </div>
                                            {filteredResults.map((result) => (
                                                <button
                                                    key={`${result.type}-${result.id}`}
                                                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors focus:bg-secondary focus:outline-none flex items-center justify-between group"
                                                    onClick={() => {
                                                        navigate(result.targetPath);
                                                        setSearchQuery("");
                                                        setIsSearchFocused(false);
                                                    }}
                                                >
                                                    <span className="text-sm font-medium text-foreground group-hover:text-teal-600 transition-colors">{result.label}</span>
                                                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 font-semibold uppercase">{result.type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-sm text-muted-foreground border-t border-border/50">
                                            No results found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Search Icon */}
                        <div className="sm:hidden flex-1 flex justify-end mr-2">
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                                <Search className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            <Button variant="outline" onClick={() => setAiOpen(true)} className="hidden lg:flex rounded-full gap-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all font-semibold">
                                <Sparkles className="w-4 h-4" />
                                <span>AI Assistant</span>
                            </Button>

                            <NotificationDropdown />

                            <ModeToggle />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="relative rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/50 hover:ring-2 hover:ring-teal-500/30 transition-all">
                                        <Avatar className="h-9 w-9 border border-border/50 shadow-sm hover:scale-105 transition-transform">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                                            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-indigo-500 text-white font-bold">{userName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-background bg-green-500 rounded-full" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg border-border/40 font-medium z-50 mt-1">
                                    <div className="px-2 py-1.5 mb-1">
                                        <p className="text-sm font-semibold">{userName}</p>
                                        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Senior Mentor</p>
                                    </div>
                                    <DropdownMenuSeparator className="bg-border/40 my-1" />
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                                        <Link to="/mentor-dashboard/profile" className="flex items-center w-full focus:outline-none">
                                            <User className="w-4 h-4 mr-2" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer py-2.5">
                                        <Link to="/mentor-dashboard/settings" className="flex items-center w-full focus:outline-none">
                                            <Settings className="w-4 h-4 mr-2" />
                                            <span>Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border/40 my-1" />
                                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer py-2.5 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 transition-colors">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        <span>Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    {/* Mobile Menu Overlay */}
                    {isMobileMenuOpen && (
                        <div className="lg:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-20 px-4">
                            <nav className="space-y-4">
                                <Link to="/mentor-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium">Dashboard</Link>
                                <Link to="/mentor-dashboard/sessions" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium">Sessions</Link>
                                <Link to="/mentor-dashboard/students" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium">My Students</Link>
                                <Link to="/mentor-dashboard/reviews" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium">Reviews</Link>
                            </nav>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <main className="flex-1 p-4 lg:p-8 overflow-y-auto">

                        {/* Dashboard Content Routing */}
                        <Routes>
                            <Route index element={
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    className="space-y-8 max-w-7xl mx-auto"
                                >

                                    {/* Hero Banner Section */}
                                    <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden bg-background border border-border/50 shadow-sm mt-2">
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 via-emerald-600/10 to-cyan-600/10 dark:from-teal-900/20 dark:via-emerald-900/20 dark:to-cyan-900/20" />
                                        <div className="absolute top-0 right-0 p-12 opacity-50 pointer-events-none">
                                            <div className="size-64 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full blur-3xl" />
                                        </div>

                                        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-full blur-lg opacity-30 animate-pulse" />
                                                <div className="size-24 md:size-32 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-xl overflow-hidden relative z-10">
                                                    <Avatar className="w-full h-full">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} />
                                                        <AvatarFallback>{userName[0]}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="absolute bottom-1 right-1 z-20 bg-green-500 border-4 border-background size-6 rounded-full" title="Online" />
                                            </div>

                                            <div className="text-center md:text-left flex-1">
                                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 mb-2">
                                                    Welcome back, {userName}! 👋
                                                </h1>
                                                <p className="text-lg text-muted-foreground max-w-2xl">
                                                    Ready to inspire? You have 5 pending reviews and 2 upcoming sessions today.
                                                </p>

                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                                                    <div className="px-4 py-2 bg-background/80 backdrop-blur border border-border/50 rounded-full text-sm font-medium text-foreground flex items-center gap-2 shadow-sm">
                                                        <span className="size-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Available
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden md:flex flex-col items-center justify-center bg-background/40 backdrop-blur-xl p-6 rounded-2xl border border-border/50 shadow-sm">
                                                <CircularProgress value={85} size={100} color="#0d9488" />
                                                <p className="text-sm font-semibold text-foreground mt-3">Weekly Goal</p>
                                            </div>
                                        </div>

                                        {/* Quick Actions Bar */}
                                        <div className="relative z-10 bg-secondary/30 border-t border-border/50 p-4 md:px-10 flex flex-wrap items-center gap-4">
                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider mr-2 hidden sm:block">Quick Actions:</span>
                                            {QUICK_ACTIONS.map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveAction(action.label)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm border ${action.bg} ${action.color} ${action.border} hover:shadow-md`}
                                                >
                                                    <action.icon className="w-4 h-4" />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Quick Actions Dialog Component */}
                                        <QuickActionModal
                                            isOpen={!!activeAction}
                                            action={activeAction}
                                            onClose={() => setActiveAction(null)}
                                            students={myStudents}
                                        />
                                    </motion.div>

                                    {/* Group 1: Header & Stats */}
                                    <motion.div variants={itemVariants}>
                                        <MentorStats />
                                    </motion.div>

                                    {/* Group 2: Features Grid */}
                                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="lg:col-span-2">
                                            <StudentRoster />
                                        </div>
                                        <ScheduleOverview />
                                        <ReviewQueue />
                                    </motion.div>
                                </motion.div>
                            } />
                            <Route path="students" element={<MyStudentsPage />} />
                            <Route path="students/:id" element={<StudentDetailsPage />} />
                            <Route path="sessions" element={<SessionsPage />} />
                            <Route path="reviews" element={<ReviewsPage />} />
                            <Route path="settings" element={<SettingsPage />} />
                            <Route path="notifications" element={<NotificationsPage />} />
                            <Route path="profile" element={<ProfilePage />} />
                        </Routes>
                    </main>
                </div>
            </div>

            {/* AI Companion Slide-Over Panel */}
            {aiOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end pointer-events-none">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto" onClick={() => setAiOpen(false)} />

                    {/* Panel */}
                    <div className="relative pointer-events-auto w-full max-w-sm h-[560px] sm:h-[600px] me-0 sm:me-6 mb-0 sm:mb-6 flex flex-col bg-background/95 backdrop-blur-xl border border-indigo-500/20 shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Mentor AI Companion</h3>
                                    <p className="text-[10px] text-indigo-200 font-medium">Powered by The-Setu</p>
                                </div>
                            </div>
                            <button onClick={() => setAiOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {aiMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-secondary text-foreground rounded-bl-md border border-border/50'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {aiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary border border-border/50 px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={aiEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-border/50 flex gap-2 shrink-0">
                            <Input
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                                placeholder="Ask about students, study plans..."
                                className="flex-1 rounded-full bg-secondary border-border/50 text-sm h-10"
                                disabled={aiLoading}
                            />
                            <Button
                                size="icon"
                                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 w-10 shrink-0"
                                onClick={sendAiMessage}
                                disabled={aiLoading || !aiInput.trim()}
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
