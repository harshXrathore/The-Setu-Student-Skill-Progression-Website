import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface ExperienceSectionProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

export function ExperienceSection({ profile, setProfile }: ExperienceSectionProps) {
    const addExperience = () => {
        setProfile(prev => ({
            ...prev,
            experience: [...prev.experience, { title: 'New Position', company: '', startDate: '', current: false }]
        }));
    };

    const removeExperience = (index: number) => {
        setProfile(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index)
        }));
    };

    const updateExperience = (index: number, field: string, value: any) => {
        const newExp = [...profile.experience];
        (newExp[index] as any)[field] = value;
        setProfile(prev => ({ ...prev, experience: newExp }));
    };

    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={TrendingUp} title="Work Experience" description="Your professional history." />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Positions</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={addExperience}
                        >
                            <Plus className="h-3 w-3" /> Add
                        </Button>
                    </div>
                    {profile.experience?.map((exp, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3 mr-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Job Title"
                                            value={exp.title}
                                            onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Company"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Start Date"
                                            value={exp.startDate || ''}
                                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="End Date"
                                                value={exp.endDate || ''}
                                                disabled={exp.current}
                                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                            />
                                            <div className="flex items-center space-x-2 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    id={`current-${index}`}
                                                    checked={exp.current || false}
                                                    onChange={(e) => {
                                                        const newExp = [...profile.experience];
                                                        newExp[index].current = e.target.checked;
                                                        if (e.target.checked) newExp[index].endDate = '';
                                                        setProfile(p => ({ ...p, experience: newExp }));
                                                    }}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor={`current-${index}`} className="text-xs">Current</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Textarea
                                        placeholder="Description"
                                        value={exp.description || ''}
                                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeExperience(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {profile.experience?.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No experience added yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
