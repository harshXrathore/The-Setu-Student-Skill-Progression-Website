const Roadmap = require('../models/Roadmap');
const Profile = require('../models/Profile');
const MasteryEngineService = require('./masteryEngine.service');
const SkillGraphService = require('./skillGraph.service');
const MistakeAnalysisService = require('./mistakeAnalysis.service');
const CourseRecommendationService = require('./courseRecommendation.service');
const AssessmentAttempt = require('../models/AssessmentAttempt');

class AdaptiveRoadmapService {
    /**
     * Get or build the user's fully adapted roadmap with real-time intelligence
     * @param {string} userId
     * @param {Object} options
     * @returns {Promise<Object>} Adapted roadmap document
     */
    async getAdaptedRoadmap(userId, options = { saveChanges: true }) {
        // 1. Fetch latest baseline roadmap
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ updatedAt: -1 });
        if (!roadmap) {
            return null;
        }

        const roadmapObj = roadmap.toObject();

        // 2. Fetch User Masteries, Mistakes, Assessments in parallel
        const [masteryMap, mistakeAnalytics, attempts] = await Promise.all([
            MasteryEngineService.getSkillMasteryMap(userId),
            MistakeAnalysisService.getDetailedSkillMistakeAnalytics(userId),
            AssessmentAttempt.find({ userId }).sort({ createdAt: -1 }).limit(10)
        ]);

        const mistakeMap = new Map();
        mistakeAnalytics.forEach(m => mistakeMap.set(m.skill.toLowerCase(), m));

        const latestAttemptBySkill = new Map();
        attempts.forEach(att => {
            const k = (att.skill || '').toLowerCase();
            if (!latestAttemptBySkill.has(k)) {
                latestAttemptBySkill.set(k, att);
            }
        });

        // 3. Process each phase and skill deterministically
        let totalMasterySum = 0;
        let totalSkillsCount = 0;
        let skillGapsCount = 0;
        const changedSkills = [];
        let needsVersionBump = false;
        let adaptationReason = '';

        const adaptedPhases = [];

        for (let pIdx = 0; pIdx < (roadmapObj.roadmapPhases || []).length; pIdx++) {
            const phase = roadmapObj.roadmapPhases[pIdx];
            const adaptedSkills = [];

            for (let sIdx = 0; sIdx < (phase.skills || []).length; sIdx++) {
                const skill = phase.skills[sIdx];
                const skillNorm = (skill.name || '').toLowerCase().trim();

                // Get current mastery doc or compute baseline
                const masteryDoc = masteryMap.get(skillNorm);
                const masteryScore = masteryDoc ? masteryDoc.masteryScore : (skill.masteryScore || 0);
                const level = MasteryEngineService.getMasteryLevel(masteryScore);

                totalMasterySum += masteryScore;
                totalSkillsCount++;
                if (masteryScore < 70) skillGapsCount++;

                // Mistake signals
                const mistakeInfo = mistakeMap.get(skillNorm) || { mistakeCount: 0, severity: 'low', trend: 'stagnant' };
                const mistakeCount = mistakeInfo.mistakeCount || 0;

                // Assessment signals
                const latestAttempt = latestAttemptBySkill.get(skillNorm);
                const assessmentScore = latestAttempt ? latestAttempt.score : (masteryDoc ? masteryDoc.assessmentScore : 0);

                // Prerequisite evaluation via SkillGraphService
                const prereqEval = await SkillGraphService.evaluateSkillPrerequisites(userId, skill.name, masteryMap);
                const isBlocked = prereqEval.isBlocked;
                const prerequisites = await SkillGraphService.getPrerequisites(skill.name);

                // Determine skill status based on deterministic adaptation rules
                let newStatus = skill.status || 'pending';
                let recommendedAction = '';
                let recommendationReason = '';

                if (isBlocked && masteryScore < 70) {
                    newStatus = 'locked';
                    recommendedAction = `Master prerequisites: ${prereqEval.missingPrerequisites.map(p => p.name).join(', ')}`;
                    recommendationReason = prereqEval.reason;
                } else if (masteryScore >= 85) {
                    newStatus = 'mastered';
                    recommendedAction = 'Skill Mastered! Eligible to unlock dependent advanced topics.';
                    recommendationReason = `Demonstrated high proficiency (${masteryScore}% mastery).`;
                } else if (masteryScore >= 70) {
                    newStatus = 'completed';
                    recommendedAction = 'Build advanced portfolio project & practice challenging scenarios.';
                    recommendationReason = `Proficient foundation achieved (${masteryScore}% mastery).`;
                } else if (mistakeCount >= 3) {
                    newStatus = 'remediation';
                    recommendedAction = `Resolve ${mistakeCount} repeated mistakes in ${skill.name}`;
                    recommendationReason = `Repeated errors detected. Remediation recommended before advancing.`;
                } else if (masteryScore > 0 || assessmentScore > 0) {
                    newStatus = 'in-progress';
                    recommendedAction = `Complete targeted practice and take the ${skill.name} assessment.`;
                    recommendationReason = `Currently developing (${masteryScore}% mastery).`;
                } else {
                    newStatus = 'pending';
                    recommendedAction = `Begin fundamental concepts for ${skill.name}.`;
                    recommendationReason = `Foundational skill required for your career goal.`;
                }

                // Fetch semantic course recommendations with explainable reasons
                const courses = await CourseRecommendationService.recommendCoursesForSkill(userId, skill.name, { limit: 2 });

                const updatedSkill = {
                    ...skill,
                    status: newStatus,
                    masteryScore,
                    level,
                    assessmentScore,
                    mistakeCount,
                    prerequisites,
                    isBlocked,
                    blockedReason: isBlocked ? prereqEval.reason : '',
                    recommendedAction,
                    recommendationReason,
                    courses
                };

                // Track if status changed from previous saved state
                if (skill.status !== newStatus || skill.isBlocked !== isBlocked) {
                    changedSkills.push(skill.name);
                    if (!needsVersionBump) {
                        needsVersionBump = true;
                        adaptationReason = isBlocked 
                            ? `Prerequisite dependencies blocked ${skill.name}`
                            : (newStatus === 'mastered' ? `${skill.name} reached Mastered level` : `Adaptive update for ${skill.name}`);
                    }
                }

                adaptedSkills.push(updatedSkill);

                // If critical repeated mistakes exist, insert an explicit remediation item
                if (mistakeCount >= 4 && newStatus === 'remediation') {
                    adaptedSkills.push({
                        name: `Remediation: ${skill.name} Weak Areas`,
                        status: 'remediation',
                        type: 'remediation',
                        hours: 4,
                        masteryScore,
                        level,
                        assessmentScore,
                        mistakeCount,
                        prerequisites: [],
                        isBlocked: false,
                        blockedReason: '',
                        recommendedAction: `Focus on resolving open error patterns in ${skill.name}`,
                        recommendationReason: `High mistake frequency (${mistakeCount} errors, ${mistakeInfo.severity} severity).`,
                        courses
                    });
                }
            }

            adaptedPhases.push({
                ...phase,
                skills: adaptedSkills
            });
        }

        const overallMastery = totalSkillsCount > 0 ? Math.round(totalMasterySum / totalSkillsCount) : 0;

        // 4. Update Roadmap object
        roadmapObj.roadmapPhases = adaptedPhases;
        roadmapObj.overallMastery = overallMastery;
        roadmapObj.skillGapsCount = skillGapsCount;

        // 5. Versioning logic: Save if changed and saveChanges is true
        if (needsVersionBump && options.saveChanges) {
            const newVersion = (roadmap.version || 1) + 1;
            roadmap.version = newVersion;
            roadmap.roadmapPhases = adaptedPhases;
            roadmap.overallMastery = overallMastery;
            roadmap.skillGapsCount = skillGapsCount;

            if (!roadmap.versionHistory) roadmap.versionHistory = [];
            roadmap.versionHistory.push({
                version: newVersion,
                reason: adaptationReason || 'Skill mastery & prerequisite adaptation',
                timestamp: new Date(),
                changedSkills,
                summary: `Roadmap adapted to version ${newVersion} based on performance and prerequisite verification.`
            });

            await roadmap.save();
            roadmapObj.version = newVersion;
            roadmapObj.versionHistory = roadmap.versionHistory;
        }

        return roadmapObj;
    }

    /**
     * Determine the user's Next Best Action across their entire learning journey
     * @param {string} userId
     * @returns {Promise<Object>} Next Best Action recommendation
     */
    async getNextBestAction(userId) {
        const [roadmap, masterySummary, mistakeAnalytics] = await Promise.all([
            this.getAdaptedRoadmap(userId, { saveChanges: false }),
            MasteryEngineService.getUserMasterySummary(userId),
            MistakeAnalysisService.getDetailedSkillMistakeAnalytics(userId)
        ]);

        if (!roadmap || !roadmap.roadmapPhases) {
            return {
                title: 'Generate Your Career Roadmap',
                description: 'Complete your profile setup to generate a personalized AI career roadmap.',
                actionType: 'setup_profile',
                skill: null,
                priority: 'high'
            };
        }

        // Priority 1: Check for critical weak skills with high repeated mistakes
        const criticalMistake = mistakeAnalytics.find(m => m.severity === 'high' && m.mistakeCount >= 3);
        if (criticalMistake) {
            return {
                title: `Remediate ${criticalMistake.skill} Mistakes`,
                description: `You have ${criticalMistake.mistakeCount} open mistakes in ${criticalMistake.skill}. Review foundational concepts to clear error patterns.`,
                actionType: 'remediation',
                skill: criticalMistake.skill,
                priority: 'critical',
                reason: `Repeated mistakes detected with ${criticalMistake.trend} trend.`
            };
        }

        // Priority 2: Check for prerequisite gaps blocking roadmap progression
        for (const phase of roadmap.roadmapPhases) {
            for (const skill of phase.skills) {
                if (skill.isBlocked && skill.prerequisites && skill.prerequisites.length > 0) {
                    const missingPrereq = skill.prerequisites[0];
                    return {
                        title: `Unlock ${skill.name}: Learn ${missingPrereq}`,
                        description: `${skill.name} is currently locked. Master ${missingPrereq} first to unlock this skill.`,
                        actionType: 'prerequisite',
                        skill: missingPrereq,
                        targetSkill: skill.name,
                        priority: 'high',
                        reason: `Prerequisite dependency required (min 70% mastery).`
                    };
                }
            }
        }

        // Priority 3: In-Progress skills needing assessment verification
        for (const phase of roadmap.roadmapPhases) {
            for (const skill of phase.skills) {
                if (skill.status === 'in-progress' && skill.masteryScore < 70) {
                    return {
                        title: `Take ${skill.name} Skill Assessment`,
                        description: `Validate your understanding and boost your mastery score from ${skill.masteryScore}% to Proficient.`,
                        actionType: 'assessment',
                        skill: skill.name,
                        priority: 'medium',
                        reason: `Assessment performance accounts for 50% of your mastery score.`
                    };
                }
            }
        }

        // Priority 4: First pending unblocked skill
        for (const phase of roadmap.roadmapPhases) {
            for (const skill of phase.skills) {
                if (skill.status === 'pending' && !skill.isBlocked) {
                    return {
                        title: `Start Learning ${skill.name}`,
                        description: `Begin the recommended lessons and courses for ${skill.name}.`,
                        actionType: 'learn',
                        skill: skill.name,
                        priority: 'normal',
                        reason: `Next eligible milestone in ${phase.phase || 'your roadmap'}.`
                    };
                }
            }
        }

        return {
            title: 'Great Job! Review Advanced Projects',
            description: 'All core skills are proficient or mastered. Continue working on portfolio projects.',
            actionType: 'review',
            skill: null,
            priority: 'low'
        };
    }

    /**
     * Get dashboard intelligence insights
     * @param {string} userId
     * @returns {Promise<Object>} Dashboard insights
     */
    async getDashboardInsights(userId) {
        const [masterySummary, nextAction, roadmap] = await Promise.all([
            MasteryEngineService.getUserMasterySummary(userId),
            this.getNextBestAction(userId),
            Roadmap.findOne({ user: userId }).sort({ updatedAt: -1 })
        ]);

        return {
            overallMastery: masterySummary.overallMastery,
            level: masterySummary.level,
            skillsMasteredCount: masterySummary.skillsMasteredCount,
            skillGapsCount: masterySummary.skillGapsCount,
            learningVelocity: masterySummary.learningVelocity,
            strongestSkills: masterySummary.strongestSkills,
            weakestSkills: masterySummary.weakestSkills,
            distribution: masterySummary.distribution,
            nextBestAction: nextAction,
            roadmapVersion: roadmap ? (roadmap.version || 1) : 1,
            roadmapGoal: roadmap ? roadmap.goal : ''
        };
    }
}

module.exports = new AdaptiveRoadmapService();
