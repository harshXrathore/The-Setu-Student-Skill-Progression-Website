import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { Loader2, ShieldAlert, CheckCircle, Clock, Trash, UserCheck, AlertTriangle } from "lucide-react";

interface Log {
    _id: string;
    adminId: {
        name: string;
        email: string;
    } | null;
    action: string;
    target: string;
    details: string;
    timestamp: string;
}

export function AuditLogViewer() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await apiRequest<Log[]>('/admin/audit-logs');
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'DELETE_USER': return <Trash className="size-4 text-red-500" />;
            case 'PROMOTE_ADMIN': return <ShieldAlert className="size-4 text-purple-500" />;
            case 'DEMOTE_ADMIN': return <ShieldAlert className="size-4 text-orange-500" />;
            case 'SYSTEM_UPDATE': return <AlertTriangle className="size-4 text-blue-500" />;
            default: return <Clock className="size-4 text-gray-500" />;
        }
    };

    const formatActionName = (action: string) => {
        return action.replace(/_/g, ' ');
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                        <tr>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Target Resource</th>
                            <th className="px-6 py-4">Admin User</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                    No audit logs found. System events will appear here.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-medium">
                                            {getActionIcon(log.action)}
                                            {formatActionName(log.action)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded inline-block">
                                            {log.target}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                {log.adminId?.name?.[0] || 'S'}
                                            </div>
                                            <span className="text-foreground">{log.adminId?.name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground max-w-xs truncate" title={log.details}>
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
