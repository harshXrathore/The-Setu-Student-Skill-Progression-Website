import { Briefcase, GraduationCap, Shield } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { cn } from "../../ui/utils";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface OccupationSectionProps {
    profile: Profile;
    handleChange: (field: string, value: any) => void;
}

export function OccupationSection({ profile, handleChange }: OccupationSectionProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <SectionHeader icon={Briefcase} title="Occupation Details" description="Share your current professional status." />
                    <div className="flex items-center p-1 bg-muted rounded-lg w-fit">
                        {['student', 'mentor', 'professional'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleChange('role', r)}
                                className={cn(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize",
                                    profile.occupation.role === r ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {profile.occupation.role === "student" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="university">University / School</Label>
                            <div className="relative">
                                <GraduationCap className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="university"
                                    className="pl-9"
                                    value={profile.occupation.university || ''}
                                    onChange={(e) => handleChange('university', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="major">Major / Field of Study</Label>
                            <Input
                                id="major"
                                value={profile.occupation.major || ''}
                                onChange={(e) => handleChange('major', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="graduation">Graduation Year</Label>
                            <Input
                                id="graduation"
                                value={profile.occupation.graduationYear || ''}
                                onChange={(e) => handleChange('graduationYear', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gpa">Current GPA (Optional)</Label>
                            <Input
                                id="gpa"
                                value={profile.occupation.gpa || ''}
                                onChange={(e) => handleChange('gpa', e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                value={profile.occupation.jobTitle || ''}
                                onChange={(e) => handleChange('jobTitle', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <div className="relative">
                                <Shield className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="company"
                                    className="pl-9"
                                    value={profile.occupation.company || ''}
                                    onChange={(e) => handleChange('company', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
