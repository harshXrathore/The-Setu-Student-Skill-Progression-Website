import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import {
    Compass,
    User,
    Clock,
    Search,
    Filter,
    Trash2,
    Eye,
    TrendingUp,
    Users,
    CheckCircle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Pencil,
    Save,
    X,
    Plus,
    Download
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

export function RoadmapMonitor() {
    const [roadmaps, setRoadmaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRoadmapCount, setTotalRoadmapCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>(null);
    const [selectedRoadmaps, setSelectedRoadmaps] = useState<Set<string>>(new Set());

    const fetchRoadmaps = async (page = 1) => {
        setLoading(true);
        try {
            const data = await apiRequest<any>(`/admin/roadmaps?page=${page}&limit=10&status=${statusFilter}`);
            if (data.roadmaps) {
                setRoadmaps(data.roadmaps);
                setTotalPages(data.totalPages);
                setTotalRoadmapCount(data.totalRoadmaps);
            } else {
                setRoadmaps(data); // Fallback
            }
            setCurrentPage(page);
            // Clear selection on page change or filter change
            setSelectedRoadmaps(new Set());
        } catch (error) {
            console.error(error);
            toast.error("Failed to load roadmaps");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoadmaps(currentPage);
    }, [currentPage, statusFilter]);

    const toggleSelectAll = () => {
        if (selectedRoadmaps.size === roadmaps.length && roadmaps.length > 0) {
            setSelectedRoadmaps(new Set());
        } else {
            setSelectedRoadmaps(new Set(roadmaps.map(r => r._id)));
        }
    };

    const toggleSelectRoadmap = (id: string) => {
        const newSelected = new Set(selectedRoadmaps);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRoadmaps(newSelected);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedRoadmaps.size} roadmaps?`)) return;

        try {
            const token = localStorage.getItem('authToken');
            await fetch('http://localhost:3000/api/admin/roadmaps/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ids: Array.from(selectedRoadmaps) })
            });

            toast.success(`Deleted ${selectedRoadmaps.size} roadmaps`);
            setSelectedRoadmaps(new Set());
            fetchRoadmaps(currentPage); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete roadmaps");
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this roadmap?")) return;

        try {
            await apiRequest(`/admin/roadmaps/${id}`, { method: 'DELETE' });
            setRoadmaps(roadmaps.filter(r => r._id !== id));
            toast.success("Roadmap deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete roadmap");
        }
    };

    const startEditing = (roadmap: any) => {
        setEditForm(JSON.parse(JSON.stringify(roadmap))); // Deep copy
        setIsEditing(true);
        setSelectedRoadmap(roadmap);
    };

    const handleSave = async () => {
        try {
            const res = await apiRequest(`/admin/roadmaps/${editForm._id}`, {
                method: 'PUT',
                body: JSON.stringify(editForm)
            });

            // Update local state
            setRoadmaps(roadmaps.map(r => r._id === editForm._id ? res : r));
            setSelectedRoadmap(res);
            setIsEditing(false);
            toast.success("Roadmap updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update roadmap");
        }
    };

    const handleAddSkill = (phaseIndex: number) => {
        const newPhases = [...editForm.roadmapPhases];
        if (!newPhases[phaseIndex].skills) newPhases[phaseIndex].skills = [];
        newPhases[phaseIndex].skills.push({ name: "New Skill", status: "pending" });
        setEditForm({ ...editForm, roadmapPhases: newPhases });
    };

    const handleRemoveSkill = (phaseIndex: number, skillIndex: number) => {
        const newPhases = [...editForm.roadmapPhases];
        newPhases[phaseIndex].skills.splice(skillIndex, 1);
        setEditForm({ ...editForm, roadmapPhases: newPhases });
    };

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:3000/api/admin/roadmaps/export', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `roadmaps-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error(error);
            toast.error("Failed to export roadmaps");
        }
    };

    const filteredRoadmaps = roadmaps.filter(roadmap =>
        roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (roadmap.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats Calculation
    // Use backend total if available, otherwise array length
    // Stats Calculation
    const totalRoadmaps = totalRoadmapCount || roadmaps.length;
    const uniqueUsers = new Set(roadmaps.map(r => r.user?._id)).size;
    const completedRoadmaps = roadmaps.filter(r => r.status === 'completed').length; // Assuming status field exists
    const inProgressRoadmaps = totalRoadmaps - completedRoadmaps;

    if (loading) return <div>Loading roadmaps...</div>;

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Compass className="size-5 text-blue-600" />}
                    label="Total Roadmaps"
                    value={totalRoadmaps}
                    bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                    icon={<Users className="size-5 text-green-600" />}
                    label="Active Learners"
                    value={uniqueUsers}
                    bgColor="bg-green-100 dark:bg-green-900/30"
                />
                <StatCard
                    icon={<CheckCircle className="size-5 text-purple-600" />}
                    label="Completed"
                    value={completedRoadmaps}
                    bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
                <StatCard
                    icon={<TrendingUp className="size-5 text-orange-600" />}
                    label="In Progress"
                    value={inProgressRoadmaps}
                    bgColor="bg-orange-100 dark:bg-orange-900/30"
                />
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search roadmaps by title or user..."
                        className="w-full pl-9 pr-4 py-2 bg-secondary/50 rounded-lg border-none focus:ring-2 focus:ring-primary/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Button variant="outline" onClick={handleExport}>
                    <Download className="size-4 mr-2" />
                    Export CSV
                </Button>
                {selectedRoadmaps.size > 0 ? (
                    <Button variant="destructive" onClick={handleBulkDelete}>
                        <Trash2 className="size-4 mr-2" />
                        Delete ({selectedRoadmaps.size})
                    </Button>
                ) : (
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Roadmaps Table */}
            <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-secondary/50">
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedRoadmaps.size === roadmaps.length && roadmaps.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Roadmap Title</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Goal</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRoadmaps.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No roadmaps found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRoadmaps.map((roadmap) => (
                                <TableRow key={roadmap._id} className="hover:bg-secondary/20">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRoadmaps.has(roadmap._id)}
                                            onCheckedChange={() => toggleSelectRoadmap(roadmap._id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                                                <Compass className="size-4" />
                                            </div>
                                            {roadmap.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                                {(roadmap.user?.name || "U")[0]}
                                            </div>
                                            <span className="text-sm">{roadmap.user?.name || "Unknown"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(roadmap.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 bg-secondary rounded text-xs">
                                            {roadmap.goal}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs text-muted-foreground">{roadmap.roadmapPhases?.length || 0} Phases</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => {
                                                        setSelectedRoadmap(roadmap);
                                                        setIsEditing(false);
                                                    }}>
                                                        <Eye className="size-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600" onClick={() => startEditing(roadmap)}>
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl h-[80vh] flex flex-col overflow-hidden">
                                                    <DialogHeader className="flex-shrink-0">
                                                        <DialogTitle className="flex items-center gap-2 text-xl">
                                                            <Compass className="size-5 text-primary" />
                                                            {isEditing ? (
                                                                <Input
                                                                    value={editForm?.title}
                                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                                    className="h-8 font-bold text-lg"
                                                                />
                                                            ) : (
                                                                selectedRoadmap?.title
                                                            )}
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Created by {selectedRoadmap?.user?.name} on {new Date(selectedRoadmap?.createdAt).toLocaleDateString()}
                                                        </DialogDescription>
                                                    </DialogHeader>

                                                    <div className="flex-1 min-h-0 mt-4 rounded-md border border-border">
                                                        <ScrollArea className="h-full">
                                                            <div className="p-4 space-y-6">
                                                                {isEditing && (
                                                                    <div>
                                                                        <h4 className="font-semibold mb-2">Status</h4>
                                                                        <Select
                                                                            value={editForm?.status || 'pending'}
                                                                            onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select Status" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                                                <SelectItem value="completed">Completed</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <h4 className="font-semibold mb-2">Learning Goal</h4>
                                                                    {isEditing ? (
                                                                        <Textarea
                                                                            value={editForm?.goal}
                                                                            onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                                                                            className="min-h-[100px]"
                                                                        />
                                                                    ) : (
                                                                        <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border">
                                                                            {selectedRoadmap?.goal}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-semibold mb-3">Roadmap Phases</h4>
                                                                    <div className="space-y-4">
                                                                        {(isEditing ? editForm : selectedRoadmap)?.roadmapPhases?.map((phase: any, i: number) => (
                                                                            <div key={i} className="border border-border rounded-lg p-4 bg-card hover:bg-secondary/10 transition-colors">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
                                                                                        Phase {i + 1}
                                                                                    </span>
                                                                                    {isEditing ? (
                                                                                        <Input
                                                                                            value={phase.duration}
                                                                                            onChange={(e) => {
                                                                                                const newPhases = [...editForm.roadmapPhases];
                                                                                                newPhases[i].duration = e.target.value;
                                                                                                setEditForm({ ...editForm, roadmapPhases: newPhases });
                                                                                            }}
                                                                                            className="w-32 h-7 text-xs"
                                                                                        />
                                                                                    ) : (
                                                                                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                                                                            <Clock className="size-3" />
                                                                                            {phase.duration}
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {isEditing ? (
                                                                                    <Input
                                                                                        value={phase.phase || phase.phaseTitle}
                                                                                        onChange={(e) => {
                                                                                            const newPhases = [...editForm.roadmapPhases];
                                                                                            newPhases[i].phase = e.target.value;
                                                                                            newPhases[i].phaseTitle = e.target.value;
                                                                                            setEditForm({ ...editForm, roadmapPhases: newPhases });
                                                                                        }}
                                                                                        className="mb-3 font-semibold"
                                                                                    />
                                                                                ) : (
                                                                                    <h5 className="font-semibold text-foreground text-base mb-3 leading-snug">
                                                                                        {phase.phase || phase.phaseTitle}
                                                                                    </h5>
                                                                                )}

                                                                                <div className="space-y-2.5">
                                                                                    {(phase.skills || []).map((skill: any, j: number) => (
                                                                                        <div key={j} className="flex items-start gap-3 text-sm group">
                                                                                            <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-1 rounded text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                                                                <BookOpen className="size-3.5" />
                                                                                            </div>

                                                                                            {isEditing ? (
                                                                                                <div className="flex-1 flex gap-2">
                                                                                                    <Input
                                                                                                        value={skill.name || skill}
                                                                                                        onChange={(e) => {
                                                                                                            const newPhases = [...editForm.roadmapPhases];
                                                                                                            // Handle older schema where skill might be string
                                                                                                            if (typeof newPhases[i].skills[j] === 'string') {
                                                                                                                newPhases[i].skills[j] = { name: e.target.value, status: 'pending' };
                                                                                                            } else {
                                                                                                                newPhases[i].skills[j].name = e.target.value;
                                                                                                            }
                                                                                                            setEditForm({ ...editForm, roadmapPhases: newPhases });
                                                                                                        }}
                                                                                                        className="h-7 text-sm"
                                                                                                    />
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        className="h-7 w-7 text-red-500 hover:bg-red-50"
                                                                                                        onClick={() => handleRemoveSkill(i, j)}
                                                                                                    >
                                                                                                        <X className="size-3" />
                                                                                                    </Button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                                                                                                    {skill.name || skill}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    ))}

                                                                                    {isEditing && (
                                                                                        <Button
                                                                                            variant="outline"
                                                                                            size="sm"
                                                                                            className="w-full mt-2 h-7 text-xs border-dashed"
                                                                                            onClick={() => handleAddSkill(i)}
                                                                                        >
                                                                                            <Plus className="size-3 mr-1" /> Add Skill
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </ScrollArea>
                                                    </div>

                                                    {isEditing && (
                                                        <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/10">
                                                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                                                <X className="size-4 mr-2" />
                                                                Cancel
                                                            </Button>
                                                            <Button onClick={handleSave}>
                                                                <Save className="size-4 mr-2" />
                                                                Save Changes
                                                            </Button>
                                                        </div>
                                                    )}
                                                </DialogContent>
                                            </Dialog>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={(e) => handleDelete(roadmap._id, e)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <p className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="size-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, bgColor }: any) {
    return (
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${bgColor}`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}
