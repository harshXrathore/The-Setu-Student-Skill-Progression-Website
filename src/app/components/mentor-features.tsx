import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Users,
    FileCheck,
    Clock,
    Calendar,
    ChevronRight,
    TrendingUp,
    MessageSquare,
    ExternalLink,
    Play,
    Eye
} from "lucide-react";


// --- Types (Mock) ---
interface Student {
    id: string;
    name: string;
    focus: string;
    progress: number;
    lastActive: string;
    avatarInitials: string;
}




// --- Components ---

export function MentorStats() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiRequest<any>("/mentors/stats");
                setStatsData(data);
            } catch (err) {
                console.error("Failed to fetch mentor stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Helper map to combine the aesthetic config (icons/colors) with the dynamic data
    const dynamicStats = [
        {
            label: "Active Students",
            value: statsData?.activeStudents || "0",
            icon: Users,
            change: "Currently Enrolled",
            trend: "up",
            color: "from-teal-500 to-emerald-500",
            glow: "shadow-teal-500/20"
        },
        {
            label: "Pending Reviews",
            value: statsData?.pendingReviews || "0",
            icon: FileCheck,
            change: "Requires Attention",
            trend: "neutral",
            color: "from-indigo-500 to-purple-500",
            glow: "shadow-indigo-500/20"
        },
        {
            label: "Hours Mentored",
            value: statsData?.hoursMentored || "0h",
            icon: Clock,
            change: "Total Commitment",
            trend: "up",
            color: "from-blue-500 to-cyan-500",
            glow: "shadow-blue-500/20"
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
                {[1, 2, 3].map((_, i) => (
                    <Card key={i} className="h-32 bg-card/50 animate-pulse border-border/50" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-2">
            {dynamicStats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group bg-card">
                    {/* Background glow effect */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-opacity group-hover:opacity-20`} />

                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.glow}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                            <span className="text-xs font-medium text-muted-foreground">
                                {stat.change}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function StudentRoster() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const fetchedStudents = await apiRequest<any[]>("/mentors/students");

                const mappedStudents = fetchedStudents.map(student => ({
                    id: student.id,
                    name: student.name || "Unknown Student",
                    focus: student.focus || "Learning",
                    progress: student.progress || 0,
                    lastActive: new Date(student.lastActive).toLocaleDateString(),
                    avatarInitials: (student.name || "U").slice(0, 2).toUpperCase()
                }));

                setStudents(mappedStudents);
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    return (
        <Card className="h-full col-span-1 lg:col-span-2 shadow-sm border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 bg-teal-500/10 rounded-lg">
                        <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    My Students
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors" onClick={() => navigate('/mentor-dashboard/students')}>
                    View All Roster
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {loading ? <div className="text-center py-8 text-muted-foreground animate-pulse">Loading active students...</div> :
                        students.length === 0 ? <div className="text-center py-8 text-muted-foreground">No students matched to you yet.</div> :
                            students.slice(0, 4).map((student) => (
                                <div key={student.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-teal-500/30 hover:shadow-md transition-all duration-300 gap-4 sm:gap-2">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full border-2 border-background shadow-sm bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                                {student.avatarInitials}
                                            </div>
                                            {student.progress > 80 && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" title="High Performer" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{student.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="text-[10px] font-medium bg-secondary text-secondary-foreground border-none">
                                                    {student.focus}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                        <div className="flex-1 sm:w-32 text-left sm:text-right">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Progress</span>
                                                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{student.progress}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${student.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Hover Actions (Desktop Only) */}
                                        <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1 absolute right-2 bg-background/80 backdrop-blur pl-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30">
                                                <ExternalLink className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Mobile Chevron */}
                                        <div className="sm:hidden text-muted-foreground">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function ReviewQueue() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const fetchedReviews = await apiRequest<any[]>("/mentors/reviews");
                // Only show pending reviews in the queue, or limit the number
                const pending = fetchedReviews.filter(r => r.status === 'pending');
                setReviews(pending.slice(0, 5)); // Show up to 5 pending reviews
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const formatDistanceToNow = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInDays > 0) return `${diffInDays}d ago`;
        if (diffInHours > 0) return `${diffInHours}h ago`;
        return 'Just now';
    };

    return (
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    Review Queue
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors" onClick={() => navigate('/mentor-dashboard/reviews')}>
                    View All
                </Button>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground animate-pulse text-sm">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No pending reviews. Good job!
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="p-4 bg-background border border-border/50 rounded-xl hover:border-indigo-500/30 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge variant="secondary" className="border-none bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        Assignment
                                    </Badge>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {formatDistanceToNow(review.assignDate)}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-foreground text-sm mb-1 group-hover:text-indigo-600 transition-colors">{review.title}</h4>
                                <p className="text-xs text-muted-foreground mb-4">by {review.studentName}</p>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5">
                                        <Play className="w-3.5 h-3.5" />
                                        Review
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1 border-border/50 hover:bg-secondary h-8 text-xs font-semibold flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground">
                                        <Eye className="w-3.5 h-3.5" />
                                        Details
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function ScheduleOverview() {
    const navigate = useNavigate();
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [pastPending, setPastPending] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [rescheduleSessionId, setRescheduleSessionId] = useState<string | null>(null);
    const [durationInputs, setDurationInputs] = useState<{ [key: string]: string }>({});
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");
    const [newNotes, setNewNotes] = useState("");
    const [meetingUrl, setMeetingUrl] = useState("");

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const sessions = await apiRequest<any[]>("/mentors/sessions");

            // Pending Requests
            const pendingSessions = sessions.filter(s => s.status === 'Pending');
            setPending(pendingSessions);

            // Confirmed Upcoming
            const upcomingSessions = sessions
                .filter(s => s.status === 'Confirmed' && new Date(s.date) > new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setUpcoming(upcomingSessions);

            // Confirmed Past (Needs Completion)
            const pastSessions = sessions
                .filter(s => s.status === 'Confirmed' && new Date(s.date) <= new Date())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setPastPending(pastSessions);
        } catch (err) {
            console.error("Failed to fetch schedule", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedule();
    }, []);

    const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
        setActionLoading(sessionId);
        try {
            const body: any = { status: newStatus };

            // Append data depending on status phase
            if (newStatus === 'Completed' && durationInputs[sessionId]) {
                body.duration = parseInt(durationInputs[sessionId]);
            }
            if (rescheduleSessionId === sessionId) {
                if (newStatus === 'Pending Reschedule') {
                    if (newDate && newTime) body.newDate = new Date(`${newDate}T${newTime}`).toISOString();
                    if (newNotes) body.newNotes = newNotes;
                } else if (newStatus === 'Confirmed') {
                    if (meetingUrl) body.meetingUrl = meetingUrl;
                    if (newNotes) body.newNotes = newNotes; // Allow notes on confirm too
                }
            }

            await apiRequest(`/mentors/sessions/${sessionId}/status`, {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            // Refresh schedule
            await fetchSchedule();
            setRescheduleSessionId(null);
            setNewDate("");
            setNewTime("");
            setNewNotes("");
            setMeetingUrl("");
        } catch (err) {
            console.error(`Failed to ${newStatus} session`, err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleAcceptClick = (session: any) => {
        if (rescheduleSessionId === session._id) {
            // Check if user modified the date/time vs the original
            const orig = new Date(session.date);
            const origDate = orig.toISOString().split('T')[0];
            const origTime = orig.toTimeString().slice(0, 5);
            
            if (origDate !== newDate || origTime !== newTime) {
                handleStatusUpdate(session._id, 'Pending Reschedule');
            } else {
                handleStatusUpdate(session._id, 'Confirmed');
            }
        } else {
            setRescheduleSessionId(session._id);
            const d = new Date(session.date);
            setNewDate(d.toISOString().split('T')[0]);
            setNewTime(d.toTimeString().slice(0, 5));
            setNewNotes("");
            setMeetingUrl("");
        }
    };

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return {
            time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: d.toLocaleDateString()
        };
    };

    return (
        <Card className="shadow-sm border-border/50 bg-card/50 backdrop-blur-xl h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    Session Management
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-8 pt-6">

                {/* Pending Requests Section */}
                <div>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Pending Requests ({pending.length})</h3>
                    <div className="space-y-4">
                        {loading && pending.length === 0 ? <div className="text-sm text-muted-foreground animate-pulse">Loading...</div> :
                            pending.length === 0 ? <div className="text-sm text-muted-foreground bg-background p-4 rounded-xl border border-dashed border-border/50 text-center">No pending requests</div> :
                                pending.map((session) => {
                                    const { time, date } = formatDate(session.date);
                                    const isLoading = actionLoading === session._id;
                                    return (
                                        <div key={session._id} className="p-4 bg-background border border-border/50 rounded-xl hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h4 className="font-bold text-foreground text-sm truncate">{session.topic}</h4>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">with {session.student?.name || "Student"}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-md mb-1 border border-amber-200 dark:border-amber-800/50">{time}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{date}</div>
                                                </div>
                                            </div>
                                            {session.notes && (
                                                <div className="mt-3 bg-secondary/50 p-3 rounded-lg border border-border/50 relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 rounded-l-lg" />
                                                    <p className="text-xs text-muted-foreground italic pl-1 leading-relaxed">
                                                        "{session.notes}"
                                                    </p>
                                                </div>
                                            )}

                                            {rescheduleSessionId === session._id && (() => {
                                                const orig = new Date(session.date);
                                                const isReschedule = orig.toISOString().split('T')[0] !== newDate || orig.toTimeString().slice(0, 5) !== newTime;
                                                
                                                return (
                                                <div className="mb-3 space-y-2 bg-white p-3 rounded-lg border border-purple-200 dark:bg-background dark:border-purple-900/50 shadow-sm animate-in fade-in duration-200">
                                                    <p className="text-xs font-bold text-foreground">Confirm Time or Propose New:</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="date"
                                                            value={newDate}
                                                            onChange={(e) => setNewDate(e.target.value)}
                                                            className="flex-1 px-3 py-1.5 text-xs border border-border rounded-md bg-transparent"
                                                        />
                                                        <input
                                                            type="time"
                                                            value={newTime}
                                                            onChange={(e) => setNewTime(e.target.value)}
                                                            className="flex-1 px-3 py-1.5 text-xs border border-border rounded-md bg-transparent"
                                                        />
                                                    </div>
                                                    
                                                    {/* Only show Meeting URL if they aren't rescheduling */}
                                                    {!isReschedule && (
                                                        <input
                                                            type="url"
                                                            placeholder="Meeting URL (Zoom / Google Meet)"
                                                            value={meetingUrl}
                                                            onChange={(e) => setMeetingUrl(e.target.value)}
                                                            className="w-full px-3 py-1.5 text-xs border border-border rounded-md bg-transparent focus:ring-1 focus:ring-purple-500 transition-all font-medium text-purple-600 outline-none"
                                                        />
                                                    )}

                                                    <textarea
                                                        value={newNotes}
                                                        onChange={(e) => setNewNotes(e.target.value)}
                                                        placeholder={isReschedule ? "Note to student about new time proposal..." : "Optional note/agenda for the session..."}
                                                        className="w-full px-3 py-2 text-xs border border-border rounded-md resize-none h-16 bg-transparent"
                                                    />
                                                </div>
                                            );})()}

                                            <div className="flex gap-3 mt-4">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-9 text-xs font-bold shadow-sm border-none"
                                                    disabled={isLoading}
                                                    onClick={() => handleAcceptClick(session)}
                                                >
                                                    {isLoading ? "..." : rescheduleSessionId === session._id ? (
                                                        (() => {
                                                            const orig = new Date(session.date);
                                                            const isReschedule = orig.toISOString().split('T')[0] !== newDate || orig.toTimeString().slice(0, 5) !== newTime;
                                                            return isReschedule ? "Propose New Time" : "Confirm Schedule";
                                                        })()
                                                    ) : "Accept"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 border-red-500/20 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-9 text-xs font-bold"
                                                    disabled={isLoading}
                                                    onClick={() => rescheduleSessionId === session._id ? setRescheduleSessionId(null) : handleStatusUpdate(session._id, 'Cancelled')}
                                                >
                                                    {rescheduleSessionId === session._id ? "Cancel" : "Decline"}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                    </div>
                </div>

                {/* Upcoming Confirmed Section */}
                <div className="flex-1">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Upcoming ({upcoming.length})</h3>
                    <div className="space-y-3">
                        {loading && upcoming.length === 0 ? <div className="text-sm text-muted-foreground animate-pulse">Loading...</div> :
                            upcoming.length === 0 ? <div className="text-sm text-muted-foreground bg-background p-4 rounded-xl border border-dashed text-center">No upcoming sessions.</div> :
                                upcoming.map((session) => {
                                    const { time, date } = formatDate(session.date);
                                    return (
                                        <div key={session._id} className="flex gap-4 items-center border-l-4 border-purple-500 pl-4 py-2.5 bg-background/50 rounded-r-xl border-y border-r border-border/50 hover:bg-background transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-foreground truncate">{session.topic}</h4>
                                                <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">with {session.student?.name || "Unknown"}</p>
                                            </div>
                                            <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                                                <div className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800/50">{time}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{date}</div>
                                                {session.meetingUrl ? (
                                                    <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-semibold">Join Call</a>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border font-medium">Link Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                    </div>
                </div>

                {/* Past Sessions Requiring Completion */}
                {pastPending && pastPending.length > 0 && (
                    <div className="mt-6 border-t border-border/50 pt-6 flex-1">
                        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Awaiting Completion ({pastPending.length})</h3>
                        <div className="space-y-3">
                            {pastPending.map((session) => {
                                const { date } = formatDate(session.date);
                                const isLoading = actionLoading === session._id;
                                return (
                                    <div key={session._id} className="p-4 bg-background border border-orange-500/30 rounded-xl hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-foreground text-sm truncate">{session.topic}</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">with {session.student?.name || "Student"}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{date}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 items-center mt-3 pt-3 border-t border-border/50">
                                            <label className="text-[10px] font-semibold text-muted-foreground flex-1 uppercase">Actual Duration (mins):</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                step="5"
                                                className="w-16 px-2 py-1 text-xs border border-border rounded-md bg-secondary text-foreground outline-none focus:ring-1 focus:ring-orange-500"
                                                placeholder="60"
                                                value={durationInputs[session._id] || ""}
                                                onChange={(e) => setDurationInputs(prev => ({ ...prev, [session._id]: e.target.value }))}
                                            />
                                            <Button 
                                                size="sm" 
                                                className="bg-orange-500 hover:bg-orange-600 text-white h-7 py-0 px-3 text-xs"
                                                onClick={() => handleStatusUpdate(session._id, "Completed")}
                                                disabled={isLoading || !durationInputs[session._id]}
                                            >
                                                {isLoading ? "..." : "Complete"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <Button variant="outline" className="w-full text-purple-600 mt-auto text-sm border-purple-200 hover:bg-purple-50" onClick={() => navigate('/mentor-dashboard/sessions')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Full Calendar
                </Button>
            </CardContent>
        </Card>
    );
}
