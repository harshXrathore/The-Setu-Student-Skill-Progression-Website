import { FolderOpen, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface PortfolioSectionProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

export function PortfolioSection({ profile, setProfile }: PortfolioSectionProps) {
    const addProject = () => {
        setProfile(prev => ({
            ...prev,
            projects: [...prev.projects, { title: 'New Project', description: '' }]
        }));
    };

    const removeProject = (index: number) => {
        setProfile(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const updateProject = (index: number, field: string, value: any) => {
        const newProj = [...profile.projects];
        (newProj[index] as any)[field] = value;
        setProfile(prev => ({ ...prev, projects: newProj }));
    };

    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={FolderOpen} title="Portfolio / Projects" description="Showcase your best work." />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Projects</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={addProject}
                        >
                            <Plus className="h-3 w-3" /> Add
                        </Button>
                    </div>
                    {profile.projects?.map((proj, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3 mr-4">
                                    <Input
                                        placeholder="Project Title"
                                        value={proj.title}
                                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={proj.description || ''}
                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Project URL"
                                        value={proj.url || ''}
                                        onChange={(e) => updateProject(index, 'url', e.target.value)}
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => removeProject(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {profile.projects?.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No projects added yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
