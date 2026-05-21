import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle2, Inbox } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { Button } from "../ui/button";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
    link?: string;
}

export function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await apiRequest<Notification[]>("/notifications");
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAllAsRead = async () => {
        try {
            await apiRequest("/notifications/read-all", { method: "PUT" });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiRequest(`/notifications/${id}/read`, { method: "PUT" });
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 animate-pulse text-teal-500/50" />
                    <p>Loading your notification history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Notifications History
                    </h1>
                    <p className="text-muted-foreground mt-1">Review your recent alerts and activity.</p>
                </div>
                {notifications.some(n => !n.read) && (
                    <Button
                        onClick={markAllAsRead}
                        className="bg-secondary/50 text-foreground hover:bg-secondary hover:text-teal-600 transition-colors border border-border/50"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden p-2">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-border/40">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                onClick={() => {
                                    if (!notif.read) markAsRead(notif._id);
                                    if (notif.link) {
                                        window.location.href = notif.link;
                                    }
                                }}
                                className={`group p-4 rounded-xl transition-all cursor-pointer flex items-start gap-4 hover:bg-secondary/50 ${!notif.read ? 'bg-teal-50/30 dark:bg-teal-900/10' : ''
                                    }`}
                            >
                                <div className={`shrink-0 mt-1 size-2 rounded-full transition-colors ${!notif.read ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-transparent'}`} />
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                                        <h4 className={`text-base flex-1 ${!notif.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground group-hover:text-foreground/80'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap shrink-0">
                                            {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {notif.message}
                                    </p>
                                    {notif.link && (
                                        <div className="pt-2">
                                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 group-hover:underline opacity-80 group-hover:opacity-100 transition-opacity">
                                                View Details &rarr;
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="size-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                            <Inbox className="w-8 h-8 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-1">No notifications yet</h3>
                        <p className="text-sm text-muted-foreground">When you get updates, they'll show up here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
