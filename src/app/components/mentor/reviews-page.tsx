import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, FileText, ArrowRight } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
export function ReviewsPage() {
    const [activeTab, setActiveTab] = useState("pending");
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const fetchedReviews = await apiRequest<any[]>("/mentors/reviews");
                setReviews(fetchedReviews);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const formatDistanceToNow = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

        if (diffInDays > 0) return `${diffInDays}d ago`;
        if (diffInHours > 0) return `${diffInHours}h ago`;
        return 'Just now';
    };

    const filteredReviews = reviews.filter(review => review.status === activeTab);

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                <p className="text-muted-foreground">Review student submissions and provide feedback.</p>
            </div>

            <Tabs defaultValue="pending" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground animate-pulse">Loading reviews...</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                            <h3 className="text-lg font-medium text-muted-foreground">No {activeTab} reviews</h3>
                            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <Card key={review._id} className="group hover:border-primary/50 transition-all">
                                <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{review.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarImage src={review.studentAvatar} />
                                                    <AvatarFallback className="text-[10px]">{review.studentName ? review.studentName[0] : 'S'}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm text-muted-foreground">{review.studentName}</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-sm text-muted-foreground">{formatDistanceToNow(review.assignDate)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        {review.status === 'pending' && (
                                            <Badge variant="secondary">
                                                Pending Review
                                            </Badge>
                                        )}
                                        {review.status === 'completed' && (
                                            <Badge variant="outline" className="border-green-500 text-green-600">
                                                Reviewed
                                            </Badge>
                                        )}
                                        <Button className="gap-2 group-hover:translate-x-1 transition-transform">
                                            {review.status === 'pending' ? 'Start Review' : 'View Feedback'}
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
