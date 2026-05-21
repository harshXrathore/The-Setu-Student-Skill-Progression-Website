import { useState, useEffect } from "react";
import { apiRequest } from "../../lib/api";
import {
    MessageSquare,
    Search,
    Trash2,
    Loader2,
    ThumbsUp,
    User,
    Calendar,
    AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";

interface Post {
    _id: string;
    title: string;
    content: string;
    category: 'Career Advice' | 'Learning' | 'Technical Help' | 'General';
    user: {
        _id: string;
        name: string;
    };
    likes: number;
    commentsCount: number;
    createdAt: string;
}

export function CommunityManager() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [postToDelete, setPostToDelete] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const data = await apiRequest<Post[]>('/community/posts');
            setPosts(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load community posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async () => {
        if (!postToDelete) return;
        try {
            await apiRequest(`/community/posts/${postToDelete}`, { method: 'DELETE' });
            setPosts(posts.filter(p => p._id !== postToDelete));
            toast.success("Post removed successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove post");
        } finally {
            setPostToDelete(null);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Community Moderation</h2>
                    <p className="text-muted-foreground">Monitor and moderate community discussions.</p>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        className="pl-9"
                        placeholder="Search posts, content, or users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-secondary text-muted-foreground font-medium">
                            <TableRow>
                                <TableHead className="p-4">Post Details</TableHead>
                                <TableHead className="p-4">Author</TableHead>
                                <TableHead className="p-4">Category</TableHead>
                                <TableHead className="p-4">Engagement</TableHead>
                                <TableHead className="p-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPosts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No posts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPosts.map((post) => (
                                    <TableRow key={post._id} className="group border-t border-border hover:bg-secondary/20 transition-colors">
                                        <TableCell className="p-4 max-w-md">
                                            <div className="space-y-1">
                                                <div className="font-medium text-foreground line-clamp-1">{post.title}</div>
                                                <div className="text-xs text-muted-foreground line-clamp-2">{post.content}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                                                    <Calendar className="size-3" />
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="size-6 rounded-full bg-secondary flex items-center justify-center">
                                                    <User className="size-3 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-medium">{post.user?.name || "Unknown User"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge variant="outline" className="font-normal">
                                                {post.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><ThumbsUp className="size-3" /> {post.likes}</span>
                                                <span className="flex items-center gap-1"><MessageSquare className="size-3" /> {post.commentsCount}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setPostToDelete(post._id)}
                                            >
                                                <Trash2 className="size-4 mr-1" /> Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post and remove it from the community feeds.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Post
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
