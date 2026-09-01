import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Zap,
  Clock,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import {
  getAssessmentForSkill,
  submitAssessmentAnswers,
  AssessmentData,
  AssessmentSubmissionResult,
} from "../lib/adaptiveApi";

interface AssessmentModalProps {
  skillName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (result: AssessmentSubmissionResult) => void;
}

export function AssessmentModal({
  skillName,
  isOpen,
  onClose,
  onAssessmentCompleted,
}: AssessmentModalProps) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentSubmissionResult | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (!isOpen || !skillName) {
      setAssessment(null);
      setResult(null);
      setSelectedAnswers({});
      setCurrentQuestionIdx(0);
      setTimeSpent(0);
      setError(null);
      return;
    }

    async function loadAssessment() {
      if (!skillName) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAssessmentForSkill(skillName);
        setAssessment(data);
      } catch (err: any) {
        console.error("Failed to fetch assessment:", err);
        setError(err.message || "Failed to load assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadAssessment();
  }, [isOpen, skillName]);

  // Timer
  useEffect(() => {
    if (!isOpen || !assessment || result) return;
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, assessment, result]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment || submitting) return;

    const answersPayload = assessment.questions.map((q) => ({
      questionId: q.questionId,
      selectedOption: selectedAnswers[q.questionId] || "",
    }));

    setSubmitting(true);
    try {
      const submissionResult = await submitAssessmentAnswers(
        assessment._id,
        answersPayload,
        timeSpent
      );
      setResult(submissionResult);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(submissionResult);
      }
      // Broadcast update across platform
      window.dispatchEvent(new Event("skillsUpdated"));
    } catch (err: any) {
      console.error("Failed to submit assessment:", err);
      setError(err.message || "Failed to submit assessment answers.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = questions.length > 0 && answeredCount === questions.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10 text-primary">
                <Zap className="size-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {skillName} Assessment
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Skill Mastery & Concept Evaluation
                </DialogDescription>
              </div>
            </div>
            {!result && (
              <div className="flex items-center gap-2 text-xs font-mono bg-secondary px-3 py-1.5 rounded-full">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>{formatTime(timeSpent)}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">
              Generating dynamic technical assessment...
            </p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle className="size-8" />
            </div>
            <p className="text-sm font-medium text-foreground">{error}</p>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        ) : result ? (
          /* RESULT VIEW */
          <div className="py-4 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-3 p-6 rounded-xl bg-gradient-to-b from-primary/10 to-transparent border border-primary/20">
              <div className="inline-flex p-3 rounded-full bg-primary/20 text-primary">
                <Award className="size-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-foreground">
                  Score: {result.score}%
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {result.isPassed
                    ? "🎉 Outstanding! You passed the proficiency benchmark."
                    : "Keep going! Review weak concepts and practice again."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-card rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">Correct</div>
                  <div className="text-lg font-bold text-emerald-500">
                    {result.correctCount} / {result.totalQuestions}
                  </div>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">Mastery Level</div>
                  <div className="text-lg font-bold text-primary">
                    {result.updatedMastery?.level || "Updated"}
                  </div>
                </div>
                <div className="p-3 bg-card rounded-lg border border-border">
                  <div className="text-xs text-muted-foreground">New Score</div>
                  <div className="text-lg font-bold text-blue-500">
                    {result.updatedMastery?.masteryScore || result.score}%
                  </div>
                </div>
              </div>

              {result.mistakesLoggedCount > 0 && (
                <div className="flex items-center justify-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-2.5 rounded-lg font-medium">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>
                    {result.mistakesLoggedCount} mistake(s) tracked for targeted remediation.
                  </span>
                </div>
              )}
            </div>

            {/* Questions Review */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Question Review
              </h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {result.attempt?.questions?.map((q: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      q.isCorrect
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-rose-500/5 border-rose-500/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground">
                        {idx + 1}. {q.question}
                      </span>
                      {q.isCorrect ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <XCircle className="size-4 text-rose-500 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-medium">Your answer:</span>{" "}
                      <span className={q.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {q.selectedOption || "None"}
                      </span>
                      {!q.isCorrect && (
                        <>
                          {" • "}
                          <span className="font-medium">Correct:</span>{" "}
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {q.correctAnswer}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setSelectedAnswers({});
                  setCurrentQuestionIdx(0);
                  setTimeSpent(0);
                }}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="size-4 mr-1.5" />
                Retake Test
              </Button>
              <Button onClick={onClose} className="w-full sm:w-auto">
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ACTIVE TEST VIEW */
          <div className="space-y-6 py-2">
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <span>{Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{
                    width: `${((currentQuestionIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {currentQuestion && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-secondary text-secondary-foreground">
                    {currentQuestion.topic || "Core Concept"}
                  </span>
                  <h3 className="text-base font-semibold text-foreground leading-snug">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-2">
                  {currentQuestion.options.map((option, optIdx) => {
                    const isSelected =
                      selectedAnswers[currentQuestion.questionId] === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() =>
                          handleSelectOption(currentQuestion.questionId, option)
                        }
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-primary/10 border-primary text-foreground shadow-sm ring-1 ring-primary"
                            : "bg-card hover:bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="pr-3 leading-relaxed">{option}</span>
                        <div
                          className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
              >
                Previous
              </Button>

              {currentQuestionIdx < questions.length - 1 ? (
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentQuestionIdx((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  disabled={!selectedAnswers[currentQuestion?.questionId]}
                >
                  <span>Next</span>
                  <ArrowRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!isComplete || submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      Grading...
                    </>
                  ) : (
                    "Submit Assessment"
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
