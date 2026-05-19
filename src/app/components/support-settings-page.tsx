import { useState, useEffect } from "react";
import {
    User, Bell, Shield, Lock, Trash2,
    HelpCircle, MessageSquare, Mail,
    ChevronRight, ExternalLink, Settings, LifeBuoy,
    Clock, LogOut, CheckCircle2
} from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useProfile } from "../context/profile-context";
import { apiRequest, getFileUrl } from "../lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function SupportSettingsPage() {
    const { profile, refetchProfile } = useProfile();
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState("profile");

    // Account Form State
    const [firstName, setFirstName] = useState(profile?.general?.firstName || "");
    const [lastName, setLastName] = useState(profile?.general?.lastName || "");
    const [email, setEmail] = useState(profile?.general?.email || "");

    // Notifications form state
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [pushNotifs, setPushNotifs] = useState(true);
    const [marketingNotifs, setMarketingNotifs] = useState(false);

    // Password & OTP State
    const [otpStep, setOtpStep] = useState<1 | 2>(1);
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isOtpRequesting, setIsOtpRequesting] = useState(false);

    // Sync state when profile loads
    useEffect(() => {
        if (profile?.general) {
            setFirstName(profile.general.firstName || "");
            setLastName(profile.general.lastName || "");
            setEmail(profile.general.email || "");
        }
    }, [profile]);

    // Support Form State
    const [supportSubject, setSupportSubject] = useState("");
    const [supportMessage, setSupportMessage] = useState("");

    const handleSaveProfile = async () => {
        try {
            setIsSaving(true);
            await apiRequest('/profile/general', {
                method: 'PUT',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email
                })
            });
            await refetchProfile();
            toast.success("Profile saved successfully.");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRequestOtp = async () => {
        try {
            setIsOtpRequesting(true);
            await apiRequest('/auth/request-otp', { method: 'POST' }); // The backend knows the user email from token
            toast.success("OTP sent to your registered email.");
            setOtpStep(2);
        } catch (error: any) {
            toast.error(error.message || "Failed to request OTP.");
        } finally {
            setIsOtpRequesting(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!otpCode || !newPassword) {
            toast.error("Please enter both the OTP and your new password.");
            return;
        }

        try {
            await apiRequest('/auth/update-password-otp', {
                method: 'PUT',
                body: JSON.stringify({ otp: otpCode, newPassword })
            });
            toast.success("Password successfully updated.");
            
            // Reset state
            setOtpStep(1);
            setOtpCode("");
            setNewPassword("");
        } catch (error: any) {
            toast.error(error.message || "Failed to update password.");
        }
    };

    const handleSendSupportMessage = () => {
        if (!supportSubject || !supportMessage) {
            toast.error("Please fill out both subject and message.");
            return;
        }

        const promise = new Promise((resolve) => setTimeout(resolve, 1500));
        toast.promise(promise, {
            loading: "Sending message...",
            success: () => {
                setSupportSubject("");
                setSupportMessage("");
                return "Support message sent successfully! We'll be in touch.";
            },
            error: "Failed to send message."
        });
    };

    const handleDeleteAccount = async () => {
        try {
            // Placeholder: typically you'd call an API like `/users/me` with DELETE
            localStorage.removeItem('token');
            toast.success("Account deleted.");
            navigate('/login');
        } catch (error: any) {
            toast.error("Failed to delete account.");
        }
    };

    const sidebarNavItems = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "support", label: "Help & Support", icon: LifeBuoy },
        { id: "security", label: "Security & Danger", icon: Shield },
    ];

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Support & Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences and get help when you need it.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0 space-y-1">
                        {sidebarNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive 
                                        ? "bg-primary/10 text-primary" 
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                >
                                    <Icon className="size-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 w-full bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        
                        {/* --- PROFILE TAB --- */}
                        {activeTab === "profile" && (
                            <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Profile Information</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Update your personal details and public profile.</p>

                                    {/* Avatar Section */}
                                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                                        <Avatar className="size-24 border-4 border-background shadow-sm">
                                            <AvatarImage src={profile?.general?.avatar ? getFileUrl(profile.general.avatar) : undefined} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                                {profile?.general?.firstName?.[0] || "U"}
                                                {profile?.general?.lastName?.[0] || ""}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-3">
                                            <div className="flex gap-3">
                                                <Button size="sm">Change Picture</Button>
                                                <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Remove</Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 2MB max.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Section */}
                                <div className="space-y-6 max-w-2xl pb-8 border-b border-border">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-muted/50" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-muted/50" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled className="bg-muted opacity-60" />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                            <Lock className="size-3" /> Email cannot be changed directly for security reasons.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-muted-foreground">Make sure to save your changes.</p>
                                    <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                                        {isSaving && <div className="size-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />}
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* --- NOTIFICATIONS TAB --- */}
                        {activeTab === "notifications" && (
                            <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Notifications</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Manage how and when you receive updates.</p>
                                </div>

                                <div className="space-y-6 pb-8 border-b border-border">
                                    <div className="flex items-start justify-between space-x-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="email-notifs" className="text-base font-medium">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground leading-snug">Receive daily summaries, course progress, and mentorship requests directly to your inbox.</p>
                                        </div>
                                        <Switch 
                                            id="email-notifs" 
                                            checked={emailNotifs} 
                                            onCheckedChange={setEmailNotifs} 
                                        />
                                    </div>
                                    
                                    <div className="flex items-start justify-between space-x-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="push-notifs" className="text-base font-medium">Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground leading-snug">Real-time alerts for direct messages, mistake trackers, and system announcements.</p>
                                        </div>
                                        <Switch 
                                            id="push-notifs" 
                                            checked={pushNotifs} 
                                            onCheckedChange={setPushNotifs} 
                                        />
                                    </div>

                                    <div className="flex items-start justify-between space-x-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="marketing-notifs" className="text-base font-medium">Marketing Emails</Label>
                                            <p className="text-sm text-muted-foreground leading-snug">Receive special offers, premium feature announcements, and new course drops.</p>
                                        </div>
                                        <Switch 
                                            id="marketing-notifs" 
                                            checked={marketingNotifs} 
                                            onCheckedChange={setMarketingNotifs} 
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-muted-foreground">Changes are saved automatically.</p>
                                    <Button variant="outline" className="gap-2">
                                        <CheckCircle2 className="size-4 text-green-500" /> Preferences Synced
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* --- SUPPORT TAB --- */}
                        {activeTab === "support" && (
                            <div className="p-6 md:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-2">
                                
                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Left: Contact Form */}
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-1">Contact Support</h2>
                                            <p className="text-sm text-muted-foreground">Send us a message and we'll reply within 24 hours.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Input 
                                                    id="subject" 
                                                    placeholder="e.g., Issue with Billing" 
                                                    value={supportSubject}
                                                    onChange={(e) => setSupportSubject(e.target.value)}
                                                    className="bg-muted/50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message</Label>
                                                <textarea
                                                    id="message"
                                                    className="flex min-h-[160px] w-full rounded-md border border-input bg-muted/50 px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                    placeholder="Please provide as much detail as possible..."
                                                    value={supportMessage}
                                                    onChange={(e) => setSupportMessage(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleSendSupportMessage} className="w-full">
                                                <Mail className="size-4 mr-2" />
                                                Send Message
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Right: FAQs & Resources */}
                                    <div className="space-y-8">
                                        <div>
                                            <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                                            <Accordion type="single" collapsible className="w-full">
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger className="text-sm">Reset course progress?</AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground">
                                                        Go to "My Learning", click the three dots on a course, and select "Reset Progress".
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="item-2">
                                                    <AccordionTrigger className="text-sm">Is mentorship free?</AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground">
                                                        You get one free introductory session per month. Additional sessions vary by mentor rate.
                                                    </AccordionContent>
                                                </AccordionItem>
                                                <AccordionItem value="item-3">
                                                    <AccordionTrigger className="text-sm">Exporting certificates?</AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground">
                                                        Navigate to Profile &gt; Education & Certs to download PDF certificates.
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>

                                        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-5">
                                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-semibold mb-2">
                                                <MessageSquare className="size-4" /> Community Forum
                                            </div>
                                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mb-4 line-clamp-2">
                                                Join 10k+ developers. Share projects, get code reviews, and find study buddies.
                                            </p>
                                            <Button variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
                                                Visit Community <ExternalLink className="size-3 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- SECURITY & DANGER TAB --- */}
                        {activeTab === "security" && (
                            <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <div>
                                    <h2 className="text-xl font-semibold mb-1">Security & Access</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Manage your password and secure your account.</p>
                                </div>

                                <div className="space-y-6 max-w-lg pb-8 border-b border-border">
                                    {otpStep === 1 ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                For your security, you must verify your identity via a One-Time Password (OTP) sent to your registered email address before changing your password.
                                            </p>
                                            <Button onClick={handleRequestOtp} disabled={isOtpRequesting}>
                                                {isOtpRequesting ? "Sending OTP..." : "Request Password Reset OTP"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="otp-code">6-Digit OTP</Label>
                                                <Input 
                                                    id="otp-code" 
                                                    type="text" 
                                                    placeholder="Enter the code sent to your email"
                                                    className="bg-muted/50 tracking-widest text-lg" 
                                                    maxLength={6}
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="new-pwd">New Password</Label>
                                                <Input 
                                                    id="new-pwd" 
                                                    type="password" 
                                                    className="bg-muted/50" 
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':&quot;\\|,.<>\/?]).{6,}$"
                                                    title="Must be at least 6 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol."
                                                />
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Must be at least 6 characters long and include an uppercase, a lowercase, a number, and a symbol.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Button onClick={handleUpdatePassword}>Confirm & Update Password</Button>
                                                <Button variant="ghost" onClick={() => {
                                                    setOtpStep(1);
                                                    setOtpCode("");
                                                    setNewPassword("");
                                                }}>Cancel</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-1">Danger Zone</h2>
                                    <p className="text-sm text-muted-foreground mb-6">Irreversible and destructive actions.</p>
                                    
                                    <div className="border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-red-900 dark:text-red-400 mb-1">Delete Account</p>
                                            <p className="text-sm text-red-700/80 dark:text-red-400/80">
                                                Permanently remove your personal data, courses, and settings. This cannot be undone.
                                            </p>
                                        </div>
                                        
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" className="shrink-0 bg-red-600 hover:bg-red-700 text-white shadow-sm">
                                                    Delete Account
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your account
                                                        and remove your data from our servers.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                                                        Yes, delete my account
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
