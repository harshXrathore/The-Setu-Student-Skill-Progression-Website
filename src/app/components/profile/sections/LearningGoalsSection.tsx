import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface LearningGoalsSectionProps {
    profile: Profile;
    handleChange: (field: string, value: any) => void;
}

export function LearningGoalsSection({ profile, handleChange }: LearningGoalsSectionProps) {
    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={BookOpen} title="Learning Goals" description="What are you focusing on?" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Current Learning Focus</Label>
                    <Input
                        value={profile.learningGoals.focus || ''}
                        onChange={(e) => handleChange('focus', e.target.value)}
                        placeholder="e.g. Advanced Machine Learning"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Weekly Availability (Hours)</Label>
                    <Input
                        type="number"
                        value={profile.learningGoals.weeklyHours || ''}
                        onChange={(e) => handleChange('weeklyHours', parseInt(e.target.value) || 0)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
