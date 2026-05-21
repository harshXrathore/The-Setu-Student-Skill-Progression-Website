import { Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface JobPreferencesSectionProps {
    profile: Profile;
    handleChange: (field: string, value: any) => void;
}

export function JobPreferencesSection({ profile, handleChange }: JobPreferencesSectionProps) {
    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={Target} title="Job Preferences" description="What kind of opportunities are you looking for?" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Desired Role</Label>
                        <Input
                            value={profile.preferences.desiredRole || ''}
                            onChange={(e) => handleChange('desiredRole', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Work Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={profile.preferences.workType || 'any'}
                            onChange={(e) => handleChange('workType', e.target.value)}
                        >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">On-site</option>
                            <option value="any">Any</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Employment Type</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={profile.preferences.employmentType || 'full-time'}
                            onChange={(e) => handleChange('employmentType', e.target.value)}
                        >
                            <option value="full-time">Full-time</option>
                            <option value="contract">Contract</option>
                            <option value="freelance">Freelance</option>
                            <option value="internship">Internship</option>
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
