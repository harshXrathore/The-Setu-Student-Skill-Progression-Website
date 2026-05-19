import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "../lib/api";
import { useProfile } from "../context/profile-context";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { refetchProfile } = useProfile();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const adminSession = sessionStorage.getItem('adminSessionActive');
        if (token && adminSession) {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Standard Login
            const data = await apiRequest<{ token: string }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // 2. Store Token & Set Admin Session Flag
            localStorage.setItem('authToken', data.token);
            sessionStorage.setItem('adminSessionActive', 'true');

            // 3. Verify Admin Status via Auth (Direct Check)
            try {
                const user = await apiRequest<any>('/auth/me');

                if (!user || !user.isAdmin) {
                    localStorage.removeItem('authToken');
                    setError("Access Denied: You do not have administrator privileges.");
                    setLoading(false);
                    return;
                }

                // 4. Ensure Profile Exists (Auto-create if missing to prevents redirects)
                try {
                    await apiRequest('/profile/me');
                } catch (profileError) {
                    // console.log("Profile missing for admin, creating default...");
                    await apiRequest('/profile', {
                        method: 'POST',
                        body: JSON.stringify({
                            general: { bio: "System Administrator" },
                            occupation: {
                                role: "professional",
                                company: "CareerPath AI",
                                jobTitle: "System Admin"
                            }
                        })
                    });
                }

                // 5. Sync Context & Redirect
                await refetchProfile();
                toast.success("Welcome back, Administrator");
                navigate('/admin');

            } catch (authError) {
                console.error("Auth check failed", authError);
                localStorage.removeItem('authToken');
                setError("Authentication validation failed");
            }

        } catch (err: any) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

            {/* Header / Logo Section */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <GraduationCap className="size-8 text-foreground" />
                    <span className="text-2xl font-bold tracking-tight text-foreground">The-Setu (Admin Panel)</span>
                </div>
                <h2 className="text-muted-foreground text-sm font-medium">Welcome back Admin! Please login to your account.</h2>
            </div>

            {/* Main Login Card */}
            <Card className="w-full max-w-[440px] shadow-lg border-border/40 animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="space-y-1 pb-6">
                    <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm font-medium">
                            <AlertCircle className="size-4" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-9 bg-secondary/30 border-border focus:bg-background transition-colors h-11"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="pl-9 pr-10 bg-secondary/30 border-border focus:bg-background transition-colors h-11"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">Remember me</Label>
                            </div>
                            <Link to="#" className="text-sm font-bold text-foreground hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base shadow-sm !rounded-lg"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                </CardContent>
            </Card>

            <div className="mt-8">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
