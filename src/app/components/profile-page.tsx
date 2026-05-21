import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import { Profile, initialProfile } from "../../types/profile";
import { toast } from "sonner";
import { useProfile } from "../context/profile-context";
import { StudentProfile } from "./profile/StudentProfile";
import { MentorProfile } from "./profile/MentorProfile";

export function ProfilePage() {
    const { refetchProfile } = useProfile();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [fetching, setFetching] = useState(true);

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiRequest<Profile>('/profile/me');

                // Force role from localStorage if available to ensure correct view
                const storedRole = localStorage.getItem("userRole");
                const profileData = { ...initialProfile, ...data };

                if (storedRole) {
                    const normalizedRole = storedRole.toLowerCase() as 'mentor' | 'student';
                    if (normalizedRole === 'mentor' || normalizedRole === 'student') {
                        profileData.occupation.role = normalizedRole;
                    }
                }

                if ((data as any).avatar) {
                    profileData.general.avatar = (data as any).avatar;
                }

                setProfile(profileData);
            } catch (error) {
                console.error("Error fetching profile:", error);

                // Fallback on error
                const storedRole = localStorage.getItem("userRole");
                if (storedRole) {
                    const normalizedRole = storedRole.toLowerCase() as 'mentor' | 'student';
                    if (normalizedRole === 'mentor' || normalizedRole === 'student') {
                        setProfile(prev => ({
                            ...initialProfile,
                            occupation: { ...prev.occupation, role: normalizedRole }
                        }));
                    }
                }
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Extract avatar to root level for backend
            const payload = { ...profile, avatar: profile.general.avatar };

            const updatedProfile = await apiRequest<Profile>('/profile', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setProfile({ ...initialProfile, ...updatedProfile });
            await refetchProfile();

            toast.success("Profile saved!", {
                description: "Your changes have been successfully updated."
            });

            // Only generate skill roadmap for students/professionals, NOT mentors
            const role = profile.occupation?.role || localStorage.getItem('userRole')?.toLowerCase();
            if (role !== 'mentor') {
                toast.info("Generating new skill roadmap...", {
                    description: "AI is analyzing your profile updates."
                });

                apiRequest('/skills/analyze', {
                    method: 'POST',
                    body: JSON.stringify({ ...updatedProfile, regenerate: true })
                }).then((skillsData) => {
                    localStorage.setItem('generatedSkills', JSON.stringify(skillsData));
                    window.dispatchEvent(new Event('skillsUpdated'));
                    toast.success("Skill roadmap updated!");
                }).catch(err => {
                    console.error("Skill generation failed", err);
                    toast.error("Could not update roadmap");
                });
            }

        } catch (error) {
            console.error("Failed to save profile", error);
            toast.error("Failed to save profile");
        } finally {
            setLoading(false);
        }
    };

    const handleNestedChange = (sectionKey: any, field: string, value: any) => {
        const section = sectionKey as keyof Profile;
        setProfile(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };

    if (fetching) return <div className="p-8 text-center">Loading Profile...</div>;

    // Render the appropriate profile view based on role
    if (profile.occupation.role === 'mentor') {
        return (
            <MentorProfile
                profile={profile}
                setProfile={setProfile}
                loading={loading}
                onSave={handleSave}
                handleNestedChange={handleNestedChange}
            />
        );
    }

    // Default to Student View for 'student' and 'professional' (or any other role)
    // You can add a ProfessionalProfile later if needed.
    return (
        <StudentProfile
            profile={profile}
            setProfile={setProfile}
            loading={loading}
            onSave={handleSave}
            handleNestedChange={handleNestedChange}
        />
    );
}
