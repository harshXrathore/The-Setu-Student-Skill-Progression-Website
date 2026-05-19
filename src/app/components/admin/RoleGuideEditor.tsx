import { useState, useEffect } from "react";
import { Plus, Edit, Save, X, Book, Trash2, Link as LinkIcon, Video, FileText } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

interface RoleGuide {
    _id?: string;
    roleName: string;
    description: string;
    mustHaveSkills: string[];
    careerPath: string;
    resources: { title: string; url: string; type: string }[];
}

export function RoleGuideEditor() {
    const [guides, setGuides] = useState<RoleGuide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<RoleGuide | null>(null);

    // New Resource State
    const [newRes, setNewRes] = useState({ title: '', url: '', type: 'doc' });

    const fetchGuides = async () => {
        try {
            const data = await apiRequest<RoleGuide[]>('/admin/roleguide');
            setGuides(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuides();
    }, []);

    const handleSave = async () => {
        if (!editing) return;
        try {
            await apiRequest('/admin/roleguide', {
                method: 'POST',
                body: JSON.stringify(editing)
            });
            toast.success("Role guide saved");
            setEditing(null);
            fetchGuides();
        } catch (error) {
            toast.error("Failed to save");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this guide?")) return;
        try {
            await apiRequest(`/admin/roleguide/${id}`, { method: 'DELETE' });
            toast.success("Guide deleted");
            setGuides(guides.filter(g => g._id !== id));
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const handleEdit = (guide: RoleGuide) => {
        setEditing(JSON.parse(JSON.stringify(guide)));
    };

    const handleNew = () => {
        setEditing({
            roleName: "",
            description: "",
            mustHaveSkills: [],
            careerPath: "",
            resources: []
        });
    };

    const addResource = () => {
        if (!newRes.title || !newRes.url) return;

        // Strict HTTP/HTTPS Regex Validation to block XSS payloads (e.g. javascript:)
        const urlPattern = /^(https?:\/\/)/i;
        if (!urlPattern.test(newRes.url)) {
            toast.error("Invalid URL. Links must securely start with http:// or https://");
            return;
        }

        setEditing(prev => prev ? ({
            ...prev,
            resources: [...prev.resources, { ...newRes }]
        }) : null);
        setNewRes({ title: '', url: '', type: 'doc' });
    };

    const removeResource = (index: number) => {
        setEditing(prev => prev ? ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index)
        }) : null);
    };

    if (loading) return <div>Loading knowledge base...</div>;

    if (editing) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{editing._id ? 'Edit Role Guide' : 'Create New Guide'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Role Name</label>
                            <Input
                                value={editing.roleName}
                                onChange={e => setEditing({ ...editing, roleName: e.target.value })}
                                placeholder="e.g. Frontend Developer"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Career Path</label>
                            <Input
                                value={editing.careerPath}
                                onChange={e => setEditing({ ...editing, careerPath: e.target.value })}
                                placeholder="Junior -> Mid -> Senior"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description (Markdown Supported)</label>
                        <div className="prose-editor">
                            <SimpleMDE
                                value={editing.description}
                                onChange={value => setEditing({ ...editing, description: value })}
                                options={{
                                    spellChecker: false,
                                    maxHeight: "300px",
                                    status: false,
                                    placeholder: "Write your detailed markdown role guide here..."
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Must-Have Skills (comma separated)</label>
                        <Input
                            value={editing.mustHaveSkills.join(', ')}
                            onChange={e => setEditing({ ...editing, mustHaveSkills: e.target.value.split(',').map(s => s.trim()) })}
                            placeholder="React, TypeScript, CSS..."
                        />
                    </div>

                    <div className="space-y-3 bg-secondary/20 p-4 rounded-xl border border-border">
                        <h4 className="font-semibold flex items-center gap-2">
                            <Book className="size-4" /> Learning Resources
                        </h4>

                        <div className="space-y-2">
                            {editing.resources.map((res, i) => (
                                <div key={i} className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                                        {res.type === 'video' ? <Video className="size-4" /> :
                                            res.type === 'course' ? <Book className="size-4" /> : <FileText className="size-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{res.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">{res.url}</div>
                                    </div>
                                    <button onClick={() => removeResource(i)} className="p-1 hover:bg-red-100 text-red-500 rounded">
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 items-end pt-2 border-t border-border/50">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-medium">Title</label>
                                <Input
                                    value={newRes.title}
                                    onChange={e => setNewRes({ ...newRes, title: e.target.value })}
                                    className="h-8 text-sm"
                                    placeholder="Resource Title"
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-medium">URL</label>
                                <Input
                                    value={newRes.url}
                                    onChange={e => setNewRes({ ...newRes, url: e.target.value })}
                                    className="h-8 text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="w-32 space-y-1">
                                <label className="text-xs font-medium">Type</label>
                                <select
                                    className="w-full h-8 text-sm bg-background border border-input rounded-md px-2"
                                    value={newRes.type}
                                    onChange={e => setNewRes({ ...newRes, type: e.target.value })}
                                >
                                    <option value="doc">Article/Doc</option>
                                    <option value="video">Video</option>
                                    <option value="course">Course</option>
                                </select>
                            </div>
                            <button onClick={addResource} className="h-8 px-3 bg-primary text-primary-foreground rounded-md flex items-center gap-1 hover:brightness-90">
                                <Plus className="size-3" /> Add
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border">
                        <button onClick={() => setEditing(null)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors">
                            <X className="size-4" /> Cancel
                        </button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors shadow-sm">
                            <Save className="size-4" /> Save Guide
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Knowledge Base</h2>
                    <p className="text-muted-foreground">Manage role guides and learning resources.</p>
                </div>
                <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-sm transition-colors">
                    <Plus className="size-4" /> Create New Guide
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map(guide => (
                    <div key={guide._id} className="group relative bg-card hover:shadow-md transition-shadow rounded-xl border border-border p-5 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Book className="size-6" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(guide)} className="p-2 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-lg transition-colors" title="Edit Guide">
                                    <Edit className="size-4" />
                                </button>
                                <button onClick={(e) => handleDelete(guide._id!, e)} className="p-2 hover:bg-red-50 text-muted-foreground hover:text-red-600 rounded-lg transition-colors" title="Delete Guide">
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg mb-2">{guide.roleName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{guide.description}</p>

                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                            <LinkIcon className="size-3" />
                            {guide.resources?.length || 0} Resources Linked
                        </div>
                    </div>
                ))}

                {guides.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
                        <Book className="size-8 mx-auto mb-3 opacity-50" />
                        <p>No guides found. Create your first role guide to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
