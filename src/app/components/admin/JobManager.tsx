import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    MapPin,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";

interface Job {
    _id?: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
    description: string;
    skills: string[];
    applicationUrl: string;
    posted?: string;
    applicants?: number;
}

export function JobManager() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Job | null>(null);

    const fetchJobs = async () => {
        try {
            const data = await apiRequest<any>('/jobs');
            // Support both direct array response and paginated { jobs: [] } object response
            const jobsArray = Array.isArray(data) ? data : (data && Array.isArray(data.jobs) ? data.jobs : []);
            setJobs(jobsArray);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job?")) return;
        try {
            await apiRequest(`/jobs/${id}`, { method: 'DELETE' });
            setJobs(jobs.filter(j => j._id !== id));
            toast.success("Job deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete job");
        }
    };

    const handleSave = async () => {
        if (!editForm) return;

        try {
            if (editForm._id) {
                // Update
                const updated = await apiRequest<Job>(`/jobs/${editForm._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(editForm)
                });
                setJobs(jobs.map(j => j._id === updated._id ? updated : j));
                toast.success("Job updated successfully");
            } else {
                // Create
                const created = await apiRequest<Job>('/jobs', {
                    method: 'POST',
                    body: JSON.stringify(editForm)
                });
                setJobs([created, ...jobs]);
                toast.success("Job created successfully");
            }
            setIsEditing(false);
            setEditForm(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save job");
        }
    };

    const startNewParams: Job = {
        title: "",
        company: "",
        location: "",
        salary: "",
        type: "Full-time",
        description: "",
        skills: [],
        applicationUrl: ""
    }

    const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job =>
        (job.title || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
        (job.company || "").toLowerCase().includes((searchTerm || "").toLowerCase())
    );

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Job Board Manager</h2>
                    <p className="text-muted-foreground">Manage job listings and applications.</p>
                </div>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditForm(startNewParams)}>
                            <Plus className="size-4 mr-2" /> Post New Job
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editForm?._id ? "Edit Job" : "Post New Job"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Job Title</label>
                                    <Input
                                        value={editForm?.title || ""}
                                        onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                                        placeholder="e.g. Senior Frontend Engineer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Company</label>
                                    <Input
                                        value={editForm?.company || ""}
                                        onChange={(e) => setEditForm({ ...editForm!, company: e.target.value })}
                                        placeholder="Company Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        value={editForm?.location || ""}
                                        onChange={(e) => setEditForm({ ...editForm!, location: e.target.value })}
                                        placeholder="e.g. San Francisco, CA"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Job Type</label>
                                    <Select
                                        value={editForm?.type}
                                        onValueChange={(val: any) => setEditForm({ ...editForm!, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                            <SelectItem value="Contract">Contract</SelectItem>
                                            <SelectItem value="Internship">Internship</SelectItem>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Salary Range</label>
                                <Input
                                    value={editForm?.salary || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, salary: e.target.value })}
                                    placeholder="e.g. $120k - $150k"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editForm?.description || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                                    rows={5}
                                    placeholder="Job description..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Skills (comma separated)</label>
                                <Input
                                    value={(editForm?.skills || []).join(", ")}
                                    onChange={(e) => setEditForm({ ...editForm!, skills: e.target.value.split(",").map(s => s.trim()) })}
                                    placeholder="React, Node.js, TypeScript"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Application URL</label>
                                <Input
                                    value={editForm?.applicationUrl || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, applicationUrl: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Job</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary text-muted-foreground font-medium">
                            <TableRow>
                                <TableHead className="p-4">Job Role</TableHead>
                                <TableHead className="p-4">Location</TableHead>
                                <TableHead className="p-4">Type</TableHead>
                                <TableHead className="p-4">Posted</TableHead>
                                <TableHead className="p-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredJobs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No jobs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredJobs.map((job) => (
                                    <TableRow key={job._id} className="group border-t border-border hover:bg-secondary/20 transition-colors">
                                        <TableCell className="p-4">
                                            <div>
                                                <div className="font-medium text-foreground">{job.title}</div>
                                                <div className="text-sm text-muted-foreground">{job.company}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="size-3" /> {job.location}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {job.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4 text-sm text-muted-foreground">
                                            {new Date(job.posted || Date.now()).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                                    onClick={() => {
                                                        setEditForm(job);
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                    onClick={() => job._id && handleDelete(job._id)}
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
            </div>
        </div>
    );
}
