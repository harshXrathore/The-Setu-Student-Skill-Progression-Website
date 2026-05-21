import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import { Save, Lock, UserPlus, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "../ui/switch";

// Create a simple internal Switch component if the one imported doesn't exist or isn't compatible
// But assuming standard shadcn/ui or similar pattern, we'll try to use standard HTML checkbox if needed
// For now, I'll build a custom toggle to be safe and dependency-free

function Toggle({ checked, onChange, label, description }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
            <div className="space-y-0.5">
                <label className="text-sm font-medium">{label}</label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

export function SystemSettings() {
    const [settings, setSettings] = useState<any>({
        maintenanceMode: false,
        allowRegistrations: true,
        supportEmail: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await apiRequest('/admin/settings');
            setSettings(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await apiRequest('/admin/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });
            setSettings(updated);
            toast.success("System settings updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Lock className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Access Control</h3>
                        <p className="text-sm text-muted-foreground">Manage global access and registration policies.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Toggle
                        label="Maintenance Mode"
                        description="If enabled, only Admins can access the platform. Useful for updates."
                        checked={settings.maintenanceMode}
                        onChange={(val: boolean) => setSettings({ ...settings, maintenanceMode: val })}
                    />

                    <Toggle
                        label="Allow New Registrations"
                        description="If disabled, the sign-up page will reject new users."
                        checked={settings.allowRegistrations}
                        onChange={(val: boolean) => setSettings({ ...settings, allowRegistrations: val })}
                    />
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Mail className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Support Configuration</h3>
                        <p className="text-sm text-muted-foreground">Contact details displayed to users.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1.5 block">Global Support Email</label>
                        <input
                            type="email"
                            value={settings.supportEmail}
                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="support@careerpath.ai"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25"
                >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    {saving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
}
