import { useState, useEffect } from "react";
import { Users, Link as LinkIcon, CheckCircle, Circle, Clock, Download } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { apiRequest } from "../lib/api";
import { format } from "date-fns";

export function MyMentorshipsPage() {
    const [records, setRecords] = useState<any[]>([]);
    const [sessionsList, setSessionsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecords = async () => {
        try {
            const [mentorshipData, sessionsData] = await Promise.all([
                apiRequest<any[]>("/mentors/my-mentorships").catch(() => []),
                apiRequest<any[]>("/mentors/sessions").catch(() => [])
            ]);
            setRecords(mentorshipData);
            setSessionsList(sessionsData && Array.isArray(sessionsData) ? sessionsData : []);
        } catch (err) {
            console.error("Failed to fetch mentorship records", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleCompleteAssignment = async (assignmentId: string) => {
        try {
            await apiRequest(`/mentors/assignments/${assignmentId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status: "pending_review" })
            });
            // Update local state instead of full refetch for better UX
            setRecords(prev => prev.map(rec => ({
                ...rec,
                assignments: rec.assignments.map((a: any) =>
                    a._id === assignmentId ? { ...a, status: "pending_review" } : a
                )
            })));
        } catch (err) {
            console.error("Failed to update assignment", err);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Mentorships</h1>
                <p className="text-muted-foreground">View assignments and resources shared by your mentors.</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading your mentorships...</div>
            ) : (
                <div className="space-y-8">
                    
                    {/* UPCOMING SESSIONS WIDGET */}
                    {sessionsList.filter(s => ['Pending', 'Confirmed', 'Pending Reschedule'].includes(s.status)).length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-500" />
                                Upcoming Sessions
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {sessionsList.filter(s => ['Pending', 'Confirmed', 'Pending Reschedule'].includes(s.status)).map((session) => (
                                    <div key={session._id} className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-lg text-foreground truncate pl-1">{session.topic}</h4>
                                                <Badge variant={
                                                    session.status === 'Confirmed' ? 'default' : 
                                                    session.status === 'Pending' ? 'secondary' : 'outline'
                                                } className="shrink-0">{session.status}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 pl-1 mb-3">
                                                <Users className="w-4 h-4" /> 
                                                <span>with <span className="font-semibold text-foreground">{session.mentor?.name || "Mentor"}</span></span>
                                            </p>

                                            <div className="flex gap-4 p-3 bg-secondary/30 rounded-xl border border-border/50">
                                                <div className="flex-1">
                                                    <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Date</p>
                                                    <p className="text-sm font-semibold">{new Date(session.date).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex-1 border-l border-border/50 pl-4">
                                                    <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground mb-1">Time</p>
                                                    <p className="text-sm font-semibold">{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>

                                            {session.status === 'Pending Reschedule' && session.notes && (
                                                <div className="mt-3 text-xs italic text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2.5 rounded-lg border border-orange-100 dark:border-orange-900">
                                                    <span className="font-bold">Mentor Note:</span> {session.notes}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="pt-2 border-t border-border flex justify-end">
                                            {/* Action Triggers */}
                                            {session.status === 'Confirmed' ? (
                                                session.meetingUrl ? (
                                                    <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm gap-2">
                                                        <LinkIcon className="w-4 h-4" /> Join Video Call
                                                    </a>
                                                ) : (
                                                    <div className="w-full flex items-center justify-center py-2.5 bg-secondary text-muted-foreground font-bold rounded-xl border border-border gap-2 text-sm">
                                                        <LinkIcon className="w-4 h-4" /> Link Pending
                                                    </div>
                                                )
                                            ) : session.status === 'Pending Reschedule' ? (
                                                <div className="flex w-full gap-2">
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                await apiRequest(`/mentors/sessions/${session._id}/status`, { method: "PUT", body: JSON.stringify({ status: "Confirmed" }) });
                                                                setSessionsList(prev => prev.map(s => s._id === session._id ? { ...s, status: "Confirmed" } : s));
                                                            } catch (e) {}
                                                        }} 
                                                        className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors shadow-sm"
                                                    >Accept Time</button>
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                await apiRequest(`/mentors/sessions/${session._id}/status`, { method: "PUT", body: JSON.stringify({ status: "Cancelled" }) });
                                                                setSessionsList(prev => prev.filter(s => s._id !== session._id));
                                                            } catch (e) {}
                                                        }} 
                                                        className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors"
                                                    >Decline</button>
                                                </div>
                                            ) : (
                                                <div className="w-full py-2.5 bg-secondary/50 text-muted-foreground font-semibold rounded-xl text-center text-sm border border-border border-dashed">Waiting for Mentor Approval</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* MENTORSHIP RECORDS */}
                    {records.length > 0 ? (
                        <>
                            <h2 className="text-xl font-bold flex items-center gap-2 pt-4">
                                <Users className="w-5 h-5 text-blue-500" />
                                Shared Materials & Tasks
                            </h2>
                            {records.map(record => (
                                <Card key={record._id} className="overflow-hidden">
                            <CardHeader className="bg-secondary/30 border-b border-border pb-6 flex flex-row items-center gap-4 space-y-0">
                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                    {record.mentor?.avatar && <AvatarImage src={record.mentor.avatar} />}
                                    <AvatarFallback>{(record.mentor?.name || "M").slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-xl">{record.mentor?.name}</CardTitle>
                                    <CardDescription>Mentorship Record</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Assignments Column */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        Assignments
                                    </h3>
                                    {record.assignments?.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No assignments yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {record.assignments?.map((a: any) => (
                                                <div key={a._id} className={`p-4 border rounded-xl transition-colors ${a.status === 'completed' ? 'bg-secondary/50 border-border/50' : 'bg-background hover:border-primary/50 shadow-sm'}`}>
                                                    <div className="flex items-start gap-3">
                                                        <button
                                                            disabled={a.status === 'completed' || a.status === 'pending_review'}
                                                            onClick={() => handleCompleteAssignment(a._id)}
                                                            className="flex-shrink-0 mt-0.5 focus:outline-none disabled:opacity-80"
                                                        >
                                                            {a.status === 'completed' ? (
                                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                                            ) : a.status === 'pending_review' ? (
                                                                <Clock className="h-5 w-5 text-yellow-500" />
                                                            ) : (
                                                                <Circle className="h-5 w-5 text-slate-300 hover:text-green-500 transition-colors" />
                                                            )}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h4 className={`font-medium ${a.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                                    {a.title}
                                                                </h4>
                                                                {a.dueDate && (
                                                                    <Badge variant="outline" className={`ml-2 whitespace-nowrap ${new Date(a.dueDate) < new Date() && a.status !== 'completed' ? 'text-red-500 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30' : ''}`}>
                                                                        <Clock className="w-3 h-3 mr-1" />
                                                                        {format(new Date(a.dueDate), "MMM d")}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {a.description && (
                                                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                                    {a.description}
                                                                </p>
                                                            )}
                                                            {a.attachmentUrl && (
                                                                <a
                                                                    href={`http://localhost:3000${a.attachmentUrl}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2.5 py-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                    {a.attachmentName || "Download Attachment"}
                                                                </a>
                                                            )}
                                                            <div className="mt-3 flex gap-2">
                                                                {a.status === 'completed' && a.completedDate ? (
                                                                    <span className="text-xs text-green-600 font-medium">
                                                                        Completed on {format(new Date(a.completedDate), "MMM d, yyyy")}
                                                                    </span>
                                                                ) : a.status === 'pending_review' ? (
                                                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">Under Review</Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Resources Column */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-indigo-500" />
                                        Shared Resources
                                    </h3>
                                    {record.resources?.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No resources shared yet.</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {record.resources?.map((r: any) => (
                                                <a
                                                    key={r._id}
                                                    href={r.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block p-4 border rounded-xl bg-background hover:bg-secondary/50 hover:border-indigo-500/50 transition-all group shadow-sm"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors">
                                                            <LinkIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-medium text-foreground group-hover:text-indigo-600 transition-colors truncate">
                                                                {r.title}
                                                            </h4>
                                                            {r.description && (
                                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                    {r.description}
                                                                </p>
                                                            )}
                                                            <div className="mt-2 text-xs text-muted-foreground font-medium">
                                                                Added {format(new Date(r.sharedDate), "MMM d")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    </>
                    ) : (
                        <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed mt-4">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <h3 className="text-lg font-medium">No shared materials</h3>
                            <p className="text-muted-foreground mt-1 text-sm">You haven't been assigned any tasks or resources by a mentor yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
