import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Loader2, X } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { CareerPath } from "../../types/career";

export function CareerManager() {
    const [careers, setCareers] = useState<CareerPath[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCareer, setEditingCareer] = useState<CareerPath | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<CareerPath>>({
        title: "", industry: "", description: "", salaryRange: "", demandLevel: "", growthRate: "",
        requiredSkills: [], advantages: [], challenges: []
    });

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<CareerPath[]>('/careers');
            setCareers(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load careers');
        } finally {
            setLoading(false);
        }
    };

    // For array inputs, we'll store the raw comma-separated string in a temporary state
    // so the user can type freely without aggressive filtering.
    const [arrayInputs, setArrayInputs] = useState({
        requiredSkills: "",
        advantages: "",
        challenges: ""
    });

    const handleOpenModal = (career?: CareerPath) => {
        if (career) {
            setEditingCareer(career);
            setFormData(career);
            setArrayInputs({
                requiredSkills: career.requiredSkills?.join(', ') || "",
                advantages: career.advantages?.join(', ') || "",
                challenges: career.challenges?.join(', ') || ""
            });
        } else {
            setEditingCareer(null);
            setFormData({ title: "", industry: "", description: "", salaryRange: "", demandLevel: "", growthRate: "", requiredSkills: [], advantages: [], challenges: [] });
            setArrayInputs({ requiredSkills: "", advantages: "", challenges: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCareer(null);
    };

    const handleArrayChange = (field: keyof typeof arrayInputs, value: string) => {
        setArrayInputs(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Parse the comma-separated strings back into arrays before saving
        const payload = {
            ...formData,
            requiredSkills: arrayInputs.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
            advantages: arrayInputs.advantages.split(',').map(s => s.trim()).filter(Boolean),
            challenges: arrayInputs.challenges.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            setLoading(true);
            if (editingCareer) {
                await apiRequest(`/careers/${editingCareer._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                await apiRequest('/careers', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }
            await fetchCareers();
            handleCloseModal();
        } catch (err: any) {
            alert(err.message || 'Failed to save career');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this career path?")) return;
        try {
            setLoading(true);
            await apiRequest(`/careers/${id}`, { method: 'DELETE' });
            await fetchCareers();
        } catch (err: any) {
            alert(err.message || 'Failed to delete career');
        } finally {
            setLoading(false);
        }
    };

    const filteredCareers = careers.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading && careers.length === 0) {
        return <div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Career Paths Manager</h2>
                    <p className="text-muted-foreground text-sm mt-1">Manage database of career paths and AI recommendations</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium cursor-pointer">
                    <Plus className="size-4" />
                    <span>Add Career</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search careers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Industry</th>
                                <th className="px-6 py-4 font-medium">Salary</th>
                                <th className="px-6 py-4 font-medium">Demand</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCareers.map((career) => (
                                <tr key={career._id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{career.title}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{career.industry}</td>
                                    <td className="px-6 py-4">{career.salaryRange}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">
                                            {career.demandLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(career)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                                            <Edit2 className="size-4" />
                                        </button>
                                        <button onClick={() => handleDelete(career._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCareers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No careers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-2xl rounded-xl shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h3 className="text-xl font-semibold">{editingCareer ? 'Edit Career' : 'Add New Career'}</h3>
                            <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="career-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Title</label>
                                        <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Industry</label>
                                        <input type="text" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value })} className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Salary Range</label>
                                        <input type="text" value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="e.g. $80k - $120k" className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Demand Level</label>
                                        <input type="text" value={formData.demandLevel} onChange={e => setFormData({ ...formData, demandLevel: e.target.value })} placeholder="e.g. High" className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Growth Rate</label>
                                        <input type="text" value={formData.growthRate} onChange={e => setFormData({ ...formData, growthRate: e.target.value })} placeholder="e.g. +15%" className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Required Skills (Comma separated)</label>
                                    <input type="text" value={arrayInputs.requiredSkills} onChange={e => handleArrayChange('requiredSkills', e.target.value)} placeholder="React, Node.js, AWS" className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <label className="text-sm font-medium">Advantages (Comma separated)</label>
                                        <input type="text" value={arrayInputs.advantages} onChange={e => handleArrayChange('advantages', e.target.value)} className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Challenges (Comma separated)</label>
                                        <input type="text" value={arrayInputs.challenges} onChange={e => handleArrayChange('challenges', e.target.value)} className="w-full p-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
                            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium border border-input bg-background rounded-lg hover:bg-secondary cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" form="career-form" disabled={loading} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 cursor-pointer">
                                {loading && <Loader2 className="size-4 animate-spin" />}
                                Save Career
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
