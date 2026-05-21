import { useState, useEffect, useRef } from "react";
import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Send,
  User,
  Compass,
  Trophy,
  Users,
  ArrowRight,
  BookOpen,
  Award,
  Zap,
  Sparkles,
  Activity
} from "lucide-react";
import { DashboardLayout } from "./dashboard-layout";
import { ProfilePage } from "./profile-page";
import { MistakeTrackingPage } from "./mistake-tracking-page";
import { SupportSettingsPage } from "./support-settings-page";
import { DetailedCareerExplorer, DetailedSkillRoadmap } from "./feature-pages";
import {
  JobBoardPage,
  LearningCoursesPage,
  MentorsPage,
  CommunityPage,
  AchievementsPage
} from "./additional-pages";
import { CoursePage, LessonPage } from "./course-pages";
import { ActivityHeatmap } from "./ui/activity-heatmap";
import { CircularProgress, BadgeStack, StatCard } from "./ui/stats-widgets";

import { ProfileSetupPopup } from "./profile-setup-popup";

export function DashboardMain() {
  const [showSetupPopup, setShowSetupPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is new
    const isNewUser = localStorage.getItem("isNewUser") === "true";
    if (isNewUser) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShowSetupPopup(true);
        localStorage.removeItem("isNewUser"); // Clear flag so it doesn't show again
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSetupProfile = () => {
    setShowSetupPopup(false);
    navigate("/dashboard/profile");
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="career-explorer" element={<DetailedCareerExplorer />} />
        <Route path="my-skills" element={<DetailedSkillRoadmap />} />
        <Route path="job-board" element={<JobBoardPage />} />
        <Route path="learning" element={<LearningCoursesPage />} />
        <Route path="courses/:courseId" element={<CoursePage />} />
        <Route path="courses/:courseId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="mentors" element={<MentorsPage />} />
        <Route path="community" element={<CommunityPage />} />
        <Route path="ai-chat" element={<AIChatAssistant />} />
        <Route path="mistake-tracker" element={<MistakeTrackingPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="support" element={<SupportSettingsPage />} />
        {/* Fallback to dashboard home */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>

      <ProfileSetupPopup
        isOpen={showSetupPopup}
        onClose={() => setShowSetupPopup(false)}
        onSetup={handleSetupProfile}
      />
    </DashboardLayout>
  );
}

import { useProfile } from "../context/profile-context";

// ... inside DashboardHome

import { apiRequest } from "../lib/api";
import { getMistakeAnalytics, MistakeAnalytics } from "../lib/learningApi";

// ... inside DashboardHome


function DashboardHome() {
  const { profile } = useProfile();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mentorSessions, setMentorSessions] = useState(0);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const [learningStats, setLearningStats] = useState<any>(null);
  const [mistakeAnalytics, setMistakeAnalytics] = useState<MistakeAnalytics | null>(null);
  const [gamificationStats, setGamificationStats] = useState<{ badgesEarned: number; dayStreak: number } | null>(null);
  const [mentors, setMentors] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [roadmapData, sessionsData, learningData, mistakeData, gamData, mentorsData, achievementsData] = await Promise.all([
          apiRequest("/skills/latest").catch(() => null),
          apiRequest<any[]>("/mentors/sessions").catch(() => []),
          apiRequest<any>("/learning-progress/dashboard").catch(() => null),
          getMistakeAnalytics().catch(() => null),
          apiRequest<any>("/gamification/stats").catch(() => null),
          apiRequest<any[]>("/mentors").catch(() => []),
          apiRequest<any[]>("/gamification/achievements").catch(() => [])
        ]);

        setRoadmap(roadmapData);
        setMentorSessions(sessionsData && Array.isArray(sessionsData) ? sessionsData.length : 0);
        setSessionsList(sessionsData && Array.isArray(sessionsData) ? sessionsData : []);
        setLearningStats(learningData);
        setMistakeAnalytics(mistakeData);
        if (gamData) setGamificationStats({ badgesEarned: gamData.badgesEarned || 0, dayStreak: gamData.dayStreak || 0 });
        if (mentorsData && Array.isArray(mentorsData)) setMentors(mentorsData.slice(0, 2));
        if (achievementsData && Array.isArray(achievementsData)) setAchievements(achievementsData.slice(0, 2));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const handleSkillsUpdate = () => {
      setLoading(true);
      fetchData();
    };
    window.addEventListener('skillsUpdated', handleSkillsUpdate);
    return () => window.removeEventListener('skillsUpdated', handleSkillsUpdate);
  }, []);

  // Stats
  const hasRoadmap = roadmap && roadmap.roadmapPhases && roadmap.roadmapPhases.length > 0;

  // Extract skills for display - flatten from phases
  const displaySkills = hasRoadmap
    ? roadmap.roadmapPhases.flatMap((phase: any) => phase.skills || [])
    : [];

  const activeCourses = learningStats?.inProgress?.length || 0;
  const completedCourses = learningStats?.completed?.length || 0;
  const totalCourses = learningStats?.totalProgress?.length || 0;
  const avgProgress = learningStats?.overallPercentage || 0;
  const badgesCount = gamificationStats?.badgesEarned ?? 0;
  const dayStreak = gamificationStats?.dayStreak ?? 0;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">

      {/* 1. Premium Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-background border border-border/50 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="absolute top-0 right-0 p-12 opacity-50 pointer-events-none">
          <div className="size-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse" />
            <div className="size-24 md:size-32 rounded-full border-4 border-background bg-card flex items-center justify-center shadow-xl overflow-hidden relative z-10">
              {profile.general.avatar ? (
                <img src={profile.general.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="size-12 text-muted-foreground" />
              )}
            </div>
            <div className="absolute bottom-1 right-1 z-20 bg-green-500 border-4 border-background size-6 rounded-full" title="Online" />
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
              Welcome back, {profile.general.firstName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {profile.general.headline || "Ready to continue your learning journey? Your roadmap is waiting for you."}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
              <div className="px-3 py-1 bg-background/50 backdrop-blur border border-border/50 rounded-full text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="size-3.5 text-yellow-500" /> Top Learner
              </div>
              <div className="px-3 py-1 bg-background/50 backdrop-blur border border-border/50 rounded-full text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="size-3.5 text-blue-500" /> {dayStreak > 0 ? `${dayStreak} Day Streak` : 'Start your streak!'}
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <CircularProgress value={avgProgress > 0 ? avgProgress : (hasRoadmap ? 12 : 0)} size={100} color="#8b5cf6" />
            <p className="text-xs text-center font-medium text-muted-foreground mt-2">Overall Progress</p>
          </div>
        </div>
      </div>

      {/* 2. Stats Grid - Masonry Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Skill Progress"
          value={avgProgress > 0 ? `${avgProgress}%` : (hasRoadmap ? "12%" : "0%")}
          change="Average"
          trend="up"
          icon={<Compass className="size-5" />}
          delay={0.1}
        />
        <StatCard
          title="Active Courses"
          value={activeCourses.toString()}
          change={totalCourses > 0 ? `${completedCourses} Completed` : "No Content"}
          trend="neutral"
          icon={<BookOpen className="size-5" />}
          delay={0.2}
        />
        <StatCard
          title="Mentor Sessions"
          value={mentorSessions.toString()}
          change="Upcoming: Tomorrow"
          trend="neutral"
          icon={<Users className="size-5" />}
          delay={0.3}
        />
        <StatCard
          title="Badges Earned"
          value={badgesCount.toString()}
          change="Keep going!"
          trend="up"
          icon={<Award className="size-5" />}
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Col - 2/3 */}
        <div className="lg:col-span-2 space-y-8">

          {/* Current Roadmap Section */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Compass className="size-5 text-primary" />
                  {hasRoadmap ? roadmap.title : "Current Roadmap"}
                </h2>
                <p className="text-sm text-muted-foreground">{hasRoadmap ? roadmap.goal : "Start your path"}</p>
              </div>
              <Link to="my-skills" className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-sm font-semibold transition-colors">
                {hasRoadmap ? "Continue" : "Create New"}
              </Link>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-zinc-900/30 min-h-[200px]">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/20 rounded-xl" />)}
                </div>
              ) : hasRoadmap ? (
                <div className="space-y-4">
                  {displaySkills.slice(0, 3).map((skill: any, index: number) => {
                    const status =
                      skill.status === 'completed' ? 'In Progress' :
                      skill.status === 'in-progress' ? 'In Progress' :
                      index === 0 ? 'In Progress' : 'Next Up';
                    const percent =
                      skill.status === 'completed' ? 100 :
                      skill.status === 'in-progress' ? (skill.progress ?? 0) :
                      0;
                    return (
                      <RoadmapItem
                        key={index}
                        title={skill.name}
                        status={status}
                        percent={percent}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="size-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Compass className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No Active Roadmap</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">Generate your first AI-powered roadmap to start tracking your progress.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Mentors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recommended Mentors</h2>
              <Link to="mentors" className="text-sm font-medium text-muted-foreground hover:text-primary">View All</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {mentors.length > 0 ? mentors.map((mentor: any, idx: number) => {
                const firstName = mentor.general?.firstName || '';
                const lastName = mentor.general?.lastName || '';
                const name = (firstName + ' ' + lastName).trim() || mentor.user?.name || 'Mentor';
                const jobTitle = mentor.occupation?.jobTitle || '';
                const company = mentor.occupation?.company || '';
                const role = jobTitle && company ? `${jobTitle} at ${company}` :
                             jobTitle || company || mentor.general?.headline || 'Professional Mentor';
                const rate = mentor.mentorDetails?.rate || 'Contact for rate';
                return <MentorCardHorizontal key={idx} name={name} role={role} rate={rate} />;
              }) : (
                <div className="col-span-2 text-center py-6 text-muted-foreground text-sm">
                  No mentors available yet. <Link to="mentors" className="text-primary hover:underline">Browse all mentors</Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Mentor Sessions (Student View) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Your Mentor Sessions</h2>
              <Link to="mentors" className="text-sm font-medium text-muted-foreground hover:text-primary">Find Mentors</Link>
            </div>
            <div className="space-y-3">
              {sessionsList.length === 0 ? (
                <div className="text-center py-6 bg-card rounded-xl border border-border text-muted-foreground text-sm">
                  No upcoming sessions. Book a mentor to accelerate your learning.
                </div>
              ) : (
                sessionsList.filter(s => ['Pending', 'Confirmed', 'Pending Reschedule'].includes(s.status)).map((session) => (
                  <div key={session._id} className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">{session.topic}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          session.status === 'Confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 
                          session.status === 'Pending Reschedule' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                        }`}>{session.status}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">with <span className="font-medium text-foreground">{session.mentor?.name || "Mentor"}</span></p>
                      
                      {session.status === 'Pending Reschedule' && session.notes && (
                         <div className="mt-2 text-xs italic text-orange-600/80 bg-orange-50/50 p-2 rounded-lg border border-orange-100">
                            {session.notes}
                         </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <p className="font-bold text-sm text-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>

                      {/* Action Triggers */}
                      {session.status === 'Confirmed' && session.meetingUrl && (
                        <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-xs transition-colors">
                            Join Meeting
                        </a>
                      )}
                      
                      {session.status === 'Pending Reschedule' && (
                        <div className="flex gap-2">
                           <button 
                             onClick={async () => {
                               try {
                                 await apiRequest(`/mentors/sessions/${session._id}/status`, { method: "PUT", body: JSON.stringify({ status: "Confirmed" }) });
                                 setSessionsList(prev => prev.map(s => s._id === session._id ? { ...s, status: "Confirmed" } : s));
                               } catch (e) {}
                             }} 
                             className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                           >Accept New Time</button>
                           <button 
                             onClick={async () => {
                               try {
                                 await apiRequest(`/mentors/sessions/${session._id}/status`, { method: "PUT", body: JSON.stringify({ status: "Cancelled" }) });
                                 setSessionsList(prev => prev.filter(s => s._id !== session._id));
                               } catch (e) {}
                             }} 
                             className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 font-semibold rounded-lg text-xs transition-colors"
                           >Decline</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <ActivityHeatmap isEmpty={!hasRoadmap} />

        </div>

        {/* Right Col - 1/3 (Sidebar) */}
        <div className="space-y-8">
          {/* Mistake Analyzer - Glass Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 p-1 text-white shadow-xl">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            <div className="bg-white/10 backdrop-blur-sm h-full rounded-xl p-6 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1">Mistake Analyzer</h3>
                  <p className="text-orange-100 text-xs opacity-90">AI-powered insights</p>
                </div>
                <Activity className="size-8 text-white opacity-80" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold mb-1">Total Issues</div>
                  <div className="text-2xl font-bold">{mistakeAnalytics ? mistakeAnalytics.analysis.totalOpenMistakes : "0"}</div>
                </div>
                <div className="bg-black/20 rounded-lg p-3">
                  <div className="text-xs text-white/70 uppercase tracking-wider font-bold mb-1">Patterns</div>
                  <div className="text-2xl font-bold">{mistakeAnalytics ? mistakeAnalytics.analysis.weakSkillsSorted.length : "0"}</div>
                </div>
              </div>

              <Link to="mistake-tracker" className="block w-full py-3 bg-white text-orange-600 rounded-xl font-bold text-center hover:bg-orange-50 transition-colors shadow-sm">
                Analyze Now
              </Link>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Achievements</h2>
              <BadgeStack />
            </div>
            <div className="space-y-4">
              {achievements.length > 0 ? achievements.map((ach: any, idx: number) => {
                const unlockedDate = ach.unlockedAt ? new Date(ach.unlockedAt) : new Date();
                const diffMs = Date.now() - unlockedDate.getTime();
                const diffDays = Math.floor(diffMs / 86_400_000);
                const dateLabel = diffDays === 0 ? 'Today' :
                                  diffDays === 1 ? 'Yesterday' :
                                  diffDays < 7 ? `${diffDays} days ago` :
                                  diffDays < 14 ? '1 week ago' :
                                  `${Math.floor(diffDays / 7)} weeks ago`;
                const iconColors = [
                  { icon: <Trophy className="size-4 text-yellow-600 dark:text-yellow-400" />, bg: "bg-yellow-100 dark:bg-yellow-900/30" },
                  { icon: <Award className="size-4 text-blue-600 dark:text-blue-400" />, bg: "bg-blue-100 dark:bg-blue-900/30" },
                ];
                const style = iconColors[idx % iconColors.length];
                return (
                  <AchievementItem
                    key={ach._id || idx}
                    title={ach.name}
                    date={dateLabel}
                    icon={style.icon}
                    bgColor={style.bg}
                  />
                );
              }) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No achievements yet — keep learning to earn badges! 🏅
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant Teaser */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
            <div className="size-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles className="size-6 text-white" />
            </div>
            <h3 className="font-bold text-lg mb-2">Need Career Advice?</h3>
            <p className="text-sm text-indigo-100 mb-4">Chat with our AI assistant for resume reviews and interview prep.</p>
            <Link to="ai-chat" className="inline-block px-6 py-2 bg-white text-indigo-600 rounded-full text-sm font-bold hover:bg-indigo-50 transition-colors">
              Start Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIChatAssistant() {
  type Message = {
    role: "ai" | "user" | "error";
    content: string;
    timestamp: Date;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "👋 Hey! I'm The-Setu AI Assistant powered by Grok. I know your roadmap, weak skills, and available courses. Ask me anything about your career path, skills to improve, or how to prepare for interviews!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestedPrompts = [
    "How can I improve my weak skills?",
    "What courses should I take next?",
    "How do I prepare for a technical interview?",
    "Explain my current roadmap phases",
  ];

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isLoading) return;

    const userMsg: Message = { role: "user", content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("authToken"); // App stores JWT as 'authToken'
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/ai/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ question })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "The assistant encountered an error.");
      }

      setMessages(prev => [...prev, { role: "ai", content: data.reply, timestamp: new Date() }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: "error",
          content: err.message || "Something went wrong. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const showSuggestions = messages.length === 1 && !isLoading;

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border h-[calc(100vh-8rem)] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-card rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="size-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">The-Setu AI Assistant</h2>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1.5">
              <span className="inline-block size-1.5 bg-green-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-full">
          <Zap className="size-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Context-Aware</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {/* AI Avatar */}
            {msg.role !== "user" && (
              <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Sparkles className="size-4" />
              </div>
            )}

            <div className={`max-w-[78%] flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : msg.role === "error"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm"
                    : "bg-secondary text-foreground rounded-tl-sm"
                  }`}
              >
                {msg.role === "error" && <span className="font-semibold">⚠ Error: </span>}
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>

            {/* User Avatar */}
            {msg.role === "user" && (
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                <User className="size-4" />
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
              <span className="size-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* Suggested Prompts shown only on fresh chat */}
        {showSuggestions && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">💡 Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 bg-secondary hover:bg-primary/10 hover:text-primary border border-border rounded-full transition-colors font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 rounded-b-xl">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={isLoading ? "Waiting for Groq response..." : "Ask about courses, skills, career advice..."}
            disabled={isLoading}
            className="flex-1 pl-4 pr-4 py-3 bg-secondary rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder-muted-foreground text-sm disabled:opacity-60 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <Send className="size-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          AI responses may not always be accurate. Verify important information.
        </p>
      </div>
    </div>
  );
}

// --- Sub-components (Refactored for styling) ---



function RoadmapItem({ title, status, percent }: { title: string; status: string; percent: number }) {
  const statusColors: Record<string, string> = {
    "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "Next Up": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    "Locked": "bg-gray-100 text-gray-700 dark:bg-secondary dark:text-muted-foreground"
  };

  return (
    <div className="p-4 rounded-xl border border-border bg-background/50 hover:bg-secondary/30 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        {percent > 0 && <span className="text-sm font-bold text-foreground">{percent}%</span>}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        {percent > 0 && (
          <div className="bg-foreground h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percent}%` }}></div>
        )}
      </div>
    </div>
  );
}

function MentorCardHorizontal({ name, role, rate }: { name: string; role: string; rate: string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-background/50 flex items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer group">
      <div className="size-12 bg-secondary rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <User className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{name}</h4>
        <p className="text-xs text-muted-foreground truncate">{role}</p>
        <p className="text-sm font-bold text-foreground mt-1">{rate}</p>
      </div>
      <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300" />
    </div>
  );
}

function AchievementItem({ title, date, icon, bgColor }: { title: string; date: string; icon: React.ReactNode; bgColor: string }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className={`p-2.5 rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}