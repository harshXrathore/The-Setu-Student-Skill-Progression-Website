import { useState, useEffect } from "react";
import { Search, MoreVertical, Mail, MessageSquare, Filter, CheckCircle, Clock, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { apiRequest } from "../../lib/api";
import { useNavigate } from "react-router-dom";

export function MyStudentsPage() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const fetchedStudents = await apiRequest<any[]>("/mentors/students");
                setStudents(fetchedStudents);
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleViewStudentDetails = (studentId: string, tab?: string) => {
        if (tab) {
            // we will handle default tabs when we upgrade the URL schema later if needed,
            // but for now we just link them to the page
            navigate(`/mentor-dashboard/students/${studentId}`);
        } else {
            navigate(`/mentor-dashboard/students/${studentId}`);
        }
    };

    const filteredStudents = students.filter(student =>
        (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
            case 'verified':
                return <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />;
            case 'in-progress':
                return <Clock className="h-4 w-4 text-blue-500 mt-0.5" />;
            default:
                return <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Students</h1>
                    <p className="text-muted-foreground">Manage and track progress of your mentees.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading your students...</div>
            ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No students found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        {student.avatar && <AvatarImage src={student.avatar} />}
                                        <AvatarFallback>{(student.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base font-medium">{student.name}</CardTitle>
                                        <CardDescription className="text-xs">{student.email}</CardDescription>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleViewStudentDetails(student.id)}>
                                            Manage Record
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleViewStudentDetails(student.id, 'roadmap')}>
                                            View Roadmap
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Message</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Focus</span>
                                        <Badge variant="outline">{student.focus || "Unknown"}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{student.progress || 0}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${student.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex items-center justify-between border-t border-border">
                                        <div className="text-xs text-muted-foreground">
                                            Last Session: {new Date(student.lastActive).toLocaleDateString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
