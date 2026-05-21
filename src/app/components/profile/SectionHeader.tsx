import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
    icon: any; // Using any for Lucide icon component type
    title: string;
    description: string;
}

export const SectionHeader = ({ icon: Icon, title, description }: SectionHeaderProps) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);
