import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, Circle, Mail, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { apiRequest } from "../../lib/api";
import { StudentRecordTabs } from "./student-record-tabs";

/**
 * Full-screen deep-dive view for a single student.
 *
 * Fixes applied:
 * ✅ N+1 eliminated — fetches GET /mentors/students/:id instead of the whole roster
 * ✅ Hardcoded localhost:3000 moved to VITE_API_URL (inside StudentRecordTabs)
 * ✅ Notes/Assignments/Resources extracted into <StudentRecordTabs> — no duplication
 */
export function StudentDetailsPage() {
    const { id: studentId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [studentInfo, setStudentInfo] = useState<any>(null);
    const [roadmapData, setRoadmapData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            // ✅ Fix #2: Single targeted API call — no more N+1 full-roster fetch
            const student = await apiRequest<any>(`/mentors/students/${studentId}`);
            setStudentInfo(student);

            // Fetch roadmap (separate concern — kept parallel-compatible)
            try {
                const roadmap = await apiRequest(`/mentors/students/${studentId}/roadmap`);
                setRoadmapData(roadmap);
            } catch {
                setRoadmapData({ error: "No roadmap generated yet." });
            }
        } catch (error) {
            console.error("Failed to fetch student details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
            case "verified":
                return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />;
            case "in-progress":
                return <Clock className="h-4 w-4 text-blue-500 mt-0.5" />;
            default:
                return <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />;
        }
    };

    if (loading) {
        return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading student details...</div>;
    }

    if (!studentInfo) {
        return (
            <div className="py-20 text-center space-y-4">
                <p className="text-muted-foreground">Student not found or access denied.</p>
                <Button variant="outline" onClick={() => navigate("/mentor-dashboard/students")}>
                    Back to My Students
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300 pb-10">
            {/* Header: Top Navigation */}
            <div className="flex justify-between items-center px-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground -ml-2"
                    onClick={() => navigate("/mentor-dashboard/students")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Students
                </Button>
            </div>

            {/* Header: Student Profile Banner */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mt-2">
                <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
                <div className="px-6 pb-6 relative">
                    <div className="flex flex-col sm:flex-row gap-6 -mt-12 items-end">
                        <Avatar className="w-24 h-24 border-4 border-background bg-card shadow-sm shrink-0">
                            {studentInfo.avatar && <AvatarImage src={studentInfo.avatar} />}
                            <AvatarFallback className="text-2xl">
                                {(studentInfo.name || "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1 mb-1 min-w-0">
                            <h1 className="text-2xl font-bold truncate">{studentInfo.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                                <span className="truncate">{studentInfo.email}</span>
                                <span>•</span>
                                <span className="font-medium text-foreground capitalize whitespace-nowrap">
                                    Focus: {studentInfo.focus}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 mb-1 shrink-0">
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Message
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center gap-2">
                                <Mail className="w-4 h-4" /> Email
                            </Button>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-semibold">{studentInfo.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${studentInfo.progress}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-center space-y-1 md:pl-6 md:border-l border-border mt-4 md:mt-0">
                            <span className="text-sm text-muted-foreground">Last Session Activity</span>
                            <span className="font-medium">
                                {new Date(studentInfo.lastActive).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="roadmap" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-xs bg-secondary/50 p-1 rounded-lg">
                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                    <TabsTrigger value="record">CRM Record</TabsTrigger>
                </TabsList>

                {/* ROADMAP TAB */}
                <TabsContent value="roadmap" className="mt-6">
                    <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
                        {roadmapData?.error ? (
                            <div className="text-center py-12 bg-destructive/5 rounded-lg border border-destructive/20">
                                <div className="max-w-md mx-auto space-y-2">
                                    <h3 className="text-lg font-medium text-destructive">No Roadmap Setup</h3>
                                    <p className="text-sm text-muted-foreground">{roadmapData.error}</p>
                                </div>
                            </div>
                        ) : roadmapData ? (
                            <div className="space-y-8">
                                <div className="space-y-2 border-b pb-6">
                                    <h2 className="text-xl font-bold">{roadmapData.title}</h2>
                                    <p className="text-muted-foreground">{roadmapData.goal}</p>
                                </div>

                                <div className="space-y-8">
                                    {roadmapData.roadmapPhases?.map((phase: any, index: number) => (
                                        <div
                                            key={index}
                                            className="bg-background rounded-xl border border-border overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between p-4 bg-secondary/30 border-b border-border">
                                                <h3 className="font-semibold text-base">{phase.phase}</h3>
                                                <Badge variant="secondary" className="font-medium">
                                                    {phase.duration}
                                                </Badge>
                                            </div>

                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {phase.skills?.map((skill: any, sIdx: number) => (
                                                    <div
                                                        key={sIdx}
                                                        className="flex items-start gap-3 p-3 bg-secondary/10 hover:bg-secondary/30 rounded-lg transition-colors border border-transparent hover:border-border"
                                                    >
                                                        {getStatusIcon(skill.status)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between gap-2">
                                                                <p
                                                                    className={`text-sm font-semibold truncate ${["completed", "verified"].includes(skill.status)
                                                                        ? "line-through text-muted-foreground"
                                                                        : "text-foreground"
                                                                        }`}
                                                                >
                                                                    {skill.name}
                                                                </p>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] uppercase font-bold tracking-wider shrink-0 bg-background"
                                                                >
                                                                    {skill.status}
                                                                </Badge>
                                                            </div>
                                                            <div className="mt-1.5 flex items-center text-xs text-muted-foreground font-medium">
                                                                <Clock className="w-3 h-3 mr-1 opacity-70" /> {skill.hours} hours estimated
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </TabsContent>

                {/* CRM RECORD TAB — uses shared StudentRecordTabs */}
                <TabsContent value="record" className="mt-6">
                    {studentId && (
                        <StudentRecordTabs
                            studentId={studentId}
                            onRecordUpdate={fetchData}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
