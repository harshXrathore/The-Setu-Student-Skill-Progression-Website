import { useState, useEffect } from "react";
import { Send, Info, AlertTriangle, CheckCircle, Megaphone, Loader2, History, Clock } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { toast } from "sonner";

export function BroadcastCenter() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"info" | "warning" | "success">("info");
    const [targetRole, setTargetRole] = useState("all");
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const logs = await apiRequest<any[]>('/admin/audit-logs');
            if (Array.isArray(logs)) {
                const broadcasts = logs.filter(log => log.action === 'BROADCAST_SENT');
                setHistory(broadcasts);
            } else {
                console.error("Audit logs response is not an array:", logs);
                setHistory([]);
            }
        } catch (error) {
            console.error("Failed to load history");
        }
    };

    const handleSend = async () => {
        if (!title || !message) {
            toast.error("Please fill in both title and message");
            return;
        }

        if (!confirm("Are you sure you want to send this to ALL users? This cannot be undone.")) {
            return;
        }

        setSending(true);
        try {
            await apiRequest('/admin/broadcast', {
                method: 'POST',
                body: JSON.stringify({ title, message, type, targetRole })
            });
            toast.success("Broadcast sent successfully!");
            setTitle("");
            setMessage("");
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error(error);
            toast.error("Failed to send broadcast");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
            {/* Composer */}
            <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Megaphone className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Compose Broadcast</h3>
                            <p className="text-sm text-muted-foreground">Send a system-wide notification to all users.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Notification Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Scheduled Maintenance"
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Target Audience</label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            >
                                <option value="all">All Users</option>
                                <option value="student">Students Only</option>
                                <option value="mentor">Mentors Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Message Body</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                placeholder="Write your message here..."
                                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1.5 block">Notification Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                <TypeButton
                                    current={type}
                                    value="info"
                                    label="Information"
                                    icon={<Info className="size-4" />}
                                    onClick={() => setType("info")}
                                />
                                <TypeButton
                                    current={type}
                                    value="warning"
                                    label="Warning"
                                    icon={<AlertTriangle className="size-4" />}
                                    onClick={() => setType("warning")}
                                />
                                <TypeButton
                                    current={type}
                                    value="success"
                                    label="Success"
                                    icon={<CheckCircle className="size-4" />}
                                    onClick={() => setType("success")}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSend}
                                disabled={sending || !title || !message}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                {sending ? "Sending to all users..." : "Broadcast Message"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full bg-slate-50/50 dark:bg-slate-900/20 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 text-muted-foreground">User Preview</h3>

                    <div className="flex-1 flex items-center justify-center p-8">
                        {/* Mock Notification Card */}
                        <div className="w-full max-w-sm bg-background rounded-lg border border-border shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className={`h-1 w-full ${type === 'info' ? 'bg-blue-500' :
                                type === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                                }`} />
                            <div className="p-4 flex gap-4">
                                <div className={`shrink-0 p-2 rounded-full self-start ${type === 'info' ? 'bg-blue-100 text-blue-600' :
                                    type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                    {type === 'info' && <Info className="size-5" />}
                                    {type === 'warning' && <AlertTriangle className="size-5" />}
                                    {type === 'success' && <CheckCircle className="size-5" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm leading-none">
                                        {title || "Notification Title"}
                                    </p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {message || "This is how the message will appear to your users. It uses a clean, readable typography to ensure engagement."}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground pt-2">Just now</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-muted-foreground mt-4">
                        This checks what users will see in their notification dropdown.
                    </div>
                </div>

                {/* History */}
                <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <History className="size-4 text-muted-foreground" />
                        <h3 className="font-bold text-lg">Recent Broadcasts</h3>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No broadcasts sent yet.</p>
                        ) : (
                            history.map((log: any) => (
                                <div key={log._id} className="p-3 bg-secondary/30 rounded-lg text-sm border border-border">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium">
                                            {log.details ? (log.details.split(': ')[1] || "Notification") : "Notification"}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">{log.details || "No details"}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-primary">
                                        <CheckCircle className="size-3" />
                                        Sent by {log.adminId?.name || "Admin"}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function TypeButton({ current, value, label, icon, onClick }: any) {
    const isActive = current === value;
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${isActive
                ? "bg-primary/5 border-primary text-primary"
                : "bg-background border-border text-muted-foreground hover:bg-secondary"
                }`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}
