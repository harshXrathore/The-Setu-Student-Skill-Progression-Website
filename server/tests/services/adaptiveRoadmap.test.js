const AdaptiveRoadmapService = require('../../services/adaptiveRoadmap.service');
const MasteryEngineService = require('../../services/masteryEngine.service');
const SkillGraphService = require('../../services/skillGraph.service');
const MistakeAnalysisService = require('../../services/mistakeAnalysis.service');
const Roadmap = require('../../models/Roadmap');

jest.mock('../../models/Roadmap');
jest.mock('../../models/SkillMastery');
jest.mock('../../models/AssessmentAttempt');
jest.mock('../../models/Mistake');
jest.mock('../../services/mistakeAnalysis.service');
jest.mock('../../services/masteryEngine.service');
jest.mock('../../services/skillGraph.service');
jest.mock('../../services/courseRecommendation.service');

describe('Adaptive Roadmap Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getNextBestAction', () => {
        it('should prioritize critical repeated mistakes remediation first', async () => {
            Roadmap.findOne.mockReturnValue({
                sort: jest.fn().mockResolvedValue({
                    user: 'user123',
                    title: 'Roadmap',
                    roadmapPhases: [
                        { skills: [{ name: 'SQL', status: 'in-progress', masteryScore: 45 }] }
                    ]
                })
            });

            MistakeAnalysisService.getDetailedSkillMistakeAnalytics.mockResolvedValue([
                { skill: 'SQL', mistakeCount: 6, severity: 'high', trend: 'deteriorating' }
            ]);

            MasteryEngineService.getUserMasterySummary.mockResolvedValue({
                overallMastery: 45,
                skillsMasteredCount: 0,
                skillGapsCount: 1,
                strongestSkills: [],
                weakestSkills: [{ name: 'SQL', masteryScore: 45 }]
            });

            // Mock getAdaptedRoadmap internally
            jest.spyOn(AdaptiveRoadmapService, 'getAdaptedRoadmap').mockResolvedValue({
                roadmapPhases: [
                    { skills: [{ name: 'SQL', status: 'remediation', masteryScore: 45 }] }
                ]
            });

            const nextAction = await AdaptiveRoadmapService.getNextBestAction('user123');
            expect(nextAction.actionType).toBe('remediation');
            expect(nextAction.skill).toBe('SQL');
            expect(nextAction.priority).toBe('critical');
        });

        it('should recommend prerequisite unlocking if a dependent skill is blocked', async () => {
            MistakeAnalysisService.getDetailedSkillMistakeAnalytics.mockResolvedValue([]);
            MasteryEngineService.getUserMasterySummary.mockResolvedValue({
                overallMastery: 50,
                skillsMasteredCount: 1,
                skillGapsCount: 2,
                strongestSkills: [],
                weakestSkills: []
            });

            jest.spyOn(AdaptiveRoadmapService, 'getAdaptedRoadmap').mockResolvedValue({
                roadmapPhases: [
                    {
                        skills: [
                            {
                                name: 'Threat Hunting',
                                status: 'locked',
                                isBlocked: true,
                                prerequisites: ['Linux', 'SIEM']
                            }
                        ]
                    }
                ]
            });

            const nextAction = await AdaptiveRoadmapService.getNextBestAction('user123');
            expect(nextAction.actionType).toBe('prerequisite');
            expect(nextAction.skill).toBe('Linux');
            expect(nextAction.targetSkill).toBe('Threat Hunting');
        });
    });
});
