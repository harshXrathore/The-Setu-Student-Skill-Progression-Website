import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldAlert,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  getDashboardInsights,
  DashboardInsightsData,
} from "../lib/adaptiveApi";
import { AssessmentModal } from "./assessment-modal";
import { useNavigate } from "react-router-dom";

export function SkillIntelligencePanel() {
  const [insights, setInsights] = useState<DashboardInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentSkill, setAssessmentSkill] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadInsights = async () => {
    try {
      const data = await getDashboardInsights();
      setInsights(data);
    } catch (err) {
      console.error("Failed to load skill intelligence insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    window.addEventListener("skillsUpdated", loadInsights);
    return () => window.removeEventListener("skillsUpdated", loadInsights);
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 w-48 bg-secondary rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights) return null;

  const nextAction = insights.nextBestAction;
  const dist = insights.distribution || {
    Beginner: 0,
    Developing: 0,
    Proficient: 0,
    Mastered: 0,
  };
  const totalTracked =
    dist.Beginner + dist.Developing + dist.Proficient + dist.Mastered || 1;

  return (
    <div className="space-y-4">
      {/* Dynamic Next Best Action Banner */}
      {nextAction && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            nextAction.priority === "critical"
              ? "bg-rose-500/10 border-rose-500/30 text-foreground"
              : nextAction.priority === "high"
              ? "bg-amber-500/10 border-amber-500/30 text-foreground"
              : "bg-primary/10 border-primary/20 text-foreground"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`p-2.5 rounded-xl shrink-0 ${
                nextAction.priority === "critical"
                  ? "bg-rose-500/20 text-rose-500"
                  : nextAction.priority === "high"
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-primary/20 text-primary"
              }`}
            >
              {nextAction.priority === "critical" ? (
                <ShieldAlert className="size-5" />
              ) : nextAction.priority === "high" ? (
                <AlertTriangle className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </span>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-background/80 text-foreground border border-border">
                  Next Best Action
                </span>
                {nextAction.reason && (
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    • {nextAction.reason}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm sm:text-base text-foreground">
                {nextAction.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {nextAction.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {nextAction.skill ? (
              <Button
                size="sm"
                onClick={() => setAssessmentSkill(nextAction.skill!)}
                className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold shadow-sm text-xs"
              >
                <span>Take Action</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/dashboard/my-skills")}
                className="w-full sm:w-auto text-xs"
              >
                <span>View Roadmap</span>
                <ArrowRight className="size-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Intelligence Grid */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Brain className="size-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Skill Intelligence & Mastery Metrics
              </h3>
              <p className="text-xs text-muted-foreground">
                Live mastery analytics, proficiency distribution, and velocity tracking.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/my-skills")}
            className="text-xs self-start sm:self-auto font-medium"
          >
            <span>Explore Skill Graph</span>
            <ChevronRight className="size-3.5 ml-1" />
          </Button>
        </div>

        {/* 4 Core Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Overall Mastery */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
            <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Overall Mastery</span>
              <Award className="size-3.5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {insights.overallMastery}%
              </span>
              <span className="text-xs font-semibold text-primary">
                {insights.level}
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${insights.overallMastery}%` }}
              />
            </div>
          </div>

          {/* 2. Skill Gaps */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
            <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Skill Gaps</span>
              <AlertTriangle className="size-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {insights.skillGapsCount}
              </span>
              <span className="text-xs text-muted-foreground">remaining</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Skills under 70% threshold
            </p>
          </div>

          {/* 3. Learning Velocity */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
            <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Learning Velocity</span>
              <TrendingUp className="size-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                +{insights.learningVelocity}%
              </span>
              <span className="text-xs text-muted-foreground">this week</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mastery progress velocity
            </p>
          </div>

          {/* 4. Skills Mastered */}
          <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2">
            <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
              <span>Mastered Skills</span>
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {insights.skillsMasteredCount}
              </span>
              <span className="text-xs text-emerald-500 font-semibold">≥85% score</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Verified competencies
            </p>
          </div>
        </div>

        {/* Breakdown Columns: Strongest vs Weakest & Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Strongest Skills */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-500" />
              Strongest Competencies
            </h4>
            <div className="space-y-2.5">
              {insights.strongestSkills && insights.strongestSkills.length > 0 ? (
                insights.strongestSkills.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 bg-secondary/20 rounded-xl border border-border/60 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">{s.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                        {s.masteryScore}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${s.masteryScore}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Take assessments to highlight your top skills.
                </p>
              )}
            </div>
          </div>

          {/* Weakest Skills / Priorities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3.5 text-rose-500" />
              Priority Growth Areas
            </h4>
            <div className="space-y-2.5">
              {insights.weakestSkills && insights.weakestSkills.length > 0 ? (
                insights.weakestSkills.map((s, i) => (
                  <div
                    key={i}
                    className="p-3 bg-secondary/20 rounded-xl border border-border/60 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-foreground">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-mono">
                          {s.masteryScore}%
                        </span>
                        <button
                          onClick={() => setAssessmentSkill(s.name)}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${s.masteryScore}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No critical weak skills detected.
                </p>
              )}
            </div>
          </div>

          {/* Distribution Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-primary" />
              Mastery Distribution
            </h4>
            <div className="p-4 bg-secondary/20 rounded-xl border border-border/60 space-y-3">
              {/* Stacked bar */}
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${(dist.Mastered / totalTracked) * 100}%` }}
                  title={`Mastered: ${dist.Mastered}`}
                />
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(dist.Proficient / totalTracked) * 100}%` }}
                  title={`Proficient: ${dist.Proficient}`}
                />
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(dist.Developing / totalTracked) * 100}%` }}
                  title={`Developing: ${dist.Developing}`}
                />
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${(dist.Beginner / totalTracked) * 100}%` }}
                  title={`Beginner: ${dist.Beginner}`}
                />
              </div>

              {/* Legend counts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Mastered
                  </span>
                  <span className="font-bold">{dist.Mastered}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                    <span className="size-2 rounded-full bg-blue-500" />
                    Proficient
                  </span>
                  <span className="font-bold">{dist.Proficient}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Developing
                  </span>
                  <span className="font-bold">{dist.Developing}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                  <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                    <span className="size-2 rounded-full bg-rose-500" />
                    Beginner
                  </span>
                  <span className="font-bold">{dist.Beginner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <AssessmentModal
        skillName={assessmentSkill}
        isOpen={!!assessmentSkill}
        onClose={() => setAssessmentSkill(null)}
        onAssessmentCompleted={() => {
          loadInsights();
        }}
      />
    </div>
  );
}
