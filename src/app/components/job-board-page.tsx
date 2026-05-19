import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Bookmark,
  Building2,
  TrendingUp,
  Play,
  CheckCircle,
  Users,
  Share2,
  Target,
  Search,
  Filter,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
      <div className="p-3 bg-secondary rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export function JobBoardPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLocation, setFilterLocation] = useState("All Locations");
  const [activeTab, setActiveTab] = useState<"discover" | "applied" | "saved">("discover");
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  
  const fetchHistory = async () => {
    try {
      const apps = await apiRequest<any>('/jobs/applications/history');
      setAppliedJobs(apps.map((a: any) => ({ ...a.jobId, appliedAt: a.createdAt })));
      const saved = await apiRequest<any>('/jobs/saved');
      setSavedJobs(saved || []);
    } catch (err) { }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Step 10: Fetching from recommended AI jobs endpoint
      const data = await apiRequest<any>("/jobs/recommended");
      setJobs(data.jobs || []);
    } catch (err) {
      console.error("Failed to fetch recommended jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("attachment", file);
    formData.append("type", "resume"); // Tell API to parse skills

    try {
      // Assuming apiRequest handles FormData correctly (fetch logic)
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}` // Ensure auth
        },
        body: formData
      });
      const data = await res.json();
      
      if (data.extractedSkills && data.extractedSkills.length > 0) {
        alert(`Resume parsed! Added ${data.extractedSkills.length} new skills to your profile.`);
        // Refresh job matches based on newly parsed skills
        fetchJobs();
      } else {
        alert("Resume uploaded, but no clear technical skills were extracted.");
      }
    } catch (error) {
      console.error("Resume upload failed", error);
      alert("Failed to process resume.");
    } finally {
      setUploadingResume(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const handleBookmark = async (jobId: string) => {
    try {
      await apiRequest(`/jobs/${jobId}/bookmark`, { method: 'POST' });
      fetchHistory();
    } catch (e) { }
  };

  const handleApply = async (jobId: string, url?: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok || response.status === 400) { 
        if (data.applicationUrl || url) {
            window.open(data.applicationUrl || url, '_blank', 'noopener,noreferrer');
        } else {
            alert(data.message || 'Application tracked successfully!');
        }
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (err) {
      console.error("Failed to apply", err);
      alert('Network error while applying');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Job Matches</h1>
          <p className="text-muted-foreground">Discover opportunities algorithmically matched to your skills</p>
        </div>
        <div className="relative">
          <input 
            type="file" 
            accept=".pdf,.doc,.docx" 
            id="resume-upload" 
            className="hidden" 
            onChange={handleResumeUpload}
            disabled={uploadingResume}
          />
          <label htmlFor="resume-upload" className={`px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-opacity ${uploadingResume ? 'opacity-50 select-none pointer-events-none' : 'hover:bg-primary/90'}`}>
            {uploadingResume ? (
              <><div className="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div> Parsing Resume...</>
            ) : (
              <>Upload Resume to Auto-Match</>
            )}
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={<Briefcase className="size-6 text-blue-600 dark:text-blue-400" />} label="Matched Jobs" value={jobs.length.toString()} />
        <StatCard icon={<Building2 className="size-6 text-green-600 dark:text-green-400" />} label="Companies" value={new Set(jobs.map(j => j.company)).size.toString()} />
        <StatCard icon={<TrendingUp className="size-6 text-purple-600 dark:text-purple-400" />} label="Avg Match Score" value={jobs.length ? `${Math.round(jobs.reduce((a,b) => a + (b.matchScore || 0), 0) / jobs.length)}%` : "0%"} />
        <StatCard icon={<Bookmark className="size-6 text-orange-600 dark:text-orange-400" />} label="Saved Jobs" value={savedJobs.length.toString()} />
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              placeholder="Search job titles, companies, or keywords..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
            <option>All Locations</option>
            <option>Remote</option>
            <option>San Francisco</option>
            <option>New York</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-secondary text-foreground">
            <Filter className="size-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setActiveTab('discover')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'discover' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}>Discover Jobs</button>
        <button onClick={() => setActiveTab('applied')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'applied' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}>My Applications</button>
        <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'saved' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'}`}>Saved Jobs</button>
      </div>

      {/* Job Listings (Ranked by AI context) */}
      <div className="space-y-4">
        {loading ? <div className="text-center py-12"><div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-muted-foreground">AI is matching your profile with active jobs...</p></div> :
          jobs.length === 0 ? <div className="text-center py-8 text-muted-foreground">No matching jobs found. Try uploading a resume or adding skills.</div> :
            (() => {
    let rawList = activeTab === 'discover' ? jobs : activeTab === 'applied' ? appliedJobs : savedJobs;
    return rawList.filter(job => {
      if (!job || !job.title) return false;
      const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.company.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLoc = filterLocation === 'All Locations' || (job.location && job.location.includes(filterLocation));
      return matchSearch && matchLoc;
    }).map((job) => (
              <div key={job._id || job.id} className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Score Indicator Border */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${job.matchScore >= 80 ? 'bg-green-500' : job.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>

                <div className="flex items-start justify-between mb-4 pl-2">
                  <div className="flex items-start gap-4">
                    <div className="size-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {job.company[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {job.title} 
                        {job.source === 'adzuna' && <span className="text-[10px] uppercase font-bold text-muted-foreground ml-2 px-1.5 py-0.5 border border-border rounded-sm bg-secondary inline-flex items-center gap-1">External <ExternalLink className="size-2.5"/></span>}
                      </h3>
                      <p className="text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-4" />
                          {job.location}
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-4" />
                            {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {new Date(job.postedDate || job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 mb-2 ${job.matchScore >= 80 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : job.matchScore >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
                      <Target className="size-4" />
                      {job.matchScore || 0}% Match
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="size-3"/> {job.applicants || 0} applicants</p>
                  </div>
                </div>

                <div className="pl-2 mb-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-foreground mr-1">Required Skills:</span>
                    {job.requiredSkills?.map((skill: string, i: number) => {
                      // Highlight missing skills in red
                      const isMissing = job.missingSkills?.includes(skill);
                      return (
                        <span key={i} className={`px-2.5 py-1 rounded text-xs font-medium border ${isMissing ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-900/20 text-green-700 border-green-200 dark:border-green-800 flex items-center gap-1'}`}>
                          {!isMissing && <CheckCircle className="size-3" />}
                          {skill}
                        </span>
                      )
                    })}
                  </div>

                  {job.missingSkills && job.missingSkills.length > 0 && job.recommendedCourses && job.recommendedCourses.length > 0 && (
                    <div className="p-3 bg-secondary/50 rounded-lg border border-border flex flex-col md:flex-row md:items-center gap-3 justify-between">
                      <div>
                        <p className="text-sm font-semibold flex items-center gap-1.5"><BadgeCheck className="size-4 text-primary" /> Skill Gap Detected</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Missing: <span className="text-foreground font-medium">{job.missingSkills.join(', ')}</span></p>
                      </div>
                      <div className="flex gap-2">
                        {job.recommendedCourses.slice(0, 2).map((course: any) => (
                          <a key={course._id} href={`/dashboard/courses/${course._id}`} className="px-3 py-1.5 bg-background border border-border hover:border-primary hover:text-primary transition-colors rounded text-xs font-medium flex items-center gap-1.5">
                            <Play className="size-3" />
                            {course.title.length > 25 ? course.title.substring(0, 22) + '...' : course.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pl-2">
                  <button 
                    onClick={() => handleApply(job._id || job.id, job.applicationUrl)}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex justify-center items-center gap-2"
                  >
                    Apply Now
                  </button>
                  <button className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-secondary">
                    <Bookmark className="size-5" />
                  </button>
                  <button className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-secondary">
                    <Share2 className="size-5" />
                  </button>
                </div>
              </div>
            ))
            })()}
      </div>
    </div>
  );
}
