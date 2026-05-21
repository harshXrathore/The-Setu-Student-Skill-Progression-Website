import { User, Phone, Mail, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Textarea } from "../../ui/textarea";
import { Profile } from "../../../../types/profile";
import { SectionHeader } from "../SectionHeader";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { getFileUrl } from "../../../lib/api";

interface GeneralInfoSectionProps {
    profile: Profile;
    handleChange: (field: string, value: any) => void;
}

export function GeneralInfoSection({ profile, handleChange }: GeneralInfoSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        toast.loading("Uploading avatar...", { id: "avatar-upload" });

        try {
            const formData = new FormData();
            formData.append('attachment', file); // upload.js expects 'attachment' field

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:3000/api/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            // Server returns { attachmentUrl, attachmentName }
            handleChange('avatar', data.attachmentUrl);

            toast.success("Avatar uploaded successfully!", { id: "avatar-upload" });
        } catch (error) {
            console.error("Avatar upload error:", error);
            toast.error("Failed to upload avatar", { id: "avatar-upload" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <SectionHeader icon={User} title="General Information" description="Your basic personal details." />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <div
                        className={`relative group cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleAvatarUpload}
                        />
                        <Avatar className="h-28 w-28 border-4 border-background shadow-sm transition-opacity group-hover:opacity-80">
                            <AvatarImage src={profile.general.avatar ? getFileUrl(profile.general.avatar) : "https://github.com/shadcn.png"} alt="Avatar" />
                            <AvatarFallback>{profile.general.firstName?.[0] || ""}{profile.general.lastName?.[0] || ""}</AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                            <span className="text-white text-xs font-semibold">Change</span>
                        </div>
                    </div>
                    <div className="space-y-4 flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={profile.general.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={profile.general.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="headline">Headline</Label>
                            <Input
                                id="headline"
                                placeholder="e.g. Aspiring Full Stack Developer"
                                value={profile.general.headline || ''}
                                onChange={(e) => handleChange('headline', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                className="pl-9"
                                value={profile.general.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                className="pl-9"
                                value={profile.general.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="location"
                                className="pl-9"
                                value={profile.general.location || ''}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            className="min-h-[80px]"
                            value={profile.general.bio || ''}
                            onChange={(e) => handleChange('bio', e.target.value)}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
