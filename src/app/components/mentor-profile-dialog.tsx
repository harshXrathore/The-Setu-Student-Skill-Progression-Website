import { ReactNode } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Star, BadgeCheck, Briefcase, GraduationCap, MapPin, Map, Link as LinkIcon, CalendarPlus } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog"; // Needed for accessibility

interface MentorProfileDialogProps {
    mentor: any; // The mentor object containing all details
    children: ReactNode; // What triggers the dialog (e.g., a button or avatar)
}

export function MentorProfileDialog({ mentor, children }: MentorProfileDialogProps) {
    // Extract data safely, handling varied nested structures across the app
    const mDetails = mentor.mentorDetails || {};
    const name = mentor.user?.name || (mentor.general?.firstName ? `${mentor.general.firstName} ${mentor.general.lastName}` : "Unknown Mentor");
    const role = mentor.occupation?.jobTitle || mentor.occupation?.role || "Mentor";
    const company = mentor.occupation?.company || "";
    const bio = mentor.general?.bio || "No bio provided.";
    const location = mentor.general?.location || "Location not specified";
    const website = mentor.general?.website || mDetails.linkedin || null;

    const experienceYears = mentor.experience?.[0] ? new Date().getFullYear() - new Date(mentor.experience[0].startDate).getFullYear() + "+ years" : "Experienced";

    // Array Fallbacks
    const specialties = mDetails.specialties?.length > 0 ? mDetails.specialties : mentor.skills?.slice(0, 5) || [];
    const education = mentor.education?.[0] || null;
    const experienceArray = mentor.experience || [];

    // Stats defaults - Pull from real DB fields
    const rating = typeof mDetails.rating === 'number' ? mDetails.rating : 0;
    const sessionCount = typeof mDetails.sessionCount === 'number' ? mDetails.sessionCount : 0;
    const availability = mDetails.availabilityStatus || "Available";
    const price = mDetails.rate || "Not specified";

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            {/* 
        DialogContent setup with no internal padding and transparent background 
        so we can create a fully custom, beautifully styled card inside.
      */}
            <DialogContent className="p-0 border-0 bg-transparent shadow-2xl max-w-2xl w-full mx-4 overflow-hidden rounded-3xl" aria-describedby="mentor-profile-details">
                {/* Hidden internal title for screen readers */}
                <DialogTitle className="sr-only">Mentor Profile: {name}</DialogTitle>

                <div className="bg-background relative overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header Graphic elements */}
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-teal-500/20 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-teal-900/40" />
                    <div className="absolute -top-24 -right-24 size-64 bg-teal-500/10 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen" />
                    <div className="absolute top-0 left-0 size-48 bg-purple-500/10 blur-3xl rounded-full mix-blend-multiply dark:mix-blend-screen" />

                    {/* Scrollable Content Area */}
                    <div className="relative z-10 overflow-y-auto w-full styled-scrollbar flex-1 pb-6 px-4 md:px-8">

                        {/* Top Profile Section */}
                        <div className="flex flex-col md:flex-row gap-6 mt-12 mb-8 items-center md:items-start text-center md:text-left">
                            <div className="relative shrink-0">
                                <Avatar className="size-32 border-4 border-background shadow-xl ring-1 ring-border/50">
                                    {mentor.general?.avatar ? (
                                        <AvatarImage src={mentor.general.avatar} alt={name} className="object-cover" />
                                    ) : (
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} />
                                    )}
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-teal-400 to-indigo-500 text-white font-bold">{name[0]}</AvatarFallback>
                                </Avatar>
                                {mentor.user?.isVerified && (
                                    <div className="absolute bottom-2 right-2 bg-background rounded-full p-0.5">
                                        <BadgeCheck className="size-7 text-blue-500 fill-blue-500/10" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 pt-4">
                                <h2 className="text-3xl font-extrabold text-foreground mb-1">{name}</h2>
                                <div className="flex flex-col gap-1 text-muted-foreground font-medium mb-3">
                                    <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400 font-bold">
                                        {role}{company ? ` @ ${company}` : ""}
                                    </span>
                                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm mt-1">
                                        <span className="flex items-center gap-1.5 shrink-0"><MapPin className="size-4" /> {location}</span>
                                        {website && (
                                            <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 shrink-0 text-blue-500 hover:underline">
                                                <LinkIcon className="size-4" /> Portfolio
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Badges / Micro-Stats */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-semibold border border-yellow-500/20">
                                        <Star className="size-4 fill-yellow-500 text-yellow-500" />
                                        {rating > 0 ? rating.toFixed(1) : "New"} ({sessionCount} reviews)
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-sm font-semibold border border-teal-500/20">
                                        <Briefcase className="size-4" /> {experienceYears}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${availability === "Available" ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                                        }`}>
                                        <div className={`size-2 rounded-full ${availability === "Available" ? "bg-green-500" : "bg-orange-500"}`} />
                                        {availability}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Dividers */}
                        <div className="w-full h-px bg-border/50 my-6" />

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Left Column: Bio & Experience */}
                            <div className="md:col-span-2 space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                                        About {name.split(" ")[0]}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                                        {bio}
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Briefcase className="size-5 text-indigo-500" /> Professional Experience
                                    </h3>
                                    <div className="space-y-4">
                                        {experienceArray.length > 0 ? experienceArray.map((exp: any, i: number) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                                <div className="size-10 rounded-lg bg-background shadow-sm border border-border flex items-center justify-center shrink-0">
                                                    <Briefcase className="size-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground text-sm lg:text-base">{exp.title}</h4>
                                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{exp.company}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 text-balance">{exp.description || "Helped build scalable systems."}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                                <div className="size-10 rounded-lg bg-background shadow-sm border border-border flex items-center justify-center shrink-0">
                                                    <Briefcase className="size-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">{role}</h4>
                                                    {company && <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{company}</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Skills & Education */}
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <Star className="size-5 text-purple-500" /> Expertise
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {specialties.length > 0 ? specialties.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-background shadow-sm border border-border rounded-lg text-sm font-medium text-foreground hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-default">
                                                {skill}
                                            </span>
                                        )) : <p className="text-sm text-muted-foreground w-full">No expertise listed yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                        <GraduationCap className="size-5 text-teal-500" /> Education
                                    </h3>
                                    {education ? (
                                        <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/10">
                                            <h4 className="font-semibold text-foreground text-sm">{education.degree}</h4>
                                            <p className="text-sm text-muted-foreground mt-0.5">{education.institution}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No education listed yet.</p>
                                    )}
                                </section>

                                {/* Pricing Widget */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-center">
                                    <p className="text-sm text-muted-foreground font-medium mb-1">Session Rate</p>
                                    <p className="text-3xl font-extrabold text-foreground mb-4">{price}<span className="text-lg text-muted-foreground font-medium">/hr</span></p>
                                    <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
                                        <CalendarPlus className="size-5" />
                                        Book a Session
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
