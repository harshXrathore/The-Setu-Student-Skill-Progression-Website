import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import {
  CheckCircle,
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Trophy,
  Award,
  Flame,
  Target,
  Calendar,
} from "lucide-react";

// JobBoardPage has been moved to job-board-page.tsx
// LearningCoursesPage has been moved to learning-courses-page.tsx
// MentorsPage has been moved to mentors-page.tsx

export { JobBoardPage } from './job-board-page';
export { LearningCoursesPage } from './learning-courses-page';
export { MentorsPage } from './mentors-page';

export function CommunityPage() {
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await apiRequest<any[]>("/community/posts");
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostSubmit = async () => {
    if (!newPostContent.trim() || !newPostTitle.trim()) return;
    try {
      await apiRequest<any>("/community/posts", {
        method: "POST",
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          category: "General" // Simplified
        }),
      });
      setNewPostContent("");
      setNewPostTitle("");
      fetchPosts(); // Refresh
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">Connect, share, and learn from fellow developers</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="size-6 text-blue-600 dark:text-blue-400" />} label="Members" value="45.2K" />
        <StatCard icon={<MessageSquare className="size-6 text-green-600 dark:text-green-400" />} label="Discussions" value="12.8K" />
        <StatCard icon={<ThumbsUp className="size-6 text-purple-600 dark:text-purple-400" />} label="Total Likes" value="234K" />
        <StatCard icon={<CheckCircle className="size-6 text-orange-600 dark:text-orange-400" />} label="Solved" value="8.9K" />
      </div>

      {/* Create Post */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-4">Start a Discussion</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Diffusing Title..."
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <select className="px-4 py-2 bg-background border border-input rounded-lg text-sm text-foreground">
              <option>Select Category</option>
              <option>Career Advice</option>
              <option>Learning</option>
              <option>Technical Help</option>
              <option>General</option>
            </select>
            <button
              onClick={handlePostSubmit}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Career Advice", "Learning", "Technical Help", "General"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${tab === "All"
              ? "bg-primary text-primary-foreground"
              : "bg-background text-foreground border border-input hover:bg-secondary"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Discussions */}
      <div className="space-y-4">
        {loading ? <div className="text-center py-8">Loading discussions...</div> :
          posts.length === 0 ? <div className="text-center py-8 text-muted-foreground">No discussions yet. Start one!</div> :
            posts.map((discussion) => (
              <div key={discussion._id || discussion.id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="size-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(discussion.user?.name || "U")[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{discussion.user?.name || "Unknown User"}</h4>
                      <span className="text-sm text-muted-foreground">• {new Date(discussion.createdAt || Date.now()).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {discussion.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{discussion.title}</h3>
                    <p className="text-muted-foreground mb-4">{discussion.content}</p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                        <ThumbsUp className="size-4" />
                        <span>{discussion.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                        <MessageSquare className="size-4" />
                        <span>{discussion.commentsCount} comments</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400">
                        <Share2 className="size-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

export function AchievementsPage() {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<{ label: string; count: number }[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPeriod, setActivityPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [activityLoading, setActivityLoading] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeNotification, setBadgeNotification] = useState<{ name: string; description: string; icon: string } | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, achievementsRes, progressRes, activityRes, milestonesRes] = await Promise.all([
          apiRequest<any>('/gamification/stats').catch(() => null),
          apiRequest<any[]>('/gamification/achievements').catch(() => []),
          apiRequest<any[]>('/gamification/progress').catch(() => []),
          apiRequest<any>('/gamification/activity?period=week').catch(() => null),
          apiRequest<any[]>('/gamification/milestones').catch(() => []),
        ]);

        setStats(statsRes);
        setAchievements(achievementsRes || []);
        setProgress(progressRes || []);
        if (activityRes?.data) {
          setActivityData(activityRes.data);
          setActivityTotal(activityRes.total || 0);
        }
        setMilestones(milestonesRes || []);
      } catch (err) {
        console.error('Failed to load achievements data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fetch activity when period changes
  useEffect(() => {
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await apiRequest<any>(`/gamification/activity?period=${activityPeriod}`);
        if (res?.data) {
          setActivityData(res.data);
          setActivityTotal(res.total || 0);
        }
      } catch (err) {
        console.error('Failed to load activity', err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, [activityPeriod]);

  // Check for newly unlocked badges after a short delay and show first one
  useEffect(() => {
    if (achievements.length > 0) {
      const recentBadge = achievements.find((a: any) => {
        const unlockTime = new Date(a.unlockedAt).getTime();
        const threshold = Date.now() - 10 * 60 * 1000; // Within last 10 minutes
        return unlockTime > threshold;
      });
      if (recentBadge) {
        setBadgeNotification({ name: recentBadge.name, description: recentBadge.description, icon: recentBadge.icon });
        const t = setTimeout(() => setBadgeNotification(null), 6000);
        return () => clearTimeout(t);
      }
    }
  }, [achievements]);

  const unlockedIds = new Set(achievements.map((a: any) => a._id?.toString()));

  // Compute max activity for chart scaling
  const maxActivity = Math.max(...activityData.map(d => d.count), 1);

  const PERIODS = [
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
    { key: 'year' as const, label: 'This Year' },
  ];

  const periodTitle = PERIODS.find(p => p.key === activityPeriod)?.label;
  const mostActive = activityData.reduce((best, cur) => cur.count > best.count ? cur : best, { label: '', count: 0 });

  const milestoneIcons: Record<string, string> = {
    'First Login': '🚀',
    'Profile Completed': '✅',
    'First Course Started': '📖',
    'First Mentor Session': '🤝',
    'First Job Application': '💼',
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted/30 rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted/20 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-44 bg-muted/20 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto relative">

      {/* Badge Unlock Notification */}
      {badgeNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-4 fade-in duration-500">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl p-5 shadow-2xl flex items-center gap-4 min-w-[300px] border border-yellow-300/30">
            <div className="text-4xl shrink-0">{badgeNotification.icon}</div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-100 mb-0.5">🎉 Badge Unlocked!</p>
              <p className="font-bold text-lg leading-tight">{badgeNotification.name}</p>
              <p className="text-sm text-yellow-100 mt-0.5">{badgeNotification.description}</p>
            </div>
            <button onClick={() => setBadgeNotification(null)} className="text-white/70 hover:text-white text-xl leading-none shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-background border border-border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-purple-500/10" />
        <div className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
                <Trophy className="size-6" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Achievements & Badges
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">Track your progress and celebrate your wins</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-card px-6 py-4 rounded-2xl border border-border shadow-sm flex flex-col items-center min-w-[110px]">
              <span className="text-3xl font-bold text-yellow-500">{stats?.badgesEarned ?? 0}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Badges</span>
            </div>
            <div className="bg-card px-6 py-4 rounded-2xl border border-border shadow-sm flex flex-col items-center min-w-[110px]">
              <span className="text-3xl font-bold text-blue-500">{stats?.totalPoints ?? 0}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Points</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md">
          <Flame className="size-10 mb-3 opacity-90" />
          <p className="text-4xl font-bold mb-1">{stats?.dayStreak ?? 0}</p>
          <p className="text-blue-100 font-medium">Day Streak</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <Trophy className="size-10 text-yellow-500 mb-3" />
          <p className="text-4xl font-bold text-foreground mb-1">{stats?.totalPoints ?? 0}</p>
          <p className="text-muted-foreground">Total Points</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <Award className="size-10 text-purple-500 mb-3" />
          <p className="text-4xl font-bold text-foreground mb-1">{stats?.badgesEarned ?? 0}</p>
          <p className="text-muted-foreground">Badges Earned</p>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <Target className="size-10 text-green-500 mb-3" />
          <p className="text-4xl font-bold text-foreground mb-1">{stats?.overallProgress ?? 0}%</p>
          <p className="text-muted-foreground">Overall Progress</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Badges</h2>
        {progress.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">
            <Trophy className="size-12 mx-auto mb-3 opacity-30" />
            <p>No badges data yet. Start learning to earn badges!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {progress.map((badge: any) => {
              const isUnlocked = unlockedIds.has(badge._id?.toString());
              const pct = Math.min(100, badge.conditionValue > 0 ? Math.round((badge.current / badge.conditionValue) * 100) : 0);
              const unlockedBadge = achievements.find((a: any) => a._id?.toString() === badge._id?.toString());
              return (
                <div
                  key={badge._id}
                  className={`relative p-6 rounded-xl border-2 text-center transition-all ${
                    isUnlocked
                      ? 'bg-card border-yellow-300 dark:border-yellow-600 shadow-md hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-secondary border-border opacity-60 hover:opacity-80'
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-2 right-2 size-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="size-4 text-white" />
                    </div>
                  )}
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                  {isUnlocked ? (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Unlocked {unlockedBadge?.unlockedAt ? new Date(unlockedBadge.unlockedAt).toLocaleDateString() : ''}
                    </p>
                  ) : (
                    <div>
                      <div className="w-full bg-background rounded-full h-2 mb-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {badge.current} / {badge.conditionValue}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Activity Chart — Full Width with Period Selector */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Learning Activity</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{periodTitle} overview</p>
          </div>

          {/* Period tab selector */}
          <div className="flex items-center gap-1 bg-secondary/70 rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setActivityPeriod(p.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activityPeriod === p.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3 px-6 pt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
            <div className="size-1.5 rounded-full bg-green-500" />
            {activityTotal} total events
          </div>
          {mostActive.count > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">
              <div className="size-1.5 rounded-full bg-blue-500" />
              Most active: {mostActive.label} ({mostActive.count})
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="px-6 pb-6 pt-4">
          {activityLoading ? (
            <div className="flex items-center justify-center" style={{ height: '160px' }}>
              <div className="animate-spin rounded-full size-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div
                className="flex items-end gap-1.5 w-full"
                style={{ height: '160px' }}
              >
                {(activityData.length > 0
                  ? activityData
                  : Array.from({ length: activityPeriod === 'year' ? 12 : activityPeriod === 'month' ? 4 : 7 }, (_, i) => ({ label: String(i + 1), count: 0 }))
                ).map(({ label, count }, _idx) => {
                  const heightPct = Math.max((count / maxActivity) * 100, count > 0 ? 6 : 2);
                  const isMax = count === maxActivity && count > 0;
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end group"
                    >
                      {/* Count tooltip on hover */}
                      <div className={`text-xs font-bold transition-all duration-200 ${
                        count > 0 ? 'text-foreground opacity-0 group-hover:opacity-100' : 'opacity-0'
                      }`}>
                        {count}
                      </div>
                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ease-out relative overflow-hidden ${
                          count === 0
                            ? 'bg-secondary'
                            : isMax
                            ? 'bg-gradient-to-t from-green-600 to-green-400'
                            : 'bg-gradient-to-t from-green-500/80 to-emerald-400/70'
                        }`}
                        style={{ height: `${heightPct}%`, minHeight: count > 0 ? '6px' : '3px' }}
                      >
                        {/* Shine effect on active bars */}
                        {count > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        )}
                      </div>
                      {/* Label */}
                      <p className={`text-xs font-medium transition-colors ${
                        isMax ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                      }`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* X-axis line */}
              <div className="mt-0 h-px bg-border" />

              {/* Empty state */}
              {activityTotal === 0 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No activity recorded yet — complete lessons, quizzes, or sessions to see your activity here!
                </p>
              )}
            </>
          )}
        </div>
      </div>

        {/* Journey Milestones */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Calendar className="size-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Journey Milestones</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {['First Login', 'Profile Completed', 'First Course Started', 'First Mentor Session', 'First Job Application'].map((name, idx) => {
              const hit = milestones.find((m: any) => m.milestone === name);
              return (
                <div
                  key={name}
                  className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                    hit
                      ? 'bg-card border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-secondary/50 border-dashed border-border opacity-50'
                  }`}
                >
                  {/* Step number */}
                  <div className={`absolute -top-2.5 -left-2.5 size-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hit ? 'bg-blue-500 text-white' : 'bg-muted-foreground/30 text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`text-3xl mb-2 transition-all ${hit ? '' : 'grayscale opacity-50'}`}>
                    {hit ? milestoneIcons[name] || '✅' : '⏳'}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight mb-1">{name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {hit
                      ? new Date(hit.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Pending'
                    }
                  </p>
                  {hit && (
                    <div className="absolute top-2 right-2 size-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="size-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
