/**
 * StudentRecordTabs — Reusable Notes / Assignments / Resources CRM tabs component.
 *
 * Used by both:
 *  - student-record-dialog.tsx  (modal quick-view)
 *  - student-detail-page.tsx    (full-screen detail view)
 */
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { apiRequest } from "../../lib/api";
import { FileText, Link as LinkIcon, CheckCircle, Clock, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

interface StudentRecordTabsProps {
    studentId: string;
    /** Pre-loaded record data (optional). If not provided, the component fetches itself. */
    preloadedRecord?: any;
    /** Called after any successful mutation so the parent can refresh its own state */
    onRecordUpdate?: () => void;
}

export function StudentRecordTabs({ studentId, preloadedRecord, onRecordUpdate }: StudentRecordTabsProps) {
    const [record, setRecord] = useState<any>(preloadedRecord ?? null);
    const [loading, setLoading] = useState(!preloadedRecord);

    // Form state
    const [newNote, setNewNote] = useState("");
    const [assignmentTitle, setAssignmentTitle] = useState("");
    const [assignmentDesc, setAssignmentDesc] = useState("");
    const [assignmentDueDate, setAssignmentDueDate] = useState("");
    const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [resourceTitle, setResourceTitle] = useState("");
    const [resourceLink, setResourceLink] = useState("");
    const [resourceDesc, setResourceDesc] = useState("");

    const fetchRecord = async () => {
        if (!studentId) return;
        setLoading(true);
        try {
            const data = await apiRequest(`/mentors/students/${studentId}/record`);
            setRecord(data);
        } catch (err) {
            console.error("Failed to fetch CRM record", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (preloadedRecord) {
            setRecord(preloadedRecord);
        } else {
            fetchRecord();
        }
    }, [studentId, preloadedRecord]);

    const resetForms = () => {
        setNewNote("");
        setAssignmentTitle("");
        setAssignmentDesc("");
        setAssignmentDueDate("");
        setAssignmentFile(null);
        setResourceTitle("");
        setResourceLink("");
        setResourceDesc("");
    };

    const handleAddItem = async (type: "notes" | "assignments" | "resources", payload: any) => {
        if (!studentId) return;
        try {
            let finalPayload = { ...payload };

            if (type === "assignments" && assignmentFile) {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("attachment", assignmentFile);

                const token = localStorage.getItem("token");
                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Failed to upload attachment");

                const uploadData = await uploadRes.json();
                finalPayload.attachmentUrl = uploadData.attachmentUrl;
                finalPayload.attachmentName = uploadData.attachmentName;
            }

            await apiRequest(`/mentors/students/${studentId}/record/${type}`, {
                method: "POST",
                body: JSON.stringify(finalPayload),
            });

            resetForms();
            // Refresh local state
            await fetchRecord();
            // Notify parent if needed
            onRecordUpdate?.();
        } catch (err) {
            console.error(`Failed to add ${type}`, err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateAssignmentStatus = async (assignmentId: string, status: "completed" | "pending") => {
        if (!studentId) return;
        try {
            await apiRequest(`/mentors/assignments/${assignmentId}/status`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            await fetchRecord();
            onRecordUpdate?.();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    if (loading) {
        return <div className="py-8 text-center text-muted-foreground text-sm animate-pulse">Loading record...</div>;
    }

    if (!record) {
        return <div className="py-8 text-center text-muted-foreground text-sm">Failed to load record.</div>;
    }

    return (
        <Tabs defaultValue="notes" className="mt-4">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50 p-1">
                <TabsTrigger value="notes">
                    <FileText className="w-3.5 h-3.5 mr-1.5 inline-block" />
                    Private Notes
                </TabsTrigger>
                <TabsTrigger value="assignments">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5 inline-block" />
                    Assignments
                </TabsTrigger>
                <TabsTrigger value="resources">
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5 inline-block" />
                    Resources
                </TabsTrigger>
            </TabsList>

            {/* ────────────── NOTES TAB ────────────── */}
            <TabsContent value="notes" className="space-y-4">
                <div className="flex gap-2 mb-4">
                    <Textarea
                        placeholder="Add a private note about the student's progress..."
                        className="resize-none"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                    <Button
                        className="self-end"
                        onClick={() => handleAddItem("notes", { content: newNote })}
                        disabled={!newNote}
                    >
                        Save
                    </Button>
                </div>
                <div className="space-y-3">
                    {record.notes?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No notes yet.</p>
                    )}
                    {record.notes?.map((n: any, i: number) => (
                        <div key={i} className="p-3 bg-secondary/20 border border-border rounded-lg text-sm">
                            <p className="whitespace-pre-wrap">{n.content}</p>
                            <div className="mt-2 text-xs text-muted-foreground text-right">
                                {format(new Date(n.date), "MMM d, yyyy h:mm a")}
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>

            {/* ────────────── ASSIGNMENTS TAB ────────────── */}
            <TabsContent value="assignments" className="space-y-4">
                <div className="bg-secondary/20 border border-border p-4 rounded-lg space-y-3 mb-6">
                    <h4 className="text-sm font-semibold">Assign Task</h4>
                    <Input
                        placeholder="Task Title"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                    />
                    <Textarea
                        placeholder="Description / Instructions"
                        className="resize-none text-sm"
                        value={assignmentDesc}
                        onChange={(e) => setAssignmentDesc(e.target.value)}
                    />
                    <div className="flex gap-3 flex-wrap">
                        <Input
                            type="date"
                            value={assignmentDueDate}
                            onChange={(e) => setAssignmentDueDate(e.target.value)}
                            className="text-sm flex-1 min-w-[130px]"
                        />
                        <Input
                            type="file"
                            onChange={(e) => setAssignmentFile(e.target.files ? e.target.files[0] : null)}
                            className="text-sm flex-[2] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            accept=".pdf,.doc,.docx,.txt,.zip"
                        />
                        <Button
                            onClick={() =>
                                handleAddItem("assignments", {
                                    title: assignmentTitle,
                                    description: assignmentDesc,
                                    dueDate: assignmentDueDate,
                                })
                            }
                            disabled={!assignmentTitle || isUploading}
                        >
                            {isUploading ? "Uploading..." : "Assign"}
                        </Button>
                    </div>
                </div>

                <h4 className="text-sm font-semibold text-foreground">Sent Assignments</h4>
                <div className="space-y-3">
                    {record.assignments?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No assignments yet.</p>
                    )}
                    {record.assignments?.map((a: any, i: number) => (
                        <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                            {a.status === "completed" ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : (
                                <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h5 className="font-medium text-sm">{a.title}</h5>
                                    {a.dueDate && (
                                        <span className="text-xs text-muted-foreground">
                                            Due: {format(new Date(a.dueDate), "MMM d")}
                                        </span>
                                    )}
                                </div>
                                {a.description && (
                                    <p className="text-xs text-slate-500 mt-1">{a.description}</p>
                                )}
                                {a.attachmentUrl && (
                                    <a
                                        href={`${API_URL}${a.attachmentUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {a.attachmentName || "Download Attachment"}
                                    </a>
                                )}
                                <div className="mt-2 flex gap-2 items-center">
                                    <Badge
                                        variant={a.status === "completed" ? "default" : "secondary"}
                                        className={
                                            a.status === "completed"
                                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                : a.status === "pending_review" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""
                                        }
                                    >
                                        {a.status === 'pending_review' ? 'PENDING REVIEW' : a.status.toUpperCase()}
                                    </Badge>
                                    {a.completedDate && (
                                        <span className="text-[10px] text-muted-foreground">
                                            Done on: {format(new Date(a.completedDate), "MMM d")}
                                        </span>
                                    )}
                                </div>
                                {a.status === 'pending_review' && (
                                    <div className="mt-3 flex gap-2 border-t pt-3">
                                        <Button size="sm" onClick={() => handleUpdateAssignmentStatus(a._id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white h-7 py-0 text-xs px-3">Approve & Give XP</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleUpdateAssignmentStatus(a._id, 'pending')} className="h-7 py-0 text-xs px-3 border-orange-200 text-orange-700 hover:bg-orange-50 bg-white shadow-sm">Request Revision</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>

            {/* ────────────── RESOURCES TAB ────────────── */}
            <TabsContent value="resources" className="space-y-4">
                <div className="bg-secondary/20 border border-border p-4 rounded-lg space-y-3 mb-6">
                    <h4 className="text-sm font-semibold">Share Resource</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Resource Title"
                            value={resourceTitle}
                            onChange={(e) => setResourceTitle(e.target.value)}
                        />
                        <Input
                            placeholder="URL (https://...)"
                            value={resourceLink}
                            onChange={(e) => setResourceLink(e.target.value)}
                        />
                    </div>
                    <Textarea
                        placeholder="Short description or why it's useful..."
                        className="resize-none text-sm h-16"
                        value={resourceDesc}
                        onChange={(e) => setResourceDesc(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={() =>
                                handleAddItem("resources", {
                                    title: resourceTitle,
                                    link: resourceLink,
                                    description: resourceDesc,
                                })
                            }
                            disabled={!resourceTitle || !resourceLink}
                        >
                            Share Link
                        </Button>
                    </div>
                </div>

                <h4 className="text-sm font-semibold text-foreground">Shared Resources</h4>
                <div className="space-y-3">
                    {record.resources?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No resources shared.</p>
                    )}
                    {record.resources?.map((r: any, i: number) => (
                        <div key={i} className="p-3 border rounded-lg flex items-start gap-3">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                <LinkIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <a
                                    href={r.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sm text-primary hover:underline truncate block"
                                >
                                    {r.title}
                                </a>
                                {r.description && (
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.description}</p>
                                )}
                                <div className="mt-1 text-[10px] text-muted-foreground">
                                    Shared on: {format(new Date(r.sharedDate), "MMM d, yyyy")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
    );
}
