import { useState, useEffect } from "react";
import { User, Briefcase, TrendingUp, GraduationCap, FolderOpen, Languages, Star } from "lucide-react";
import { Profile } from "../../../types/profile";
import { ProfileLayout } from "./ProfileLayout";
import { GeneralInfoSection } from "./sections/GeneralInfoSection";
import { OccupationSection } from "./sections/OccupationSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { EducationSection } from "./sections/EducationSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { LanguagesSection } from "./sections/LanguagesSection";
import { MentorDetailsSection } from "./sections/MentorDetailsSection";

const sections = [
    { id: "general", label: "General Info", icon: User },
    { id: "mentor-details", label: "Mentorship Settings", icon: Star },
    { id: "occupation", label: "Occupation", icon: Briefcase },
    { id: "experience", label: "Experience", icon: TrendingUp },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "portfolio", label: "Portfolio", icon: FolderOpen },
    { id: "languages", label: "Languages", icon: Languages },
];

interface MentorProfileProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    loading: boolean;
    onSave: () => void;
    handleNestedChange: (section: keyof Profile, field: string, value: any) => void;
}

export function MentorProfile({ profile, setProfile, loading, onSave, handleNestedChange }: MentorProfileProps) {
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
            title="Edit Mentor Profile"
            description="Manage your professional profile and mentorship details."
            loading={loading}
            onSave={onSave}
            activeSection={activeSection}
            scrollToSection={scrollToSection}
            sections={sections}
        >
            <div id="general" className="scroll-mt-24">
                <GeneralInfoSection profile={profile} handleChange={(field, value) => handleNestedChange('general', field, value)} />
            </div>
            <div id="mentor-details" className="scroll-mt-24">
                <MentorDetailsSection profile={profile} handleChange={(field, value) => handleNestedChange('mentorDetails', field, value)} />
            </div>
            <div id="occupation" className="scroll-mt-24">
                <OccupationSection profile={profile} handleChange={(field, value) => handleNestedChange('occupation', field, value)} />
            </div>
            <div id="experience" className="scroll-mt-24">
                <ExperienceSection profile={profile} setProfile={setProfile} />
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
