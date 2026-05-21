import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Profile, initialProfile } from "../../types/profile";
import { apiRequest } from "../lib/api";

interface ProfileContextType {
    profile: Profile;
    loading: boolean;
    refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<Profile>(initialProfile);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const data = await apiRequest<Profile>('/profile/me');

            // Get stored role as fallback/override for the view
            // The backend might return 'student' by default if the profile is new,
            // so we force the role from our auth context (localStorage) if available.
            const storedRole = localStorage.getItem("userRole");

            // If we have a stored role and (the profile has default role OR we seek consistency),
            // update the local state to reflect the stored role.
            const profileData = { ...initialProfile, ...data };

            if (storedRole) {
                const normalizedRole = storedRole.toLowerCase() as 'mentor' | 'student';
                if (normalizedRole === 'mentor' || normalizedRole === 'student') {
                    if (typeof profileData.occupation !== 'object' || profileData.occupation === null) {
                        profileData.occupation = { role: normalizedRole };
                    } else {
                        profileData.occupation.role = normalizedRole;
                    }
                }
            }

            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile context:", error);
            // Fallback on error: use stored role if available
            const storedRole = localStorage.getItem("userRole");
            if (storedRole) {
                const normalizedRole = storedRole.toLowerCase() as 'mentor' | 'student';
                if (normalizedRole === 'mentor' || normalizedRole === 'student') {
                    setProfile(prev => {
                        const safeOccupation = typeof prev.occupation === 'object' && prev.occupation !== null
                            ? prev.occupation
                            : { role: 'student' as const };

                        return {
                            ...initialProfile,
                            occupation: { ...safeOccupation, role: normalizedRole }
                        };
                    });
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial setup to avoid flash of wrong content
        const storedRole = localStorage.getItem("userRole");
        if (storedRole) {
            const normalizedRole = storedRole.toLowerCase() as 'mentor' | 'student';
            if (normalizedRole === 'mentor' || normalizedRole === 'student') {
                setProfile(prev => {
                    const safeOccupation = typeof prev.occupation === 'object' && prev.occupation !== null
                        ? prev.occupation
                        : { role: 'student' as const };

                    return {
                        ...initialProfile,
                        occupation: { ...safeOccupation, role: normalizedRole }
                    };
                });
            }
        }
        fetchProfile();
    }, []);

    const refetchProfile = async () => {
        await fetchProfile();
    };

    return (
        <ProfileContext.Provider value={{ profile, loading, refetchProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
}
