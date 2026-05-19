import { apiRequest } from './api';

export interface Course {
    _id: string;
    title: string;
    description?: string;
    skillTag?: string;
    difficulty: string;
    provider?: string;
    lessons: string[] | any[];
    recommendedFor?: string[];
    students: number;
    rating: number;
    courseUrl?: string;
    imageUrl?: string;
    enforceOrder?: boolean;
}

export interface Lesson {
    _id: string;
    courseId: string;
    title: string;
    type: 'video' | 'article' | 'external' | 'quiz';
    content?: string;
    videoUrl?: string;
    externalUrl?: string;
    order: number;
}

export interface QuizQuestion {
    _id: string;
    lessonId: string;
    question: string;
    options: string[];
    correctAnswer: string;
    skillTag: string;
}

export const getCourseDashboard = () => 
    apiRequest<{
        recommended: Course[];
        weakSkills: Course[];
        roadmap: Course[];
        popular: Course[];
    }>('/courses/dashboard', { method: 'GET' });

export const getCourseById = (id: string) => 
    apiRequest<Course>(`/courses/${id}`, { method: 'GET' });

export const getLessonById = (id: string) => 
    apiRequest<Lesson>(`/courses/lesson/${id}`, { method: 'GET' });

export const getQuizByLesson = (lessonId: string) => 
    apiRequest<QuizQuestion[]>(`/courses/lesson/${lessonId}/quiz`, { method: 'GET' });

// Progress

export interface CourseProgress {
    completedLessons: string[];
    progressPercentage: number;
    status: 'not-started' | 'in-progress' | 'completed';
}

export const getProgressDashboard = () =>
    apiRequest<any>('/learning-progress/dashboard', { method: 'GET' });

export const getUserCourseProgress = (courseId: string) =>
    apiRequest<CourseProgress>(`/learning-progress/course/${courseId}`, { method: 'GET' });

export const markLessonComplete = (courseId: string, lessonId: string, answers?: {quizId: string, selectedOption: string}[]) =>
    apiRequest<CourseProgress>('/learning-progress/lesson/complete', {
        method: 'POST',
        body: JSON.stringify({ courseId, lessonId, answers })
    });

export const submitQuizAnswer = (quizId: string, selectedOption: string) =>
    apiRequest<{ isCorrect: boolean, correctAnswer: string }>('/learning-progress/quiz/submit', {
        method: 'POST',
        body: JSON.stringify({ quizId, selectedOption })
    });

export const submitCourseReview = (courseId: string, rating: number, comment?: string) =>
    apiRequest<{ message: string, review: any }>(`/courses/${courseId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment })
    });

// Admin ONLY APIs (these mirror the routes under /courses/:courseId/...)
export const editQuizQuestion = (courseId: string, lessonId: string, quizId: string, data: Partial<QuizQuestion>) =>
    apiRequest<QuizQuestion>(`/courses/${courseId}/lessons/${lessonId}/quiz/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });

// -------------------------------------------------------------------------------- //
// MISTAKE INTELLIGENCE ENGINE APIs
// -------------------------------------------------------------------------------- //

export interface Mistake {
    _id: string;
    userId: string;
    title: string;
    description?: string;
    skillTag: string;
    category: string;
    severity: number; // 1-5
    count: number;
    source: string;
    status: 'open' | 'resolved';
    createdAt: string;
}

export interface MistakeAnalytics {
    skillDistribution: { skill: string; count: number }[];
    mistakeTrend: { week: string; count: number }[];
    categoryDistribution: { category: string; count: number }[];
    resolutionStats: { status: string; count: number }[];
    analysis: {
        weakSkillsSorted: string[];
        countsBySkill: Record<string, number>;
        severityPointsBySkill: Record<string, number>;
        totalOpenMistakes: number;
        mistakeRecords: Mistake[];
    };
    recommendations: Course[];
}

export const getMistakeAnalytics = () =>
    apiRequest<MistakeAnalytics>('/mistakes/analytics', { method: 'GET' });

export const resolveMistake = (mistakeId: string) =>
    apiRequest<Mistake>(`/mistakes/${mistakeId}/resolve`, { method: 'PUT' });

export const reopenMistake = (mistakeId: string) =>
    apiRequest<Mistake>(`/mistakes/${mistakeId}/reopen`, { method: 'PUT' });

export const logManualMistake = (data: { title: string, description?: string, skillTag: string, category: string, severity: number }) =>
    apiRequest<Mistake>('/mistakes', {
        method: 'POST',
        body: JSON.stringify(data)
    });
