import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { apiRequest } from "../lib/api";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    read: boolean;
    createdAt: string;
    link?: string;
}

export function NotificationDropdown() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await apiRequest<Notification[]>("/notifications");
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.read).length);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAllAsRead = async () => {
        try {
            await apiRequest("/notifications/read-all", { method: "PUT" });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const markAsReadAndNavigate = async (notif: Notification) => {
        if (!notif.read) {
            try {
                await apiRequest(`/notifications/${notif._id}/read`, { method: "PUT" });
                setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark as read", error);
            }
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full text-muted-foreground hover:bg-secondary/50 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] rounded-xl shadow-xl border-border/40 p-0 overflow-hidden mt-1">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/30">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                markAllAsRead();
                            }}
                            className="h-auto p-0 text-xs text-teal-600 hover:text-teal-700 hover:bg-transparent font-medium group"
                        >
                            <span className="group-hover:underline">Mark all as read</span>
                            <Check className="w-3.5 h-3.5 ml-1 opacity-70 group-hover:opacity-100" />
                        </Button>
                    )}
                </div>

                {/* Body */}
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin mb-2 opacity-50" />
                            <p className="text-sm">Loading notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-border/40">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => markAsReadAndNavigate(notification)}
                                    className={`px-4 py-3 flex items-start cursor-pointer gap-4 transition-colors hover:bg-secondary/50 ${!notification.read ? 'bg-teal-50/50 dark:bg-teal-900/10' : ''}`}
                                >
                                    <div className={`mt-1 size-2 rounded-full shrink-0 ${!notification.read ? 'bg-teal-500' : 'bg-transparent'}`} />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 pt-0.5">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="size-12 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
                                <Bell className="w-5 h-5 text-muted-foreground opacity-50" />
                            </div>
                            <p className="text-sm font-medium text-foreground">You're all caught up!</p>
                            <p className="text-xs text-muted-foreground mt-1">Check back later for new notifications.</p>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className="p-2 border-t border-border/40 bg-secondary/20">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/mentor-dashboard/notifications')}
                        className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground h-8 rounded-lg"
                    >
                        View All History
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
