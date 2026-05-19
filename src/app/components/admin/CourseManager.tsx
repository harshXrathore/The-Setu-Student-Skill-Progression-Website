import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import {
    BookOpen,
    Search,
    Plus,
    Edit,
    Trash2,
    Video,
    Clock,
    Save,
    X,
    Loader2,
    Star,
    Users
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

interface Course {
    _id?: string;
    title: string;
    description?: string;
    instructor: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    category: string;
    lessons: any[];
    totalLessons?: number;
    rating?: number;
    students?: number;
    imageUrl?: string;
    courseUrl: string;
    enforceOrder: boolean;
}

export function CourseManager() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Course | null>(null);
    
    // New state for managing lessons
    const [managingLessonsCourse, setManagingLessonsCourse] = useState<Course | null>(null);
    const [courseLessons, setCourseLessons] = useState<any[]>([]);
    const [newLessonForm, setNewLessonForm] = useState({ title: '', type: 'video', videoUrl: '', externalUrl: '', content: '' });
    const [loadingLessons, setLoadingLessons] = useState(false);

    // New state for managing quizzes
    const [managingQuizLesson, setManagingQuizLesson] = useState<any | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    const [newQuestionForm, setNewQuestionForm] = useState({ question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '' });
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [loadingQuiz, setLoadingQuiz] = useState(false);

    const fetchCourses = async () => {
        try {
            const data = await apiRequest<Course[]>('/courses');
            setCourses(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;
        try {
            await apiRequest(`/courses/${id}`, { method: 'DELETE' });
            setCourses(courses.filter(c => c._id !== id));
            toast.success("Course deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete course");
        }
    };

    const handleSave = async () => {
        if (!editForm) return;

        try {
            if (editForm._id) {
                // Update
                const updated = await apiRequest<Course>(`/courses/${editForm._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(editForm)
                });
                setCourses(courses.map(c => c._id === updated._id ? updated : c));
                toast.success("Course updated successfully");
            } else {
                // Create
                const created = await apiRequest<Course>('/courses', {
                    method: 'POST',
                    body: JSON.stringify(editForm)
                });
                setCourses([created, ...courses]);
                toast.success("Course created successfully");
            }
            setIsEditing(false);
            setEditForm(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save course");
        }
    };

    const handleManageLessons = async (course: Course) => {
        if (!course._id) return;
        setManagingLessonsCourse(course);
        setLoadingLessons(true);
        try {
            const fullCourse = await apiRequest<any>(`/courses/${course._id}`);
            setCourseLessons(fullCourse.lessons || []);
            setNewLessonForm({ title: '', type: 'video', videoUrl: '', externalUrl: '', content: '' });
        } catch (error) {
            console.error(error);
            toast.error("Failed to load lessons");
        } finally {
            setLoadingLessons(false);
        }
    };

    const handleAddLesson = async () => {
        if (!managingLessonsCourse?._id) return;
        
        let submitTitle = newLessonForm.title;
        if (!submitTitle && newLessonForm.type === 'quiz') {
            submitTitle = 'New Quiz';
        }
        
        if (!submitTitle) return toast.error("Lesson title is required");

        try {
            const addedLesson = await apiRequest<any>(`/courses/${managingLessonsCourse._id}/lessons`, {
                method: 'POST',
                body: JSON.stringify({
                    ...newLessonForm,
                    title: submitTitle,
                    order: courseLessons.length + 1
                })
            });
            setCourseLessons([...courseLessons, addedLesson]);
            setNewLessonForm({ title: '', type: 'video', videoUrl: '', externalUrl: '', content: '' });
            toast.success("Lesson added successfully");
            
            // Update the main course list lesson count visually
            setCourses(courses.map(c => c._id === managingLessonsCourse._id ? { ...c, totalLessons: (c.totalLessons || 0) + 1 } : c));
        } catch (error) {
            console.error(error);
            toast.error("Failed to add lesson");
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!managingLessonsCourse?._id) return;
        if (!confirm("Are you sure you want to delete this lesson?")) return;

        try {
            await apiRequest<any>(`/courses/${managingLessonsCourse._id}/lessons/${lessonId}`, {
                method: 'DELETE'
            });
            setCourseLessons(courseLessons.filter(l => l._id !== lessonId));
            toast.success("Lesson deleted");
            
            // Update the main course list lesson count visually
            setCourses(courses.map(c => c._id === managingLessonsCourse._id ? { ...c, totalLessons: Math.max(0, (c.totalLessons || 0) - 1) } : c));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete lesson");
        }
    };

    const handleManageQuiz = async (lesson: any) => {
        setManagingQuizLesson(lesson);
        setLoadingQuiz(true);
        try {
            const data = await apiRequest<any>(`/courses/lesson/${lesson._id}/quiz`);
            setQuizQuestions(data || []);
            setNewQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '' });
            setEditingQuestionId(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quiz questions");
        } finally {
            setLoadingQuiz(false);
        }
    };

    const handleEditQuestionClick = (q: any) => {
        setNewQuestionForm({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            skillTag: q.skillTag
        });
        setEditingQuestionId(q._id);
    };

    const handleAddQuestion = async () => {
        if (!managingLessonsCourse?._id || !managingQuizLesson?._id) return;
        
        if (!newQuestionForm.question || newQuestionForm.options.some(opt => !opt.trim()) || !newQuestionForm.correctAnswer || !newQuestionForm.skillTag) {
            return toast.error("Please fill all fields, all 4 options, the correct answer, and a skill tag.");
        }

        if (!newQuestionForm.options.includes(newQuestionForm.correctAnswer)) {
            return toast.error("Correct answer must exactly match one of the options.");
        }

        try {
            if (editingQuestionId) {
                const updatedQuestion = await apiRequest<any>(`/courses/${managingLessonsCourse._id}/lessons/${managingQuizLesson._id}/quiz/${editingQuestionId}`, {
                    method: 'PUT',
                    body: JSON.stringify(newQuestionForm)
                });
                setQuizQuestions(quizQuestions.map(q => q._id === editingQuestionId ? updatedQuestion : q));
                toast.success("Question updated successfully");
            } else {
                const addedQuestion = await apiRequest<any>(`/courses/${managingLessonsCourse._id}/lessons/${managingQuizLesson._id}/quiz`, {
                    method: 'POST',
                    body: JSON.stringify(newQuestionForm)
                });
                setQuizQuestions([...quizQuestions, addedQuestion]);
                toast.success("Question added successfully");
            }
            setNewQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '' });
            setEditingQuestionId(null);
        } catch (error) {
            console.error(error);
            toast.error(editingQuestionId ? "Failed to update question" : "Failed to add question");
        }
    };

    const handleDeleteQuestion = async (quizId: string) => {
        if (!managingLessonsCourse?._id || !managingQuizLesson?._id) return;
        if (!confirm("Are you sure you want to delete this question?")) return;

        try {
            await apiRequest<any>(`/courses/${managingLessonsCourse._id}/lessons/${managingQuizLesson._id}/quiz/${quizId}`, {
                method: 'DELETE'
            });
            setQuizQuestions(quizQuestions.filter(q => q._id !== quizId));
            toast.success("Question deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete question");
        }
    };

    const startNewParams: Course = {
        title: "",
        description: "",
        instructor: "",
        duration: "",
        level: "Beginner",
        category: "Frontend",
        lessons: [],
        totalLessons: 0,
        students: 0,
        imageUrl: "",
        courseUrl: "",
        enforceOrder: false
    }

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Course Manager</h2>
                    <p className="text-muted-foreground">Manage learning resources and curriculum.</p>
                </div>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditForm(startNewParams)}>
                            <Plus className="size-4 mr-2" /> Add New Course
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editForm?._id ? "Edit Course" : "Add New Course"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Title</label>
                                    <Input
                                        value={editForm?.title}
                                        onChange={(e) => setEditForm({ ...editForm!, title: e.target.value })}
                                        placeholder="e.g. Advanced React Patterns"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Instructor</label>
                                    <Input
                                        value={editForm?.instructor}
                                        onChange={(e) => setEditForm({ ...editForm!, instructor: e.target.value })}
                                        placeholder="Instructor Name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={editForm?.description || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                                    placeholder="Enter course description..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select
                                        value={editForm?.category}
                                        onValueChange={(val: any) => setEditForm({ ...editForm!, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Frontend">Frontend</SelectItem>
                                            <SelectItem value="Backend">Backend</SelectItem>
                                            <SelectItem value="DevOps">DevOps</SelectItem>
                                            <SelectItem value="Database">Database</SelectItem>
                                            <SelectItem value="Language">Language</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Level</label>
                                    <Select
                                        value={editForm?.level}
                                        onValueChange={(val: any) => setEditForm({ ...editForm!, level: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Duration</label>
                                    <Input
                                        value={editForm?.duration}
                                        onChange={(e) => setEditForm({ ...editForm!, duration: e.target.value })}
                                        placeholder="e.g. 12 hours"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Lessons Count</label>
                                    <Input
                                        type="number"
                                        value={editForm?.totalLessons || 0}
                                        onChange={(e) => setEditForm({ ...editForm!, totalLessons: parseInt(e.target.value) || 0 })}
                                        placeholder="e.g. 45"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Image URL (Optional)</label>
                                <input
                                    type="text"
                                    value={editForm?.imageUrl || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, imageUrl: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Course Link/URL (Optional)</label>
                                <input
                                    type="text"
                                    value={editForm?.courseUrl || ""}
                                    onChange={(e) => setEditForm({ ...editForm!, courseUrl: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg"
                                    placeholder="https://... (external link)"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="checkbox"
                                    id="enforceOrder"
                                    checked={editForm?.enforceOrder || false}
                                    onChange={(e) => setEditForm({ ...editForm!, enforceOrder: e.target.checked })}
                                    className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="enforceOrder" className="text-sm font-medium">
                                    Enforce Strict Linear Progression (Students must complete lessons in order)
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button onClick={handleSave}>Save Course</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage Lessons Dialog */}
                <Dialog open={!!managingLessonsCourse} onOpenChange={(open) => !open && setManagingLessonsCourse(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Lessons for: {managingLessonsCourse?.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                            {/* Existing Lessons List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Existing Lessons</h3>
                                {loadingLessons ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary size-6" /></div>
                                ) : courseLessons.length === 0 ? (
                                    <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg text-center">No lessons added yet.</div>
                                ) : (
                                    <div className="border border-border rounded-lg divide-y divide-border">
                                        {courseLessons.map((lesson, index) => (
                                            <div key={lesson._id} className="flex items-center justify-between p-3 bg-card hover:bg-secondary/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{index + 1}</div>
                                                    <div>
                                                        <div className="p-0 font-medium text-sm">{lesson.title}</div>
                                                        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{lesson.type}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {lesson.type === 'quiz' && (
                                                        <Button variant="outline" size="sm" className="h-8 shadow-sm" onClick={() => handleManageQuiz(lesson)}>
                                                            Edit Questions
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDeleteLesson(lesson._id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className="border-border" />

                            {/* Add New Lesson Form */}
                            <div className="space-y-4 bg-secondary/10 p-4 border border-border rounded-xl">
                                <h3 className="font-semibold text-sm">Add New Lesson</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Lesson Title</label>
                                        <Input 
                                            value={newLessonForm.title} 
                                            onChange={(e) => setNewLessonForm({...newLessonForm, title: e.target.value})} 
                                            placeholder="e.g. Introduction to Variables" 
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Lesson Type</label>
                                        <Select value={newLessonForm.type} onValueChange={(val: any) => setNewLessonForm({...newLessonForm, type: val})}>
                                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="video">Embedded Video</SelectItem>
                                                <SelectItem value="article">Rich Text Article</SelectItem>
                                                <SelectItem value="external">External Link</SelectItem>
                                                <SelectItem value="quiz">Interactive Quiz</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                {newLessonForm.type === 'video' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">YouTube/Video URL</label>
                                        <Input 
                                            value={newLessonForm.videoUrl} 
                                            onChange={(e) => setNewLessonForm({...newLessonForm, videoUrl: e.target.value})} 
                                            placeholder="https://youtube.com/watch?v=..." 
                                            className="h-9"
                                        />
                                    </div>
                                )}
                                
                                {newLessonForm.type === 'external' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">External Resource URL</label>
                                        <Input 
                                            value={newLessonForm.externalUrl} 
                                            onChange={(e) => setNewLessonForm({...newLessonForm, externalUrl: e.target.value})} 
                                            placeholder="https://..." 
                                            className="h-9"
                                        />
                                    </div>
                                )}
                                
                                {newLessonForm.type === 'article' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Article Content (HTML allowed)</label>
                                        <Textarea 
                                            value={newLessonForm.content} 
                                            onChange={(e) => setNewLessonForm({...newLessonForm, content: e.target.value})} 
                                            placeholder="<p>Write your lesson content here...</p>" 
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                )}
                                
                                {newLessonForm.type === 'quiz' && (
                                    <p className="text-xs text-muted-foreground bg-primary/10 text-primary p-2 rounded">
                                        Once you add this quiz to the course, you can click "Edit Questions" next to it to add individual questions!
                                    </p>
                                )}

                                <Button onClick={handleAddLesson} className="w-full mt-2" size="sm">
                                    <Plus className="size-4 mr-2" /> Add Lesson to Course
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage Quiz Dialog */}
                <Dialog open={!!managingQuizLesson} onOpenChange={(open) => !open && setManagingQuizLesson(null)}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Manage Quiz: {managingQuizLesson?.title}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                            {/* Existing Questions List */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Existing Questions ({quizQuestions.length})</h3>
                                {loadingQuiz ? (
                                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary size-6" /></div>
                                ) : quizQuestions.length === 0 ? (
                                    <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-lg text-center">No questions added yet.</div>
                                ) : (
                                    <div className="border border-border rounded-lg divide-y divide-border">
                                        {quizQuestions.map((q, index) => (
                                            <div key={q._id} className="flex items-start justify-between p-3 bg-card hover:bg-secondary/20">
                                                <div className="flex items-start gap-3">
                                                    <div className="size-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">{index + 1}</div>
                                                    <div>
                                                        <div className="font-medium text-sm mb-1">{q.question}</div>
                                                        <div className="text-xs text-muted-foreground mb-1">
                                                            <strong>Options:</strong> {q.options.join(', ')}
                                                        </div>
                                                        <div className="text-xs text-green-600 dark:text-green-500 font-medium">
                                                            Answer: {q.correctAnswer} <span className="text-muted-foreground ml-2">({q.skillTag})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end mt-1">
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10" onClick={() => handleEditQuestionClick(q)}>
                                                        <Edit className="size-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDeleteQuestion(q._id)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <hr className="border-border" />

                            {/* Add New Question Form */}
                            <div className="space-y-4 bg-secondary/10 p-4 border border-border rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">{editingQuestionId ? "Edit Question" : "Add New Question"}</h3>
                                    {editingQuestionId && (
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            setEditingQuestionId(null);
                                            setNewQuestionForm({ question: '', options: ['', '', '', ''], correctAnswer: '', skillTag: '' });
                                        }} className="h-6 text-xs text-muted-foreground">Cancel Edit</Button>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-medium">Question Text</label>
                                    <Textarea 
                                        value={newQuestionForm.question} 
                                        onChange={(e) => setNewQuestionForm({...newQuestionForm, question: e.target.value})} 
                                        placeholder="What is..." 
                                        className="h-16 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {newQuestionForm.options.map((opt, i) => (
                                        <div key={i} className="space-y-1">
                                            <label className="text-xs font-medium text-muted-foreground">Option {i + 1}</label>
                                            <Input 
                                                value={opt} 
                                                onChange={(e) => {
                                                    const newOpts = [...newQuestionForm.options];
                                                    newOpts[i] = e.target.value;
                                                    setNewQuestionForm({...newQuestionForm, options: newOpts});
                                                }} 
                                                placeholder={`Option ${i + 1}`} 
                                                className="h-9"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Exact Correct Answer</label>
                                        <Input 
                                            value={newQuestionForm.correctAnswer} 
                                            onChange={(e) => setNewQuestionForm({...newQuestionForm, correctAnswer: e.target.value})} 
                                            placeholder="Must perfectly match one option" 
                                            className="h-9"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium">Targeted Skill Tag</label>
                                        <Input 
                                            value={newQuestionForm.skillTag} 
                                            onChange={(e) => setNewQuestionForm({...newQuestionForm, skillTag: e.target.value})} 
                                            placeholder="e.g. React, Variables" 
                                            className="h-9"
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleAddQuestion} className="w-full mt-2" size="sm">
                                    <Plus className="size-4 mr-2" /> {editingQuestionId ? "Update Question" : "Save Question"}
                                </Button>
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
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary text-muted-foreground font-medium">
                            <TableRow>
                                <TableHead className="p-4">Course</TableHead>
                                <TableHead className="p-4">Instructor</TableHead>
                                <TableHead className="p-4">Level</TableHead>
                                <TableHead className="p-4">Stats</TableHead>
                                <TableHead className="p-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No courses found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCourses.map((course) => (
                                    <TableRow key={course._id} className="group border-t border-border hover:bg-secondary/20 transition-colors">
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600">
                                                    <BookOpen className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{course.title}</div>
                                                    <div className="text-xs text-muted-foreground">{course.category}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="text-sm">{course.instructor}</div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                                                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {course.level}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Users className="size-3" /> {course.students}</span>
                                                <span className="flex items-center gap-1"><Video className="size-3" /> {course.totalLessons || (Array.isArray(course.lessons) ? course.lessons.length : 0)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 shadow-sm"
                                                    onClick={() => handleManageLessons(course)}
                                                >
                                                    Lessons
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                                    onClick={() => {
                                                        setEditForm(course);
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                                    onClick={() => course._id && handleDelete(course._id)}
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
