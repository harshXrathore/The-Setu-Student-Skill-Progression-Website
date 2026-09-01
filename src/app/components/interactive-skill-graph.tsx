import { useState, useEffect } from "react";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  BookOpen,
  ArrowRight,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { getSkillGraph, SkillGraphNode, SkillGraphEdge } from "../lib/adaptiveApi";
import { AssessmentModal } from "./assessment-modal";

interface InteractiveSkillGraphProps {
  onSelectSkill?: (skillName: string) => void;
}

export function InteractiveSkillGraph({ onSelectSkill }: InteractiveSkillGraphProps) {
  const [nodes, setNodes] = useState<SkillGraphNode[]>([]);
  const [edges, setEdges] = useState<SkillGraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [activeNode, setActiveNode] = useState<SkillGraphNode | null>(null);
  const [assessmentSkill, setAssessmentSkill] = useState<string | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await getSkillGraph();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    } catch (err) {
      console.error("Failed to load skill graph:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
    window.addEventListener("skillsUpdated", fetchGraph);
    return () => window.removeEventListener("skillsUpdated", fetchGraph);
  }, []);

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedStatusFilter === "all" || node.status === selectedStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (node: SkillGraphNode) => {
    if (node.status === "mastered") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="size-3" /> Mastered ({node.masteryScore}%)
        </span>
      );
    }
    if (node.status === "proficient") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Sparkles className="size-3" /> Proficient ({node.masteryScore}%)
        </span>
      );
    }
    if (node.status === "developing") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Zap className="size-3" /> Developing ({node.masteryScore}%)
        </span>
      );
    }
    if (node.status === "weak") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <AlertCircle className="size-3" /> Needs Practice ({node.masteryScore}%)
        </span>
      );
    }
    if (node.status === "locked") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
          <Lock className="size-3" /> Locked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground">
        Pending (0%)
      </span>
    );
  };

  const getNodeCardStyle = (node: SkillGraphNode) => {
    if (node.status === "mastered") {
      return "border-emerald-500/40 bg-card hover:border-emerald-500 shadow-sm shadow-emerald-500/5";
    }
    if (node.status === "proficient") {
      return "border-blue-500/40 bg-card hover:border-blue-500 shadow-sm shadow-blue-500/5";
    }
    if (node.status === "developing") {
      return "border-amber-500/40 bg-card hover:border-amber-500 shadow-sm shadow-amber-500/5";
    }
    if (node.status === "weak") {
      return "border-rose-500/40 bg-card hover:border-rose-500 shadow-sm shadow-rose-500/5";
    }
    if (node.status === "locked") {
      return "border-border/60 bg-muted/40 opacity-75 hover:opacity-100";
    }
    return "border-border bg-card hover:border-primary/50";
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            Skill Dependency & Mastery Graph
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Understand prerequisite pathways, unlocking criteria, and mastery progression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
            />
          </div>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-background border border-input rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All States</option>
            <option value="mastered">Mastered (85%+)</option>
            <option value="proficient">Proficient (70-84%)</option>
            <option value="developing">Developing (40-69%)</option>
            <option value="weak">Weak / Mistakes</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-secondary/30 p-3 rounded-xl border border-border/50">
        <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
          Legend:
        </span>
        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="size-2 rounded-full bg-emerald-500" /> Mastered (≥85%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
          <span className="size-2 rounded-full bg-blue-500" /> Proficient (70–84%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
          <span className="size-2 rounded-full bg-amber-500" /> Developing (40–69%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
          <span className="size-2 rounded-full bg-rose-500" /> Needs Review (&lt;40%)
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
          <Lock className="size-3" /> Locked Prerequisite
        </span>
      </div>

      {/* Graph Visual Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-card rounded-2xl border border-border p-4 animate-pulse space-y-3"
            >
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-2 w-full bg-secondary rounded" />
              <div className="h-6 w-24 bg-secondary rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNodes.map((node) => {
            return (
              <div
                key={node.id}
                onClick={() => setActiveNode(node)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] flex flex-col justify-between gap-3 ${getNodeCardStyle(
                  node
                )}`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground leading-snug flex items-center gap-1.5">
                      {node.status === "locked" && (
                        <Lock className="size-3.5 text-slate-400 shrink-0" />
                      )}
                      {node.name}
                    </h4>
                    {getStatusBadge(node)}
                  </div>

                  {/* Mastery bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                      <span>Mastery</span>
                      <span className="font-bold">{node.masteryScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          node.status === "mastered"
                            ? "bg-emerald-500"
                            : node.status === "proficient"
                            ? "bg-blue-500"
                            : node.status === "developing"
                            ? "bg-amber-500"
                            : node.status === "weak"
                            ? "bg-rose-500"
                            : "bg-muted-foreground"
                        }`}
                        style={{ width: `${node.masteryScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Prerequisites pill preview */}
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="truncate">
                    {node.prerequisites && node.prerequisites.length > 0 ? (
                      <>
                        <span className="font-semibold text-foreground">Req:</span>{" "}
                        {node.prerequisites.slice(0, 2).join(", ")}
                        {node.prerequisites.length > 2 && "..."}
                      </>
                    ) : (
                      <span className="italic">Foundational Skill</span>
                    )}
                  </span>
                  <span className="text-primary font-semibold flex items-center gap-0.5 shrink-0">
                    Details <ChevronRight className="size-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Node Details Modal */}
      <Dialog open={!!activeNode} onOpenChange={() => setActiveNode(null)}>
        <DialogContent className="max-w-lg bg-card border-border p-6 shadow-2xl rounded-2xl">
          {activeNode && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {activeNode.status === "locked" && (
                      <Lock className="size-4 text-slate-400" />
                    )}
                    {activeNode.name}
                  </DialogTitle>
                  {getStatusBadge(activeNode)}
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Dependency and Skill Intelligence Details
                </DialogDescription>
              </DialogHeader>

              {/* Score & Level metrics */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-secondary/30 rounded-xl border border-border">
                <div className="text-center">
                  <div className="text-[11px] text-muted-foreground">Mastery</div>
                  <div className="text-lg font-black text-foreground">
                    {activeNode.masteryScore}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-muted-foreground">Assessment</div>
                  <div className="text-lg font-black text-primary">
                    {activeNode.assessmentScore > 0 ? `${activeNode.assessmentScore}%` : "None"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] text-muted-foreground">Mistakes</div>
                  <div className="text-lg font-black text-rose-500">
                    {activeNode.mistakeCount}
                  </div>
                </div>
              </div>

              {/* Prerequisites list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Prerequisites Required (Min 70% Mastery)
                </h4>
                {activeNode.prerequisites && activeNode.prerequisites.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeNode.prerequisites.map((prereq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-secondary text-xs"
                      >
                        <span className="font-semibold text-foreground">{prereq}</span>
                        <span className="text-muted-foreground text-[11px]">Prerequisite</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic bg-secondary/30 p-2.5 rounded-lg">
                    No prerequisites required. This is a foundational competency.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-border">
                <Button
                  onClick={() => {
                    const skillToTest = activeNode.name;
                    setActiveNode(null);
                    setAssessmentSkill(skillToTest);
                  }}
                  className="w-full sm:flex-1 bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5"
                >
                  <Zap className="size-4" />
                  Take Skill Assessment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveNode(null)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assessment Modal */}
      <AssessmentModal
        skillName={assessmentSkill}
        isOpen={!!assessmentSkill}
        onClose={() => setAssessmentSkill(null)}
        onAssessmentCompleted={() => {
          fetchGraph();
        }}
      />
    </div>
  );
}
