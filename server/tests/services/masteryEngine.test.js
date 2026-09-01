const MasteryEngineService = require('../../services/masteryEngine.service');
const { MASTERY_WEIGHTS, MASTERY_THRESHOLDS } = require('../../services/masteryEngine.service');

describe('Skill Mastery Engine Service', () => {
    describe('calculateMasteryScore', () => {
        it('should return 0 or low score for zero signals', () => {
            const score = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 0,
                hasAssessment: false,
                mistakeCount: 0,
                resolvedMistakeCount: 0,
                isCompleted: false,
                progressPercentage: 0,
                practiceCount: 0
            });

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(40);
        });

        it('should return ~100 for a fully mastered skill with perfect assessment, no mistakes, completed, and regular practice', () => {
            const score = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 100,
                hasAssessment: true,
                mistakeCount: 0,
                resolvedMistakeCount: 5,
                isCompleted: true,
                progressPercentage: 100,
                practiceCount: 10,
                lastPracticedAt: new Date()
            });

            expect(score).toBe(100);
        });

        it('should penalize mastery heavily for high open mistakes', () => {
            const cleanScore = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 80,
                hasAssessment: true,
                mistakeCount: 0,
                resolvedMistakeCount: 0,
                isCompleted: false,
                progressPercentage: 50,
                practiceCount: 2
            });

            const mistakeHeavyScore = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 80,
                hasAssessment: true,
                mistakeCount: 6, // 6 open mistakes
                resolvedMistakeCount: 0,
                isCompleted: false,
                progressPercentage: 50,
                practiceCount: 2
            });

            expect(mistakeHeavyScore).toBeLessThan(cleanScore);
            expect(cleanScore - mistakeHeavyScore).toBeGreaterThanOrEqual(15);
        });

        it('should clamp scores strictly between 0 and 100', () => {
            const negativeAttempt = MasteryEngineService.calculateMasteryScore({
                assessmentScore: -50,
                mistakeCount: 20,
                progressPercentage: -10
            });
            expect(negativeAttempt).toBe(0);

            const overflowAttempt = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 150,
                resolvedMistakeCount: 50,
                progressPercentage: 200,
                practiceCount: 100
            });
            expect(overflowAttempt).toBe(100);
        });

        it('should reward an improving learner who resolves mistakes', () => {
            const withOpenMistakes = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 75,
                hasAssessment: true,
                mistakeCount: 4,
                resolvedMistakeCount: 0,
                progressPercentage: 60
            });

            const afterResolving = MasteryEngineService.calculateMasteryScore({
                assessmentScore: 75,
                hasAssessment: true,
                mistakeCount: 0,
                resolvedMistakeCount: 4,
                progressPercentage: 60
            });

            expect(afterResolving).toBeGreaterThan(withOpenMistakes);
        });
    });

    describe('getMasteryLevel', () => {
        it('should map score ranges to standard mastery levels', () => {
            expect(MasteryEngineService.getMasteryLevel(0)).toBe('Beginner');
            expect(MasteryEngineService.getMasteryLevel(39)).toBe('Beginner');
            expect(MasteryEngineService.getMasteryLevel(40)).toBe('Developing');
            expect(MasteryEngineService.getMasteryLevel(69)).toBe('Developing');
            expect(MasteryEngineService.getMasteryLevel(70)).toBe('Proficient');
            expect(MasteryEngineService.getMasteryLevel(84)).toBe('Proficient');
            expect(MasteryEngineService.getMasteryLevel(85)).toBe('Mastered');
            expect(MasteryEngineService.getMasteryLevel(100)).toBe('Mastered');
        });
    });

    describe('Configurable Weights & Thresholds', () => {
        it('should have weights summing to 1.0 (100%)', () => {
            const sum = MASTERY_WEIGHTS.ASSESSMENT + 
                        MASTERY_WEIGHTS.MISTAKE + 
                        MASTERY_WEIGHTS.COMPLETION + 
                        MASTERY_WEIGHTS.PRACTICE;
            expect(sum).toBeCloseTo(1.0, 5);
        });

        it('should configure 70% as standard prerequisite minimum', () => {
            expect(MASTERY_THRESHOLDS.PREREQUISITE_MIN).toBe(70);
        });
    });
});
