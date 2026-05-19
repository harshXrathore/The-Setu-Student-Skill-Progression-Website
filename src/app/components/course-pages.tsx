import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle, Clock, PlayCircle, Lock, ArrowLeft, ExternalLink, Video, FileText, Star, X } from "lucide-react";
import { 
    getCourseById, 
    getUserCourseProgress, 
    markLessonComplete, 
    getLessonById, 
    getQuizByLesson, 
    submitQuizAnswer,
    submitCourseReview,
    Course,
    Lesson,
    CourseProgress,
    QuizQuestion
} from "../lib/learningApi";
import DOMPurify from "dompurify";

export function CoursePage() {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [progress, setProgress] = useState<CourseProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;
        const fetchCourseData = async () => {
            try {
                const [courseData, progressData] = await Promise.all([
                    getCourseById(courseId),
                    getUserCourseProgress(courseId)
                ]);
                setCourse(courseData);
                setProgress(progressData);
            } catch (err) {
                console.error("Error fetching course", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [courseId]);

    if (loading) return <div className="p-10 text-center">Loading course...</div>;
    if (!course) return <div className="p-10 text-center">Course not found</div>;

    const completedLessonIds = progress?.completedLessons || [];
    const percent = progress?.progressPercentage || 0;

    // Find next lesson
    let nextLessonId = course.lessons[0]?._id;
    for (const lesson of course.lessons) {
        if (!completedLessonIds.includes(lesson._id)) {
            nextLessonId = lesson._id;
            break;
        }
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <button onClick={() => navigate('/dashboard/learning')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" /> Back to Learning
            </button>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                                {course.skillTag || 'Skill'}
                            </span>
                            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-bold uppercase tracking-wider">
                                {course.difficulty}
                            </span>
                            {course.rating > 0 && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500 rounded-full text-xs font-bold flex items-center gap-1">
                                    <Star className="size-3 fill-current" /> {course.rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-muted-foreground mb-6 text-lg">{course.description || 'Level up your skills with this curated interactive course.'}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-foreground mb-8">
                            <div className="flex items-center gap-2">
                                <BookOpen className="size-5 text-muted-foreground" />
                                <span className="font-medium">{course.lessons.length} Lessons</span>
                            </div>
                            {course.provider && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium inline-block size-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white text-xs">{course.provider.charAt(0)}</span>
                                    <span className="font-medium">{course.provider}</span>
                                </div>
                            )}
                        </div>

                        {progress && progress.status !== 'not-started' ? (
                            <div className="w-full max-w-md bg-secondary/50 rounded-xl p-4 border border-border">
                                <div className="flex justify-between text-sm mb-2 font-bold">
                                    <span>Your Progress</span>
                                    <span className="text-primary">{percent}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                                </div>
                                <button 
                                    onClick={() => {
                                        if (course.courseUrl) {
                                            window.open(course.courseUrl, '_blank');
                                        } else if (nextLessonId) {
                                            navigate(`/dashboard/courses/${course._id}/lesson/${nextLessonId}`);
                                        }
                                    }}
                                    className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                >
                                    {percent >= 100 ? 'Review Course' : 'Resume Learning'}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => {
                                    if (course.courseUrl) {
                                        window.open(course.courseUrl, '_blank');
                                    } else if (nextLessonId) {
                                        navigate(`/dashboard/courses/${course._id}/lesson/${nextLessonId}`);
                                    }
                                }}
                                className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors text-lg"
                            >
                                Start Course
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {course.lessons && course.lessons.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Course Content</h2>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                        {course.lessons.map((lesson: any, index: number) => {
                        const isCompleted = completedLessonIds.includes(lesson._id);
                        // User can access if it's the first lesson, or if the previous lesson is completed.
                        const prevLessonId = index > 0 ? course.lessons[index-1]._id : null;
                        const isLocked = course.enforceOrder && prevLessonId && !completedLessonIds.includes(prevLessonId);

                        return (
                            <div 
                                key={lesson._id}
                                onClick={() => !isLocked && navigate(`/dashboard/courses/${course._id}/lesson/${lesson._id}`)}
                                className={`p-5 flex items-center justify-between transition-colors ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 cursor-pointer'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full flex items-center justify-center bg-secondary text-muted-foreground shrink-0 font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className={`font-medium text-lg ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                                            {lesson.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                                {lesson.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {isLocked ? (
                                        <Lock className="size-5 text-muted-foreground" />
                                    ) : isCompleted ? (
                                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                                            <CheckCircle className="size-6" />
                                            <span className="hidden sm:inline">Completed</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                            <PlayCircle className="size-6" />
                                            <span className="hidden sm:inline">Start</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            )}
        </div>
    );
}

export function LessonPage() {
    const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [finishing, setFinishing] = useState(false);
    
    // Quiz state
    const [selectedOption, setSelectedOption] = useState<string>("");
    const [quizResult, setQuizResult] = useState<{ isCorrect: boolean, correctAnswer?: string } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [userAnswers, setUserAnswers] = useState<{quizId: string, selectedOption: string}[]>([]);
    
    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (!lessonId) return;
        const fetchLessonData = async () => {
            try {
                const lessonData = await getLessonById(lessonId);
                setLesson(lessonData);
                
                if (lessonData.type === 'quiz') {
                    const quizData = await getQuizByLesson(lessonId);
                    setQuiz(quizData);
                }
            } catch (err) {
                console.error("Error fetching lesson", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessonData();
        setQuizResult(null);
        setSelectedOption("");
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizCompleted(false);
        setUserAnswers([]);
    }, [lessonId]);

    const handleComplete = async () => {
        if (!courseId || !lessonId) return;
        setFinishing(true);
        try {
            const res = await markLessonComplete(courseId, lessonId, userAnswers);
            if (res.progressPercentage >= 100) {
                setShowReviewModal(true);
            } else {
                navigate(`/dashboard/courses/${courseId}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setFinishing(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!courseId) return;
        setSubmittingReview(true);
        try {
            await submitCourseReview(courseId, reviewRating, reviewComment);
            setShowReviewModal(false);
            navigate(`/dashboard/courses/${courseId}`);
        } catch (error) {
            console.error(error);
            setShowReviewModal(false);
            navigate(`/dashboard/courses/${courseId}`);
        }
    };

    const handleQuizSubmit = async () => {
        if (!quiz.length || !selectedOption) return;
        try {
            const currentQ = quiz[currentQuestionIndex];
            setUserAnswers(prev => [...prev, { quizId: currentQ._id, selectedOption }]);
            const res = await submitQuizAnswer(currentQ._id, selectedOption);
            setQuizResult(res);
            if (res.isCorrect) setScore(score + 1);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setQuizResult(null);
            setSelectedOption("");
        } else {
            setQuizCompleted(true);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading lesson...</div>;
    if (!lesson) return <div className="p-10 text-center">Lesson not found</div>;

    const renderLessonContent = () => {
        switch (lesson.type) {
            case 'video':
                return (
                    <div className="space-y-6">
                        <div className="aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
                            {lesson.videoUrl ? (
                                <iframe 
                                    src={(() => {
                                        const url = lesson.videoUrl || '';
                                        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
                                        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
                                    })()} 
                                    className="w-full h-full" 
                                    allowFullScreen 
                                    title={lesson.title}
                                />
                            ) : (
                                <div className="text-white/50 flex flex-col items-center gap-4">
                                    <Video className="size-16" />
                                    <p>Video content not available</p>
                                </div>
                            )}
                        </div>
                        {lesson.content && (
                            <div className="prose dark:prose-invert max-w-none bg-card p-6 rounded-xl border border-border">
                                <p>{lesson.content}</p>
                            </div>
                        )}
                    </div>
                );
            case 'article':
                return (
                    <div className="prose dark:prose-invert max-w-none bg-card p-8 rounded-2xl border border-border">
                        {lesson.content ? (
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.content.replace(/\n/g, '<br/>')) }} />
                        ) : (
                            <div className="text-muted-foreground flex flex-col items-center gap-4 py-10">
                                <FileText className="size-16" />
                                <p>Article content is empty.</p>
                            </div>
                        )}
                    </div>
                );
            case 'external':
                return (
                    <div className="bg-card p-10 rounded-2xl border border-border flex flex-col items-center text-center space-y-6">
                        <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <ExternalLink className="size-10" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-2">External Resource</h3>
                            <p className="text-muted-foreground text-lg mb-6 max-w-md">This lesson takes place on an external platform. Click the button below to open it in a new tab.</p>
                        </div>
                        {lesson.externalUrl && (
                            <a 
                                href={lesson.externalUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                Open Resource <ExternalLink className="size-5" />
                            </a>
                        )}
                        <p className="text-sm text-muted-foreground mt-4">Don't forget to mark this lesson as complete when you're done!</p>
                    </div>
                );
            case 'quiz':
                if (!quiz.length) return <div className="p-10 text-center bg-card rounded-xl border border-border">No quiz questions found for this lesson.</div>;
                
                if (quizCompleted) {
                    const passPercent = (score / quiz.length) * 100;
                    const passed = passPercent >= 50; // simple 50% passing logic
                    return (
                        <div className="bg-card p-10 rounded-2xl border border-border flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto shadow-sm">
                            <div className={`size-24 rounded-full flex items-center justify-center text-5xl mb-2 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {passed ? '🎉' : '💪'}
                            </div>
                            <h3 className="text-3xl font-bold">Quiz Completed</h3>
                            <p className="text-xl text-muted-foreground mb-4">You scored {score} out of {quiz.length} ({Math.round(passPercent)}%)</p>
                            
                            {passed ? (
                                <div className="space-y-4 w-full">
                                    <p className="text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-950/30 p-4 rounded-xl">Great job! You have passed the knowledge check.</p>
                                    <button 
                                        onClick={handleComplete}
                                        disabled={finishing}
                                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors text-lg"
                                    >
                                        {finishing ? 'Completing...' : 'Mark Lesson Complete'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 w-full">
                                    <p className="text-red-600 dark:text-red-500 font-medium bg-red-50 dark:bg-red-950/30 p-4 rounded-xl">You need at least 50% to pass this quiz and continue. Review your notes and try again!</p>
                                    <button 
                                        onClick={() => {
                                            setCurrentQuestionIndex(0);
                                            setScore(0);
                                            setQuizCompleted(false);
                                            setUserAnswers([]);
                                            setQuizResult(null);
                                            setSelectedOption("");
                                        }}
                                        className="w-full py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors text-lg"
                                    >
                                        Retake Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                }

                const q = quiz[currentQuestionIndex];
                
                return (
                    <div className="bg-card p-8 rounded-2xl border border-border shadow-sm max-w-3xl mx-auto">
                        <div className="mb-6 flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <span className="text-xs uppercase tracking-widest font-bold text-primary mb-2 block">
                                    Question {currentQuestionIndex + 1} of {quiz.length}
                                </span>
                                <h3 className="text-2xl font-bold leading-tight">{q.question}</h3>
                            </div>
                            <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0">{q.skillTag}</span>
                        </div>
                        
                        <div className="space-y-3 mb-8">
                            {q.options.map((opt, i) => (
                                <button
                                    key={i}
                                    disabled={quizResult !== null}
                                    onClick={() => setSelectedOption(opt)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium ${
                                        selectedOption === opt 
                                            ? 'border-primary bg-primary/5 text-primary' 
                                            : 'border-border hover:border-border/80 bg-background'
                                    } ${
                                        quizResult?.correctAnswer === opt && 'border-green-500 bg-green-500/10 text-green-600'
                                    } ${
                                        quizResult && !quizResult.isCorrect && selectedOption === opt && 'border-red-500 bg-red-500/10 text-red-600'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {!quizResult ? (
                            <button 
                                onClick={handleQuizSubmit}
                                disabled={!selectedOption}
                                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex justify-center"
                            >
                                Submit Answer
                            </button>
                        ) : (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl font-bold flex items-center gap-3 ${quizResult.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {quizResult.isCorrect ? (
                                        <>
                                            <CheckCircle className="size-6 shrink-0" />
                                            Awesome job! That's correct.
                                        </>
                                    ) : (
                                        <>
                                            <span className="size-6 shrink-0 flex items-center justify-center rounded-full bg-red-200 text-red-800">×</span>
                                            Not quite. The correct answer was: {quizResult.correctAnswer}. This mistake will be recorded to help you improve!
                                        </>
                                    )}
                                </div>
                                <button 
                                    onClick={handleNextQuestion}
                                    className="w-full py-3 bg-foreground text-background font-bold rounded-xl hover:bg-foreground/90 transition-colors"
                                >
                                    {currentQuestionIndex < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                return <div>Unknown lesson type</div>;
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate(`/dashboard/courses/${courseId}`)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium">
                    <ArrowLeft className="size-4" /> Back to Course
                </button>
                {lesson.type !== 'quiz' && (
                    <button 
                        onClick={handleComplete}
                        disabled={finishing}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <CheckCircle className="size-4" />
                        {finishing ? 'Marking...' : 'Mark Complete'}
                    </button>
                )}
            </div>

            <div className="mb-4">
                <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
                    <span className="uppercase tracking-widest text-xs bg-secondary px-2 py-0.5 rounded">{lesson.type}</span>
                </div>
            </div>

            {renderLessonContent()}
            
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden p-6 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                <Star className="size-8 fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold">Course Completed!</h2>
                            <p className="text-muted-foreground">You've successfully finished this course. Help others by sharing your experience.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button 
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`transition-colors p-1 ${star <= reviewRating ? 'text-yellow-500' : 'text-muted'}`}
                                    >
                                        <Star className="size-8 fill-current" />
                                    </button>
                                ))}
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium mb-1 block text-muted-foreground">Optional Review</label>
                                <textarea 
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="What did you think of the course?"
                                    className="w-full bg-background border border-border rounded-xl p-3 h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowReviewModal(false);
                                    navigate(`/dashboard/courses/${courseId}`);
                                }}
                                className="flex-1 py-3 text-sm font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-colors"
                            >
                                Skip
                            </button>
                            <button 
                                onClick={handleReviewSubmit}
                                disabled={submittingReview}
                                className="flex-1 py-3 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors"
                            >
                                {submittingReview ? 'Submitting...' : 'Post Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
