import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "../ui/utils";
import { Profile } from "../../../types/profile";

interface ProfileLayoutProps {
    title: string;
    description: string;
    loading: boolean;
    onSave: () => void;
    activeSection: string;
    scrollToSection: (id: string) => void;
    sections: { id: string; label: string; icon: any }[];
    children: React.ReactNode;
}

export function ProfileLayout({
    title,
    description,
    loading,
    onSave,
    activeSection,
    scrollToSection,
    sections,
    children
}: ProfileLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8 py-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                    <div className="ml-auto">
                        <Button onClick={onSave} disabled={loading} className="gap-2">
                            <Save className="h-4 w-4" />
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                    {/* Sidebar Navigation */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-0 space-y-1">
                            <p className="font-medium text-sm text-muted-foreground mb-3 px-4 uppercase tracking-wider">Sections</p>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-left",
                                        activeSection === section.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <section.icon className="h-4 w-4" />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="space-y-10 pb-20">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
