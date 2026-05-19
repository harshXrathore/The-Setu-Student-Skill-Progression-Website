import { Search, Filter, Briefcase, TrendingUp, DollarSign, Clock, CheckCircle, Target, BookOpen, Video, Code, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useProfile } from "../context/profile-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

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
  const [roadmapPhases, setRoadmapPhases] = useState<any[]>([]);
  const [roadmapId, setRoadmapId] = useState<string>('');
  const [roadmapGoal, setRoadmapGoal] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
  const [resourceStats, setResourceStats] = useState<{ courses: number } | null>(null);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const { apiRequest } = await import("../lib/api");

      // Try localStorage first for speed
      const stored = localStorage.getItem('generatedSkills');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.roadmapPhases) {
            setRoadmapPhases(parsed.roadmapPhases);
            setRoadmapId(parsed._id || '');
            setRoadmapGoal(parsed.goal || '');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse skills from localStorage", e);
        }
      }

      // Fetch from DB
      const latestRoadmap = await apiRequest<any>('/skills/latest');
      if (latestRoadmap?.roadmapPhases) {
        setRoadmapPhases(latestRoadmap.roadmapPhases);
        setRoadmapId(latestRoadmap._id || '');
        setRoadmapGoal(latestRoadmap.goal || '');
        localStorage.setItem('generatedSkills', JSON.stringify(latestRoadmap));
      }
    } catch (error) {
      console.error("Failed to fetch roadmap", error);
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
      // Fetch current profile to send with regenerate request
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
        localStorage.setItem('generatedSkills', JSON.stringify(newRoadmap));
        window.dispatchEvent(new Event('skillsUpdated'));
      }
    } catch (err) {
      console.error("Failed to regenerate roadmap", err);
    } finally {
      setRegenerating(false);
    }
  };

  // Stats
  let completedCount = 0, inProgressCount = 0, remainingCount = 0, totalHours = 0, totalSkills = 0;
  roadmapPhases.forEach(phase => {
    phase.skills.forEach((skill: any) => {
      totalSkills++;
      totalHours += (skill.hours || 0);
      if (skill.status === 'completed' || skill.status === 'verified') completedCount++;
      else if (skill.status === 'in-progress') inProgressCount++;
      else remainingCount++;
    });
  });

  const overallProgress = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;

  const typeColors: Record<string, string> = {
    fundamental: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    framework: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    backend: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    language: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    tool: "bg-secondary text-secondary-foreground",
    devops: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
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
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="h-6 w-48 bg-secondary rounded animate-pulse" />
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = totalSkills === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Regenerate Confirmation Dialog */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Regenerate Roadmap?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This will create a fresh roadmap based on your current profile. Your existing progress will be cleared.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRegenConfirm(false)}
                className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-secondary font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRegenerate}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium text-sm"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Learning Roadmap</h1>
          <p className="text-muted-foreground">
            {roadmapGoal ? `Structured path to becoming a ${roadmapGoal}` : 'Generate your personalized roadmap below'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallProgress}%</p>
            <p className="text-sm text-muted-foreground">Overall Progress</p>
          </div>
          <button
            onClick={() => setShowRegenConfirm(true)}
            disabled={regenerating}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border border-input rounded-lg hover:bg-secondary/80 text-sm font-medium disabled:opacity-50"
          >
            {regenerating ? (
              <><span className="animate-spin">⏳</span> Regenerating...</>
            ) : (
              <><span>🔄</span> Regenerate</>
            )}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">
              <Target className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{remainingCount}</p>
              <p className="text-sm text-muted-foreground">Remaining</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalHours}h</p>
              <p className="text-sm text-muted-foreground">Total Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Phases */}
      <div className="space-y-6">
        {isEmpty ? (
          <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
            <Target className="size-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Roadmap Generated Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete your profile setup to generate a personalized learning roadmap tailored to your career goals.
            </p>
            <a href="/dashboard/profile" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
              Go to Profile
            </a>
          </div>
        ) : (
          roadmapPhases.map((phase, phaseIndex) => (
            <div key={phaseIndex} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="bg-secondary/50 p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{phase.phase}</h2>
                    <p className="text-muted-foreground mt-1">{phase.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {phase.skills.filter((s: any) => s.status === "completed" || s.status === "verified").length} of {phase.skills.length} completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {phase.skills.map((skill: any, skillIndex: number) => {
                  const isUpdating = updatingSkill === skill.name;
                  return (
                    <div key={skillIndex} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-blue-400 dark:hover:border-blue-700 transition-colors">
                      <div className="flex-shrink-0">
                        {skill.status === "completed" || skill.status === "verified" ? (
                          <div className="size-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
                          </div>
                        ) : skill.status === "in-progress" ? (
                          <div className="size-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Clock className="size-6 text-blue-600 dark:text-blue-400" />
                          </div>
                        ) : (
                          <div className="size-10 bg-secondary rounded-full flex items-center justify-center">
                            <Target className="size-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{skill.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[skill.type?.toLowerCase()] || typeColors.default}`}>
                            {skill.type}
                          </span>
                          {skill.status === "verified" && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="size-4" />
                            {skill.hours} hours
                          </span>
                          {skill.status === "in-progress" && (
                            <div className="flex-1 max-w-xs">
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${skill.progress || 0}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isUpdating ? (
                          <button disabled className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium opacity-60">
                            <span className="animate-pulse">Saving...</span>
                          </button>
                        ) : skill.status === "completed" || skill.status === "verified" ? (
                          <button
                            onClick={() => handleSkillAction(skill, 'pending')}
                            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80"
                          >
                            Review
                          </button>
                        ) : skill.status === "in-progress" ? (
                          <button
                            onClick={() => handleSkillAction(skill, 'completed')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Mark Done
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSkillAction(skill, 'in-progress')}
                            className="px-4 py-2 bg-background border border-input text-foreground rounded-lg text-sm font-medium hover:bg-secondary"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Learning Resources */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Recommended Learning Resources</h3>
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
    </div>
  );
}

function ResourceCard({ icon, title, count }: { icon: React.ReactNode; title: string; count: string }) {
  return (
    <div className="p-4 rounded-lg border border-border hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-secondary rounded-lg">
          {icon}
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{count}</p>
        </div>
      </div>
    </div>
  );
}
