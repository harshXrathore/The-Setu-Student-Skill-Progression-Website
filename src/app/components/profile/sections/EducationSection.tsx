import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface EducationSectionProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

export function EducationSection({ profile, setProfile }: EducationSectionProps) {
    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { school: 'New School', degree: '' }]
        }));
    };

    const removeEducation = (index: number) => {
        setProfile(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: string, value: any) => {
        const newEdu = [...profile.education];
        (newEdu[index] as any)[field] = value;
        setProfile(prev => ({ ...prev, education: newEdu }));
    };

    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={GraduationCap} title="Education" description="Your academic background." />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Schools</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={addEducation}
                        >
                            <Plus className="h-3 w-3" /> Add
                        </Button>
                    </div>
                    {profile.education?.map((edu, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3 mr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                            placeholder="School Name"
                                            value={edu.school}
                                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Field of Study"
                                        value={edu.fieldOfStudy || ''}
                                        onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeEducation(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {profile.education?.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No education added yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
