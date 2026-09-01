import { Search, Filter, Briefcase, TrendingUp, DollarSign, Clock, CheckCircle, Target, BookOpen, Video, Code, Loader2, Zap, Lock, Sparkles, Award, Layers, ChevronDown, ChevronUp, History } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useProfile } from "../context/profile-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { InteractiveSkillGraph } from "./interactive-skill-graph";
import { AssessmentModal } from "./assessment-modal";
import { getAdaptiveRoadmap } from "../lib/adaptiveApi";

import { CareerPath } from "../types/career";

interface AICareerPrediction {
  career: string;
  careerId: string;
  matchScore: number;
  missingSkills: string[];
  estimatedTime: string;
  aiExplanation: string;
}

export function DetailedCareerExplorer() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Predictions State
  const [aiPredictions, setAiPredictions] = useState<AICareerPrediction[]>([]);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedDemand, setSelectedDemand] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "salary" | "demand" | "none">("none");

  // Dialog state
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null);

  useEffect(() => {
    const fetchCareersAndPredictions = async () => {
      try {
        setLoading(true);
        setLoadingPredictions(true);
        const [careersData, predictionsData] = await Promise.all([
          apiRequest<CareerPath[]>('/careers').catch(() => []),
          apiRequest<{ predictions: AICareerPrediction[] }>('/careers/predict').catch(() => ({ predictions: [] }))
        ]);

        setCareerPaths(careersData);
        setAiPredictions(predictionsData?.predictions || []);
      } catch (err: any) {
        console.error('Failed to fetch careers data:', err);
        setError(err.message || 'Failed to load career data');
      } finally {
        setLoading(false);
        setLoadingPredictions(false);
      }
    };

    fetchCareersAndPredictions();
  }, []);

  // Derive unique industries for filter dropdown
  const availableIndustries = useMemo(() => {
    return Array.from(new Set(careerPaths.map(c => c.industry).filter(Boolean)));
  }, [careerPaths]);

  const demandLevels = useMemo(() => { return Array.from(new Set(careerPaths.map(c => c.demandLevel).filter(Boolean))); }, [careerPaths]);

  // Calculate dynamic match percentage based on profile skills
  const calculateMatch = (requiredSkills: string[]) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!profile?.skills || profile.skills.length === 0) return 0;
    const userSkillsLower = profile.skills.map(s => s.toLowerCase());
    const matchedCount = requiredSkills.filter(reqSkill =>
      userSkillsLower.includes(reqSkill.toLowerCase())
    ).length;
    return Math.round((matchedCount / requiredSkills.length) * 100);
  };

  // Filter and Sort careers
  const processedCareers = useMemo(() => {
    let result = careerPaths.filter(career => {
      const matchesSearch = career.title.toLowerCase().includes(searchQuery.toLowerCase()) || career.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = !selectedIndustry || career.industry === selectedIndustry;
      const matchesDemand = !selectedDemand || career.demandLevel?.toLowerCase().includes(selectedDemand.toLowerCase());
      return matchesSearch && matchesIndustry && matchesDemand;
    });
    if (sortBy !== "none") {
      result.sort((a, b) => {
        if (sortBy === "match") return calculateMatch(b.requiredSkills) - calculateMatch(a.requiredSkills);
        if (sortBy === "salary") return (b.salaryRange || "").localeCompare(a.salaryRange || "");
        if (sortBy === "demand") {
           const demandWeight: Record<string, number> = { "Very High": 4, "High": 3, "Medium": 2, "Low": 1 };
           return (demandWeight[b.demandLevel] || 0) - (demandWeight[a.demandLevel] || 0);
        }
        return 0;
      });
    }
    return result;
  }, [careerPaths, searchQuery, selectedIndustry, selectedDemand, sortBy, profile?.skills]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Career Explorer</h1>
        <p className="text-muted-foreground">Discover career paths aligned with your skills and goals</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search careers by title or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex-none hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-full px-3 py-2 bg-background border border-input rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground cursor-pointer"
            >
              <option value="none">Sort: Default</option>
              <option value="match">Match %</option>
              <option value="demand">Demand</option>
              <option value="salary">Salary</option>
            </select>
          </div>
          <button
            onClick={() => setFilterOpen(prev => !prev)}
            className={`relative flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${filterOpen || selectedIndustry || selectedDemand
                ? "border-primary bg-primary/10 text-primary"
                : "border-input hover:bg-secondary text-foreground"
              }`}
          >
            <Filter className="size-5" />
            <span>Filters</span>
            {(selectedIndustry || selectedDemand) && (
              <span className="absolute -top-1.5 -right-1.5 size-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                {[selectedIndustry, selectedDemand].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Industry</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedIndustry("")}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${!selectedIndustry ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-secondary"
                    }`}
                >All</button>
                {availableIndustries.map(ind => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind === selectedIndustry ? "" : ind)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedIndustry === ind ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-secondary"
                      }`}
                  >{ind}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Market Demand</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDemand("")}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${!selectedDemand ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-secondary"
                    }`}
                >All</button>
                {demandLevels.map(d => (
                  <button
                    key={d}
                    onClick={() => setSelectedDemand(d === selectedDemand ? "" : d)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedDemand === d ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-secondary"
                      }`}
                  >{d}</button>
                ))}
              </div>
            </div>
            {(selectedIndustry || selectedDemand) && (
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={() => { setSelectedIndustry(""); setSelectedDemand(""); }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                >Clear all filters</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Predictions Section */}
      {loadingPredictions ? (
        <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 text-center animate-pulse">
          <Loader2 className="size-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300">The-Setu is analyzing your profile...</h3>
          <p className="text-muted-foreground text-sm mt-2">Checking skills, goals, and market demand to find your perfect match.</p>
        </div>
      ) : aiPredictions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Target className="size-4" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Top AI Predictions for You</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {aiPredictions.map((pred, idx) => (
              <div key={idx} className="relative bg-card rounded-2xl p-6 shadow-md border border-indigo-100 dark:border-indigo-900/30 overflow-hidden group hover:shadow-lg transition-all">
                {/* Ranking Ribbon */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  #{idx + 1} Match
                </div>

                <div className="flex justify-between items-start mb-4 mt-2">
                  <h3 className="text-xl font-bold text-foreground pr-8 leading-tight">{pred.career}</h3>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="relative size-12 flex items-center justify-center">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-secondary" strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${pred.matchScore >= 80 ? 'text-green-500' : pred.matchScore >= 50 ? 'text-yellow-500' : 'text-orange-500'}`} strokeWidth="3" strokeDasharray="100" strokeDashoffset={100 - pred.matchScore} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-sm font-bold">{pred.matchScore}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1"><Clock className="size-3.5 text-muted-foreground" /> {pred.estimatedTime}</p>
                    <p className="text-xs text-muted-foreground">Estimated learning time</p>
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Skill Gaps to Fill</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pred.missingSkills.length > 0 ? (
                      pred.missingSkills.map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded border border-orange-100 dark:border-orange-800 text-xs font-medium">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center gap-1 rounded border border-green-100 dark:border-green-800 text-xs font-medium">
                        <CheckCircle className="size-3" /> Ready for this role
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Explanation Box */}
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100/50 dark:border-indigo-800/30">
                  <p className="text-sm text-indigo-900/90 dark:text-indigo-200/90 italic leading-relaxed">
                    "{pred.aiExplanation}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Standard Career Exploration */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Explore All Paths</h2>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 text-center">
            {error}
          </div>
        ) : processedCareers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No career paths found matching your search.
          </div>
        ) : (
          /* Career Cards */
          <div className="grid lg:grid-cols-2 gap-6">
            {processedCareers.map((career) => {
              const matchPercentage = calculateMatch(career.requiredSkills);
              return (
                <div key={career._id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-card-foreground mb-1">{career.title}</h3>
                      <p className="text-muted-foreground">{career.industry}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${matchPercentage >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                        matchPercentage >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                          "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                      }`}>
                      {matchPercentage}% Match
                    </div>
                  </div>

                  {career.description && (
                    <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
                      {career.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{career.salaryRange}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-5 text-green-500" />
                      <span className="text-sm text-foreground">{career.growthRate} growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="size-5 text-muted-foreground" />
                      <span className="text-sm text-foreground">{career.demandLevel}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {career.requiredSkills?.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCareer(career)}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
                  >
                    Explore Path
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      <Dialog open={!!selectedCareer} onOpenChange={(open) => !open && setSelectedCareer(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCareer && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <DialogTitle className="text-2xl font-bold">{selectedCareer.title}</DialogTitle>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${calculateMatch(selectedCareer.requiredSkills) >= 80 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                      calculateMatch(selectedCareer.requiredSkills) >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300" :
                        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                    }`}>
                    {calculateMatch(selectedCareer.requiredSkills)}% Match
                  </div>
                </div>
                <DialogDescription className="text-base text-foreground/80">
                  {selectedCareer.industry}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                <div>
                  <h4 className="textlg font-semibold mb-2">About this role</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedCareer.description}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Salary Range</p>
                    <p className="font-semibold flex items-center gap-1"><DollarSign className="size-4 text-green-600" />{selectedCareer.salaryRange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Growth Rate</p>
                    <p className="font-semibold flex items-center gap-1"><TrendingUp className="size-4 text-blue-600" />{selectedCareer.growthRate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Demand</p>
                    <p className="font-semibold flex items-center gap-1"><Briefcase className="size-4 text-purple-600" />{selectedCareer.demandLevel}</p>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Skills Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareer.requiredSkills?.map((skill, i) => {
                          const userHasSkill = profile.skills?.some(s => s.toLowerCase() === skill.toLowerCase());
                          return (
                            <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${userHasSkill
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                                : "bg-secondary text-secondary-foreground border border-border"
                              }`}>
                              {userHasSkill && <CheckCircle className="size-3" />}
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advantages & Challenges */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50/50 dark:bg-green-900/10 p-5 rounded-xl border border-green-100 dark:border-green-900/30">
                    <h4 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                      <Target className="size-5" /> Advantages
                    </h4>
                    <ul className="space-y-2">
                      {selectedCareer.advantages?.map((adv, i) => (
                        <li key={i} className="text-sm text-green-900/80 dark:text-green-300/80 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span> {adv}
                        </li>
                      ))}
                      {(!selectedCareer.advantages || selectedCareer.advantages.length === 0) && (
                        <li className="text-sm text-muted-foreground italic">No advantages specified.</li>
                      )}
                    </ul>
                  </div>

                  <div className="bg-orange-50/50 dark:bg-orange-900/10 p-5 rounded-xl border border-orange-100 dark:border-orange-900/30">
                    <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
                      <Search className="size-5" /> Challenges
                    </h4>
                    <ul className="space-y-2">
                      {selectedCareer.challenges?.map((chal, i) => (
                        <li key={i} className="text-sm text-orange-900/80 dark:text-orange-300/80 flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span> {chal}
                        </li>
                      ))}
                      {(!selectedCareer.challenges || selectedCareer.challenges.length === 0) && (
                        <li className="text-sm text-muted-foreground italic">No challenges specified.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-4 border-t border-border mt-6">
                  <button
                    onClick={() => {
                      setSelectedCareer(null);
                      navigate('/dashboard/my-skills');
                    }}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    Generate Learning Roadmap <Target className="size-4" />
                  </button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    This will create a personalized learning plan to bridge your skill gap for this role.
                  </p>
                </div>

              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DetailedSkillRoadmap() {
  const [activeTab, setActiveTab] = useState<"phases" | "graph">("phases");
  const [roadmapPhases, setRoadmapPhases] = useState<any[]>([]);
  const [roadmapId, setRoadmapId] = useState<string>('');
  const [roadmapGoal, setRoadmapGoal] = useState<string>('');
  const [roadmapVersion, setRoadmapVersion] = useState<number>(1);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  const [resourceStats, setResourceStats] = useState<{ courses: number } | null>(null);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [assessmentSkill, setAssessmentSkill] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});

  const loadSkills = async () => {
    setLoading(true);
    try {
      // 1. Fetch adaptive roadmap from backend
      const data = await getAdaptiveRoadmap().catch(async () => {
        const { apiRequest } = await import("../lib/api");
        return apiRequest<any>('/skills/latest');
      });

      if (data?.roadmapPhases) {
        setRoadmapPhases(data.roadmapPhases);
        setRoadmapId(data._id || '');
        setRoadmapGoal(data.goal || '');
        setRoadmapVersion(data.version || 1);
        setVersionHistory(data.versionHistory || []);
        localStorage.setItem('generatedSkills', JSON.stringify(data));
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('generatedSkills');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.roadmapPhases) {
              setRoadmapPhases(parsed.roadmapPhases);
              setRoadmapId(parsed._id || '');
              setRoadmapGoal(parsed.goal || '');
              setRoadmapVersion(parsed.version || 1);
              setVersionHistory(parsed.versionHistory || []);
            }
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error("Failed to fetch adaptive roadmap", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkills();
    window.addEventListener('skillsUpdated', loadSkills);
    return () => window.removeEventListener('skillsUpdated', loadSkills);
  }, []);

  // Fetch resource stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { apiRequest } = await import("../lib/api");
        const stats = await apiRequest<{ courses: number }>('/resources/stats');
        setResourceStats(stats);
      } catch (e) {
        console.error("Failed to fetch resource stats", e);
      }
    };
    fetchStats();
  }, []);

  const handleSkillAction = async (skill: any, newStatus: string) => {
    if (!roadmapId) return;
    setUpdatingSkill(skill.name);
    try {
      const { apiRequest } = await import("../lib/api");
      const updated = await apiRequest<any>(`/skills/${roadmapId}/skills/${encodeURIComponent(skill.name)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (updated?.roadmapPhases) {
        setRoadmapPhases(updated.roadmapPhases);
        localStorage.setItem('generatedSkills', JSON.stringify(updated));
        window.dispatchEvent(new Event('skillsUpdated'));
      }
    } catch (err) {
      console.error("Failed to update skill status", err);
    } finally {
      setUpdatingSkill(null);
    }
  };

  const handleRegenerate = async () => {
    setShowRegenConfirm(false);
    setRegenerating(true);
    try {
      const { apiRequest } = await import("../lib/api");
      const profile = await apiRequest<any>('/profile').catch(() => ({}));
      const newRoadmap = await apiRequest<any>('/skills/analyze', {
        method: 'POST',
        body: JSON.stringify({ ...profile, regenerate: true }),
      });
      if (newRoadmap?.roadmapPhases) {
        localStorage.removeItem('generatedSkills');
        setRoadmapPhases(newRoadmap.roadmapPhases);
        setRoadmapId(newRoadmap._id || '');
        setRoadmapGoal(newRoadmap.goal || '');
        setRoadmapVersion(newRoadmap.version || 1);
        setVersionHistory(newRoadmap.versionHistory || []);
        localStorage.setItem('generatedSkills', JSON.stringify(newRoadmap));
        window.dispatchEvent(new Event('skillsUpdated'));
      }
    } catch (err) {
      console.error("Failed to regenerate roadmap", err);
    } finally {
      setRegenerating(false);
    }
  };

  const toggleCourses = (skillName: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  // Stats computation
  let completedCount = 0, inProgressCount = 0, remainingCount = 0, totalHours = 0, totalSkills = 0;
  let totalMastery = 0;
  roadmapPhases.forEach(phase => {
    (phase.skills || []).forEach((skill: any) => {
      totalSkills++;
      totalHours += (skill.hours || 0);
      totalMastery += (skill.masteryScore || 0);
      if (skill.status === 'completed' || skill.status === 'verified' || skill.status === 'mastered') completedCount++;
      else if (skill.status === 'in-progress' || skill.status === 'remediation') inProgressCount++;
      else remainingCount++;
    });
  });

  const overallProgress = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
  const avgMastery = totalSkills > 0 ? Math.round(totalMastery / totalSkills) : 0;

  const typeColors: Record<string, string> = {
    fundamental: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    framework: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    backend: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    language: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    tool: "bg-secondary text-secondary-foreground",
    devops: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    remediation: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-secondary rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-secondary rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-secondary rounded-lg animate-pulse" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border">
              <div className="h-8 w-12 bg-secondary rounded animate-pulse mb-1" />
              <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = totalSkills === 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Regenerate Confirmation Dialog */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-foreground">Regenerate Roadmap?</h3>
            <p className="text-muted-foreground text-sm">
              This will create a fresh roadmap based on your current profile and reset custom adaptations.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRegenConfirm(false)}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-secondary font-medium text-sm text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-semibold text-sm"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      <Dialog open={showVersionModal} onOpenChange={setShowVersionModal}>
        <DialogContent className="max-w-md bg-card border-border p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <History className="size-5 text-primary" />
              Roadmap Version History
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Audit log of adaptive optimizations triggered by assessments and performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {versionHistory && versionHistory.length > 0 ? (
              versionHistory.map((vh, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-primary font-mono">v{vh.version}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(vh.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-foreground font-medium">{vh.reason}</p>
                  {vh.summary && <p className="text-[11px] text-muted-foreground">{vh.summary}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">Current version: v{roadmapVersion} (Initial baseline).</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Adaptive Learning Roadmap
            </h1>
            <button
              onClick={() => setShowVersionModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              title="Click to view adaptation version history"
            >
              <Sparkles className="size-3" />
              v{roadmapVersion} Adaptive
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            {roadmapGoal ? `Dynamic intelligent progression toward becoming a ${roadmapGoal}` : 'Generate your personalized roadmap below'}
          </p>
        </div>

        {/* View Switcher Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex flex-col items-end pr-2 border-r border-border">
            <span className="text-sm font-black text-primary">{overallProgress}%</span>
            <span className="text-[10px] text-muted-foreground font-medium">Roadmap Progress</span>
          </div>

          <div className="flex bg-secondary p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("phases")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "phases"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Phases View
            </button>
            <button
              onClick={() => setActiveTab("graph")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "graph"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              Dependency Graph
            </button>
          </div>

          <button
            onClick={() => setShowRegenConfirm(true)}
            disabled={regenerating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary text-foreground border border-input rounded-xl hover:bg-secondary/80 text-xs font-semibold disabled:opacity-50"
          >
            {regenerating ? (
              <><Loader2 className="size-3.5 animate-spin" /> Adapting...</>
            ) : (
              <><span>🔄</span> Regenerate</>
            )}
          </button>
        </div>
      </div>

      {/* Progress Summary 4 Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <CheckCircle className="size-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{completedCount}</p>
              <p className="text-xs text-muted-foreground font-medium">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{inProgressCount}</p>
              <p className="text-xs text-muted-foreground font-medium">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{avgMastery}%</p>
              <p className="text-xs text-muted-foreground font-medium">Avg Mastery</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-foreground">{totalHours}h</p>
              <p className="text-xs text-muted-foreground font-medium">Total Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Phase View vs Graph View */}
      {activeTab === "graph" ? (
        <InteractiveSkillGraph onSelectSkill={(name) => setAssessmentSkill(name)} />
      ) : (
        <div className="space-y-6">
          {isEmpty ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center">
              <Target className="size-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Roadmap Generated Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Complete your profile setup to generate a personalized learning roadmap tailored to your career goals.
              </p>
              <a href="/dashboard/profile" className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90">
                Go to Profile
              </a>
            </div>
          ) : (
            roadmapPhases.map((phase, phaseIndex) => (
              <div key={phaseIndex} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="bg-secondary/40 p-5 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <span className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                        {phaseIndex + 1}
                      </span>
                      {phase.phase}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{phase.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {(phase.skills || []).filter((s: any) => s.status === "completed" || s.status === "verified" || s.status === "mastered").length} / {(phase.skills || []).length} mastered
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {(phase.skills || []).map((skill: any, skillIndex: number) => {
                    const isUpdating = updatingSkill === skill.name;
                    const isLocked = skill.isBlocked || skill.status === "locked";
                    const isMastered = skill.status === "mastered" || skill.masteryScore >= 85;
                    const hasCourses = skill.courses && skill.courses.length > 0;
                    const isExpanded = expandedCourses[skill.name];

                    return (
                      <div
                        key={skillIndex}
                        className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 ${
                          isMastered
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : isLocked
                            ? "border-border/60 bg-muted/30 opacity-80"
                            : skill.status === "remediation"
                            ? "border-rose-500/30 bg-rose-500/5"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Left: Skill title and badges */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                                {isLocked && <Lock className="size-4 text-slate-400 shrink-0" />}
                                {skill.name}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${typeColors[skill.type?.toLowerCase()] || typeColors.default}`}>
                                {skill.type || "skill"}
                              </span>
                              {isMastered && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  ✓ Mastered
                                </span>
                              )}
                              {skill.mistakeCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                  {skill.mistakeCount} mistakes
                                </span>
                              )}
                            </div>

                            {/* Recommendation Reason Callout */}
                            {skill.recommendationReason && (
                              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                💡 {skill.recommendationReason}
                              </p>
                            )}

                            {/* Locked Reason if blocked */}
                            {isLocked && skill.blockedReason && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                <Lock className="size-3 shrink-0" />
                                {skill.blockedReason}
                              </p>
                            )}
                          </div>

                          {/* Right: Mastery Bar & Action CTA */}
                          <div className="flex items-center gap-4 shrink-0">
                            {/* Mastery score badge */}
                            <div className="text-right min-w-[70px]">
                              <div className="text-xs font-bold text-foreground">
                                {skill.masteryScore || 0}%
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {skill.level || "Beginner"}
                              </div>
                            </div>

                            {/* Assessment Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAssessmentSkill(skill.name)}
                              className="text-xs h-8 px-3 font-semibold text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1"
                            >
                              <Zap className="size-3.5" />
                              Test
                            </Button>

                            {/* Status Changer button */}
                            {isUpdating ? (
                              <Button size="sm" disabled className="text-xs h-8">
                                <Loader2 className="size-3 animate-spin mr-1" /> Saving
                              </Button>
                            ) : isMastered || skill.status === "completed" ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleSkillAction(skill, 'pending')}
                                className="text-xs h-8"
                              >
                                Review
                              </Button>
                            ) : skill.status === "in-progress" ? (
                              <Button
                                size="sm"
                                onClick={() => handleSkillAction(skill, 'completed')}
                                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                              >
                                Mark Done
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSkillAction(skill, 'in-progress')}
                                className="text-xs h-8"
                              >
                                Start
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Expandable Recommended Courses */}
                        {hasCourses && (
                          <div className="pt-2 border-t border-border/40">
                            <button
                              onClick={() => toggleCourses(skill.name)}
                              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                              <BookOpen className="size-3.5" />
                              <span>{skill.courses.length} Recommended Resources</span>
                              {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                            </button>

                            {isExpanded && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5">
                                {skill.courses.map((course: any, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="p-3 bg-secondary/30 rounded-xl border border-border/60 text-xs space-y-1"
                                  >
                                    <div className="font-semibold text-foreground flex items-center justify-between">
                                      <span>{course.title}</span>
                                      <span className="text-[10px] text-primary font-mono capitalize">
                                        {course.difficulty || 'Course'}
                                      </span>
                                    </div>
                                    {course.reason && (
                                      <p className="text-[11px] text-muted-foreground">{course.reason}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Learning Resources */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h3 className="text-base font-bold text-foreground mb-4">Curated Learning Ecosystem</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <ResourceCard
            icon={<BookOpen className="size-6 text-blue-600 dark:text-blue-400" />}
            title="Interactive Courses"
            count={resourceStats ? `${resourceStats.courses} courses` : 'Browse Library'}
          />
          <ResourceCard icon={<Video className="size-6 text-purple-600 dark:text-purple-400" />} title="Video Tutorials" count="Watch & Learn" />
          <ResourceCard icon={<Code className="size-6 text-green-600 dark:text-green-400" />} title="Practice Projects" count="Build Portfolio" />
        </div>
      </div>

      {/* Assessment Modal */}
      <AssessmentModal
        skillName={assessmentSkill}
        isOpen={!!assessmentSkill}
        onClose={() => setAssessmentSkill(null)}
        onAssessmentCompleted={() => {
          loadSkills();
        }}
      />
    </div>
  );
}

function ResourceCard({ icon, title, count }: { icon: React.ReactNode; title: string; count: string }) {
  return (
    <div className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/40 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary rounded-lg">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{count}</p>
        </div>
      </div>
    </div>
  );
}
