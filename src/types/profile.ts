export interface Profile {
    _id?: string;
    user: string; // User ID
    general: {
        firstName: string;
        lastName: string;
        headline?: string;
        bio?: string;
        location?: string;
        avatar?: string;
        phone?: string;
        email?: string;
        website?: string;
    };
    occupation: {
        role: 'student' | 'mentor' | 'professional';
        university?: string;
        major?: string;
        graduationYear?: string;
        gpa?: string;
        company?: string;
        jobTitle?: string;
    };
    preferences: {
        desiredRole?: string;
        salaryRange?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        workType?: 'remote' | 'hybrid' | 'onsite' | 'any';
        employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
    };
    skills: string[];
    education: Education[];
    experience: Experience[];
    certifications: Certification[];
    projects: Project[];
    languages: Language[];
    socials: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        portfolio?: string;
        instagram?: string;
        discord?: string;
    };
    learningGoals: {
        focus?: string;
        weeklyHours?: number;
        learningStyle?: string;
    };
    mentorDetails?: {
        rate?: string;
        availabilityStatus?: 'Available' | 'Limited' | 'Booked' | 'Unavailable';
        availability?: {
            day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
            slots: { startTime: string; endTime: string; }[];
        }[];
        specialties?: string[];
        rating?: number;
        sessionCount?: number;
    };
}

export interface Education {
    _id?: string;
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string; // ISO Date string
    endDate?: string;
    description?: string;
}

export interface Experience {
    _id?: string;
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    current?: boolean;
    description?: string;
}

export interface Certification {
    _id?: string;
    name: string;
    issuingOrganization?: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface Project {
    _id?: string;
    title: string;
    description?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
}

export interface Language {
    _id?: string;
    language: string;
    proficiency?: 'Elementary' | 'Limited Working' | 'Professional Working' | 'Full Professional' | 'Native or Bilingual';
}

export const initialProfile: Profile = {
    user: '',
    general: { firstName: '', lastName: '' },
    occupation: { role: 'student' },
    preferences: {},
    skills: [],
    education: [],
    experience: [],
    certifications: [],
    projects: [],
    languages: [],
    socials: {},
    learningGoals: {}
};
