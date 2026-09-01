import { apiRequest } from './api';

export interface SkillMasteryItem {
    _id?: string;
    skillName: string;
    category?: string;
    masteryScore: number;
    level: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
    confidenceScore?: number;
    assessmentScore?: number;
    assessmentCount?: number;
    mistakeCount?: number;
    mistakeRate?: number;
    practiceCount?: number;
    status: 'locked' | 'pending' | 'in-progress' | 'completed' | 'verified' | 'mastered' | 'remediation';
    isBlocked?: boolean;
    blockedReason?: string;
    prerequisites?: string[];
}

export interface MasterySummary {
    overallMastery: number;
    level: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
    totalSkillsTracked: number;
    skillsMasteredCount: number;
    skillGapsCount: number;
    learningVelocity: number;
    strongestSkills: { name: string; masteryScore: number; level: string }[];
    weakestSkills: { name: string; masteryScore: number; level: string; mistakeCount?: number }[];
    distribution: {
        Beginner: number;
        Developing: number;
        Proficient: number;
        Mastered: number;
    };
}

export interface SkillGraphNode {
    id: string;
    name: string;
    masteryScore: number;
    level: 'Beginner' | 'Developing' | 'Proficient' | 'Mastered';
    status: 'mastered' | 'proficient' | 'developing' | 'weak' | 'locked' | 'pending';
    isBlocked: boolean;
    prerequisites: string[];
    mistakeCount: number;
    assessmentScore: number;
}

export interface SkillGraphEdge {
    from: string;
    to: string;
    type: string;
}

export interface SkillGraphData {
    nodes: SkillGraphNode[];
    edges: SkillGraphEdge[];
}

export interface NextBestActionData {
    title: string;
    description: string;
    actionType: 'setup_profile' | 'remediation' | 'prerequisite' | 'assessment' | 'learn' | 'review';
    skill?: string | null;
    targetSkill?: string;
    priority: 'critical' | 'high' | 'medium' | 'normal' | 'low';
    reason?: string;
}

export interface DashboardInsightsData {
    overallMastery: number;
    level: string;
    skillsMasteredCount: number;
    skillGapsCount: number;
    learningVelocity: number;
    strongestSkills: { name: string; masteryScore: number; level: string }[];
    weakestSkills: { name: string; masteryScore: number; level: string; mistakeCount?: number }[];
    distribution: {
        Beginner: number;
        Developing: number;
        Proficient: number;
        Mastered: number;
    };
    nextBestAction: NextBestActionData;
    roadmapVersion: number;
    roadmapGoal: string;
}

export interface AssessmentQuestion {
    questionId: string;
    question: string;
    options: string[];
    topic?: string;
    difficulty?: string;
}

export interface AssessmentData {
    _id: string;
    title: string;
    skill: string;
    difficulty: string;
    questions: AssessmentQuestion[];
}

export interface AssessmentSubmissionResult {
    attempt: any;
    isPassed: boolean;
    score: number;
    correctCount: number;
    totalQuestions: number;
    mistakesLoggedCount: number;
    updatedMastery?: SkillMasteryItem;
}

export interface AssessmentAttemptRecord {
    _id: string;
    skill: string;
    score: number;
    correctAnswersCount: number;
    totalQuestions: number;
    difficulty: string;
    createdAt: string;
}

// API Methods
export const getSkillMastery = () => 
    apiRequest<{ masteries: SkillMasteryItem[]; summary: MasterySummary }>('/skills/mastery');

export const getSkillGraph = () => 
    apiRequest<SkillGraphData>('/skills/graph');

export const getSkillGaps = () => 
    apiRequest<any>('/skills/gaps');

export const getSkillRecommendations = (skill?: string) => 
    apiRequest<any>(skill ? `/skills/recommendations?skill=${encodeURIComponent(skill)}` : '/skills/recommendations');

export const getAdaptiveRoadmap = () => 
    apiRequest<any>('/adaptive/roadmap');

export const getNextBestAction = () => 
    apiRequest<NextBestActionData>('/adaptive/next-action');

export const getDashboardInsights = () => 
    apiRequest<DashboardInsightsData>('/adaptive/insights');

export const getAssessmentForSkill = (skillName: string, difficulty = 'intermediate') => 
    apiRequest<AssessmentData>(`/assessments/skill/${encodeURIComponent(skillName)}?difficulty=${difficulty}`);

export const submitAssessmentAnswers = (
    assessmentId: string, 
    answers: { questionId: string; selectedOption: string }[], 
    timeSpentSeconds = 0
) => 
    apiRequest<AssessmentSubmissionResult>(`/assessments/${assessmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers, timeSpentSeconds })
    });

export const getAssessmentHistory = (skill?: string) => 
    apiRequest<AssessmentAttemptRecord[]>(skill ? `/assessments/history?skill=${encodeURIComponent(skill)}` : '/assessments/history');
