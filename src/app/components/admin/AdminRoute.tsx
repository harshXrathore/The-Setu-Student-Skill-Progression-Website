import { Navigate } from "react-router-dom";
import { useProfile } from "../../context/profile-context";

export function AdminRoute({ children }: { children: React.ReactNode }) {
    const { profile, loading } = useProfile();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <span className="size-4 bg-primary rounded-full animate-pulse"></span>
                    <p className="text-muted-foreground text-sm">Verifying privileges...</p>
                </div>
            </div>
        );
    }

    // Check if user object exists and has isAdmin flag
    // We recently updated the backend to populate isAdmin
    const userRole = (profile as any).user?.isAdmin;

    // Check for explicit admin session (Sudo Mode)
    const hasAdminSession = sessionStorage.getItem('adminSessionActive');

    if (!userRole || !hasAdminSession) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
}
