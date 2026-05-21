import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Bell, Shield, Calendar, Mail, Check, AlertCircle } from "lucide-react";

type DayAvailability = {
    enabled: boolean;
    startTime: string;
    endTime: string;
};

type AvailabilityState = {
    [key: string]: DayAvailability;
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_AVAILABILITY: AvailabilityState = {
    Monday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    Tuesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    Wednesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    Thursday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    Friday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    Saturday: { enabled: false, startTime: "10:00", endTime: "14:00" },
    Sunday: { enabled: false, startTime: "10:00", endTime: "14:00" },
};

export function SettingsPage() {
    const [availability, setAvailability] = useState<AvailabilityState>(DEFAULT_AVAILABILITY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");

    // Fetch initial profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await apiRequest<any>('/profile/me');
                if (profile && profile.mentorDetails && profile.mentorDetails.availability) {
                    const loadedAvail = { ...DEFAULT_AVAILABILITY };
                    profile.mentorDetails.availability.forEach((dayData: any) => {
                        if (loadedAvail[dayData.day] && dayData.slots && dayData.slots.length > 0) {
                            loadedAvail[dayData.day] = {
                                enabled: true,
                                startTime: dayData.slots[0].startTime,
                                endTime: dayData.slots[0].endTime
                            };
                        }
                    });
                    setAvailability(loadedAvail);
                }
            } catch (err: any) {
                console.error("Failed to fetch profile settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleAvailabilityChange = (day: string, field: keyof DayAvailability, value: any) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSaveSchedule = async () => {
        setSaving(true);
        setError("");
        setSaveSuccess(false);

        // Convert UI state to API payload format
        const availabilityPayload = Object.entries(availability)
            .filter(([_, data]) => data.enabled)
            .map(([day, data]) => ({
                day,
                slots: [{ startTime: data.startTime, endTime: data.endTime }]
            }));

        try {
            await apiRequest('/profile', {
                method: 'PUT',
                body: JSON.stringify({
                    mentorDetails: {
                        availability: availabilityPayload
                    }
                })
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || "Failed to save schedule");
        } finally {
            setSaving(false);
        }
    };
    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>
                            Configure how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                <span>Email Notifications</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Receive specific emails about your account activity.
                                </span>
                            </Label>
                            <Switch id="email-notifs" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="review-notifs" className="flex flex-col space-y-1">
                                <span>Review Alerts</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Get notified when a student submits a task for review.
                                </span>
                            </Label>
                            <Switch id="review-notifs" defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Availability & Scheduling
                        </CardTitle>
                        <CardDescription>
                            Set your working hours and meeting availability.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {loading ? (
                            <div className="text-sm text-muted-foreground py-4 text-center">Loading your schedule...</div>
                        ) : (
                            <div className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm border border-destructive/20">
                                        <AlertCircle className="h-4 w-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Label>Working Hours</Label>
                                    <div className="space-y-3">
                                        {DAYS_OF_WEEK.map((day) => (
                                            <div key={day} className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border">
                                                <div className="w-32 flex items-center gap-2">
                                                    <Switch
                                                        checked={availability[day].enabled}
                                                        onCheckedChange={(c) => handleAvailabilityChange(day, 'enabled', c)}
                                                    />
                                                    <span className={`text-sm font-medium ${availability[day].enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {day}
                                                    </span>
                                                </div>

                                                {availability[day].enabled ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Input
                                                            type="time"
                                                            className="w-32 bg-background"
                                                            value={availability[day].startTime}
                                                            onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                                                        />
                                                        <span className="text-muted-foreground text-sm">to</span>
                                                        <Input
                                                            type="time"
                                                            className="w-32 bg-background"
                                                            value={availability[day].endTime}
                                                            onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">Unavailable</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {saveSuccess && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-500 font-medium">
                                    <Check className="h-4 w-4" /> Saved successfully
                                </span>
                            )}
                        </div>
                        <Button disabled={saving || loading} onClick={handleSaveSchedule}>
                            {saving ? "Saving..." : "Save Schedule"}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Privacy & Security
                        </CardTitle>
                        <CardDescription>
                            Manage your password and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="text-destructive hover:text-destructive">
                            Change Password
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
