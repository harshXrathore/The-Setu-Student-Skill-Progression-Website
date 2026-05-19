import { Star, Clock, Tags } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";
import { useState } from "react";
import { Plus, X } from "lucide-react";

interface MentorDetailsSectionProps {
    profile: Profile;
    handleChange: (field: string, value: any) => void;
}

export function MentorDetailsSection({ profile, handleChange }: MentorDetailsSectionProps) {
    // Extract safely
    const mDetails = profile.mentorDetails || {};
    const [newSpecialty, setNewSpecialty] = useState("");

    // Default to an empty array so map doesn't crash
    const specialties = Array.isArray(mDetails.specialties) ? mDetails.specialties : [];

    const handleAddSpecialty = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSpecialty.trim() !== '') {
            e.preventDefault();
            if (!specialties.includes(newSpecialty.trim())) {
                handleChange('specialties', [...specialties, newSpecialty.trim()]);
            }
            setNewSpecialty("");
        }
    };

    const handleRemoveSpecialty = (skillToRemove: string) => {
        handleChange('specialties', specialties.filter((s: string) => s !== skillToRemove));
    };

    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={Star} title="Mentorship Settings" description="Configure how you mentor and present your public profile to students." />
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hourly Rate */}
                    <div className="space-y-2">
                        <Label htmlFor="rate">Session Rate (e.g., "$50/hr" or "Free")</Label>
                        <Input
                            id="rate"
                            placeholder="$50/hr"
                            value={mDetails.rate || ''}
                            onChange={(e) => handleChange('rate', e.target.value)}
                        />
                    </div>

                    {/* Availability Status */}
                    <div className="space-y-2">
                        <Label htmlFor="availabilityStatus">Current Availability Status</Label>
                        <select
                            id="availabilityStatus"
                            value={mDetails.availabilityStatus || 'Available'}
                            onChange={(e) => handleChange('availabilityStatus', e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="Available">Available (Accepting new students)</option>
                            <option value="Limited">Limited (Few slots remaining)</option>
                            <option value="Booked">Booked (Taking a waitlist)</option>
                            <option value="Unavailable">Unavailable (Not taking sessions)</option>
                        </select>
                    </div>
                </div>

                {/* Specialties Tag Input */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                    <div>
                        <Label htmlFor="specialties" className="flex items-center gap-2">
                            <Tags className="w-4 h-4 text-teal-500" />
                            Your Specialties
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1 mb-3">
                            Type a skill (e.g., React, System Design, Career Advice) and press Enter to add it.
                        </p>
                    </div>

                    {/* Tags Display */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {specialties.map((skill: string, index: number) => (
                            <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium border border-teal-500/20">
                                {skill}
                                <button
                                    onClick={() => handleRemoveSpecialty(skill)}
                                    className="p-0.5 hover:bg-teal-500/20 rounded-full transition-colors ml-1 focus:outline-none"
                                    type="button"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="relative">
                        <Input
                            id="specialties"
                            placeholder="Add a new specialty..."
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            onKeyDown={handleAddSpecialty}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => handleAddSpecialty({ key: 'Enter', preventDefault: () => { } } as any)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
