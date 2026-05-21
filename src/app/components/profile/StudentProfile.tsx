import { useState, useEffect } from "react";
import { User, Briefcase, BookOpen, Target, GraduationCap, FolderOpen, Languages, Globe } from "lucide-react";
import { Profile } from "../../../types/profile";
import { ProfileLayout } from "./ProfileLayout";
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { OccupationSection } from "./sections/OccupationSection";
import { LearningGoalsSection } from "./sections/LearningGoalsSection";
import { JobPreferencesSection } from "./sections/JobPreferencesSection";
import { EducationSection } from "./sections/EducationSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { LanguagesSection } from "./sections/LanguagesSection";

const sections = [
    { id: "general", label: "General Info", icon: User },
    { id: "occupation", label: "Occupation", icon: Briefcase },
    { id: "learning", label: "Learning Goals", icon: BookOpen },
    { id: "job-preferences", label: "Job Preferences", icon: Target },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "languages", label: "Languages", icon: Languages },
];

interface StudentProfileProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    loading: boolean;
    onSave: () => void;
    handleNestedChange: (section: keyof Profile, field: string, value: any) => void;
}

export function StudentProfile({ profile, setProfile, loading, onSave, handleNestedChange }: StudentProfileProps) {
    const [activeSection, setActiveSection] = useState("general");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
        );

        sections.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveSection(id);
        }
    };

    return (
        <ProfileLayout
            title="Edit Student Profile"
            description="Manage your academic journey and career goals."
            loading={loading}
            onSave={onSave}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            sections={sections}
        >
            <div id="general" className="scroll-mt-24">
                <GeneralInfoSection profile={profile} handleChange={(field, value) => handleNestedChange('general', field, value)} />
            </div>
            <div id="occupation" className="scroll-mt-24">
                <OccupationSection profile={profile} handleChange={(field, value) => handleNestedChange('occupation', field, value)} />
            </div>
            <div id="learning" className="scroll-mt-24">
                <LearningGoalsSection profile={profile} handleChange={(field, value) => handleNestedChange('learningGoals', field, value)} />
            </div>
            <div id="job-preferences" className="scroll-mt-24">
                <JobPreferencesSection profile={profile} handleChange={(field, value) => handleNestedChange('preferences', field, value)} />
            </div>
            <div id="education" className="scroll-mt-24">
                <EducationSection profile={profile} setProfile={setProfile} />
            </div>
            <div id="portfolio" className="scroll-mt-24">
                <PortfolioSection profile={profile} setProfile={setProfile} />
            </div>
            <div id="languages" className="scroll-mt-24">
                <LanguagesSection profile={profile} setProfile={setProfile} />
            </div>
        </ProfileLayout>
    );
}
