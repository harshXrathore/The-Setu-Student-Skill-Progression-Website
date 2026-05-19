import { Languages, Trash2, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";

interface LanguagesSectionProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

export function LanguagesSection({ profile, setProfile }: LanguagesSectionProps) {
    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={Languages} title="Languages" description="Languages you speak." />
            </CardHeader>
            <CardContent className="space-y-4">
                {profile.languages?.map((lang, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <Input
                            placeholder="Language"
                            value={lang.language}
                            onChange={(e) => {
                                const newLang = [...profile.languages];
                                newLang[index].language = e.target.value;
                                setProfile(p => ({ ...p, languages: newLang }));
                            }}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setProfile(p => ({
                                    ...p,
                                    languages: p.languages.filter((_, i) => i !== index)
                                }));
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfile(p => ({ ...p, languages: [...p.languages, { language: '' }] }))}
                >
                    <Plus className="h-3 w-3 mr-2" /> Add Language
                </Button>
            </CardContent>
        </Card>
    );
}
