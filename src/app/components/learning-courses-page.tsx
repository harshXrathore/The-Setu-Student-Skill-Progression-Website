import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { BookOpen, Play, Building2, Video, Users } from "lucide-react";

export function LearningCoursesPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          apiRequest<any>("/courses/dashboard").catch(() => null),
          apiRequest<any>("/learning-progress/dashboard").catch(() => null)
        ]);
        setDashboardData(courseRes);
        setProgressData(progressRes);
      } catch (err) {
        console.error("Failed to fetch learning dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const renderCourseSection = (title: string, courses: any[], description: string) => {
    if (!courses || courses.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-1">{title}</h2>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => {
            // Find if user has progress
            const progressItem = progressData?.totalProgress?.find((p: any) => p.courseId._id === course._id);
            const progress = progressItem ? progressItem.progressPercentage : 0;
            const status = progressItem ? progressItem.status : 'not-started';

            return (
              <div 
                key={course._id} 
                onClick={() => navigate(`/dashboard/courses/${course._id}`)}
                className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  <Play className="size-12 text-white/50 group-hover:scale-110 transition-transform" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 backdrop-blur rounded text-[10px] text-white font-bold uppercase tracking-wider">
                    {course.difficulty}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {course.skillTag || course.category}
                    </span>
                    {course.provider && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="size-3" /> {course.provider}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description || `Course by ${course.instructor}`}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Video className="size-3" />
                      {course.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {course.students} students
                    </span>
                  </div>

                  {status !== 'not-started' ? (
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-bold">
                        <span className={status === 'completed' ? 'text-green-500' : 'text-blue-500'}>
                          {status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-center py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Start Course
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Premium Header */}
      <div className="relative rounded-3xl overflow-hidden bg-background border border-border shadow-sm mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <BookOpen className="size-6" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Hybrid Learning System
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Personalized courses adapted to your skills, roadmap stage, and mistake patterns.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-card px-6 py-4 rounded-2xl border border-border shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-bold text-blue-500">
                {progressData?.completed?.length || 0}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Completed</span>
            </div>
            <div className="bg-card px-6 py-4 rounded-2xl border border-border shadow-sm flex flex-col items-center min-w-[120px]">
              <span className="text-3xl font-bold text-orange-500">
                {progressData?.inProgress?.length || 0}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full size-12 border-b-2 border-primary"></div>
        </div>
      ) : dashboardData ? (
        <div className="space-y-10">
          {progressData?.inProgress?.length > 0 && renderCourseSection(
            "Continue Learning",
            progressData.inProgress.map((p: any) => p.courseId).filter(Boolean),
            "Pick up right where you left off"
          )}

          {renderCourseSection(
            "Recommended For You",
            dashboardData.recommended,
            "Courses matching your profile and current role."
          )}
          
          {renderCourseSection(
            "Focus on Your Weaknesses",
            dashboardData.weakSkills,
            "Based on mistakes made in your recent quizzes and assessments."
          )}
          
          {renderCourseSection(
            "From Your Roadmap",
            dashboardData.roadmap,
            "Courses to help you complete your current roadmap phase."
          )}
          
          {renderCourseSection(
            "Popular Courses",
            dashboardData.popular,
            "Trending across the platform."
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          Failed to load courses. Please try again.
        </div>
      )}
    </div>
  );
}
