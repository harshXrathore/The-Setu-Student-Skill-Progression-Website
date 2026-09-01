const Skill = require('../models/Skill');
const SkillMastery = require('../models/SkillMastery');
const { MASTERY_THRESHOLDS } = require('./masteryEngine.service');

// Curated skill dependency knowledge graph
const DEFAULT_SKILL_DEPENDENCIES = {
    // Cybersecurity & Threat Analysis
    'threat hunting': ['networking', 'linux', 'siem'],
    'siem': ['networking', 'linux'],
    'threat detection': ['networking', 'siem'],
    'penetration testing': ['networking', 'linux', 'python', 'security fundamentals'],
    'incident response': ['siem', 'forensics', 'networking'],
    'soc analyst': ['networking', 'security fundamentals', 'siem'],
    'security fundamentals': ['computer science basics'],
    'forensics': ['linux', 'operating systems'],

    // Full Stack & Web Development
    'full stack development': ['frontend development', 'backend development'],
    'frontend development': ['html', 'css', 'javascript'],
    'react': ['javascript', 'html', 'css'],
    'next.js': ['react', 'node.js'],
    'vue.js': ['javascript', 'html', 'css'],
    'typescript': ['javascript'],
    'backend development': ['node.js', 'databases', 'apis'],
    'node.js': ['javascript', 'asynchronous programming'],
    'express.js': ['node.js', 'javascript'],
    'databases': ['sql'],
    'postgresql': ['sql', 'databases'],
    'mongodb': ['nosql', 'databases'],
    'graphql': ['apis', 'javascript'],
    'apis': ['http basics', 'json'],
    'system design': ['backend development', 'databases', 'caching', 'microservices'],
    'microservices': ['docker', 'backend development', 'apis'],

    // DevOps & Cloud
    'kubernetes': ['docker', 'linux', 'networking'],
    'docker': ['linux', 'containers basics'],
    'ci/cd': ['git', 'linux', 'automated testing'],
    'aws': ['cloud computing basics', 'linux', 'networking'],
    'cloud computing basics': ['networking', 'operating systems'],
    'terraform': ['cloud computing basics', 'infrastructure as code'],

    // Data Science & AI/ML
    'deep learning': ['machine learning', 'linear algebra', 'python'],
    'machine learning': ['python', 'statistics', 'numpy', 'pandas'],
    'pandas': ['python', 'data structures'],
    'numpy': ['python', 'linear algebra'],
    'data structures': ['algorithms', 'programming basics'],
    'algorithms': ['programming basics', 'mathematics'],
    'python': ['programming basics'],
    'sql': ['databases basics'],

    // Core Foundations
    'linux': ['operating systems'],
    'networking': ['computer science basics'],
    'git': ['version control basics'],
    'javascript': ['programming basics']
};

class SkillGraphService {
    /**
     * Helper to normalize a skill name for matching
     */
    static normalize(name) {
        return (name || '').trim().toLowerCase();
    }

    /**
     * Detect circular dependency in the graph using DFS
     * @param {string} skill
     * @param {string[]} proposedPrerequisites
     * @param {Map<string, string[]>} graph
     * @returns {boolean} true if cycle detected
     */
    static hasCircularDependency(skill, proposedPrerequisites, graph = null) {
        const skillNorm = this.normalize(skill);
        const adjList = graph || new Map();

        // Build adjacency list if not provided
        if (!graph) {
            for (const [s, prereqs] of Object.entries(DEFAULT_SKILL_DEPENDENCIES)) {
                adjList.set(this.normalize(s), (prereqs || []).map(p => this.normalize(p)));
            }
        }

        // Set proposed prerequisites for the target skill
        adjList.set(skillNorm, proposedPrerequisites.map(p => this.normalize(p)));

        const visited = new Set();
        const recStack = new Set();

        const dfs = (node) => {
            visited.add(node);
            recStack.add(node);

            const neighbors = adjList.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (dfs(neighbor)) return true;
                } else if (recStack.has(neighbor)) {
                    return true; // Cycle found!
                }
            }

            recStack.delete(node);
            return false;
        };

        for (const node of adjList.keys()) {
            if (!visited.has(node)) {
                if (dfs(node)) return true;
            }
        }

        return false;
    }

    /**
     * Get direct prerequisites for a skill
     * @param {string} skillName
     * @returns {Promise<string[]>}
     */
    static async getPrerequisites(skillName) {
        const norm = this.normalize(skillName);
        const mongoose = require('mongoose');

        // 1. Check DB first if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const skillDoc = await Skill.findOne({ name: new RegExp(`^${norm}$`, 'i') });
                if (skillDoc && skillDoc.prerequisites && skillDoc.prerequisites.length > 0) {
                    return skillDoc.prerequisites;
                }
            } catch (e) {
                console.error('[SkillGraphService] DB lookup error:', e);
            }
        }

        // 2. Fallback to curated dictionary
        for (const [key, prereqs] of Object.entries(DEFAULT_SKILL_DEPENDENCIES)) {
            if (this.normalize(key) === norm || norm.includes(this.normalize(key)) || this.normalize(key).includes(norm)) {
                return prereqs;
            }
        }

        return [];
    }

    /**
     * Get dependent skills that require this skill
     * @param {string} skillName
     * @returns {Promise<string[]>}
     */
    static async getDependents(skillName) {
        const norm = this.normalize(skillName);
        const mongoose = require('mongoose');
        const dependents = new Set();

        // 1. From dictionary
        for (const [skill, prereqs] of Object.entries(DEFAULT_SKILL_DEPENDENCIES)) {
            if (prereqs.map(p => this.normalize(p)).includes(norm)) {
                dependents.add(skill);
            }
        }

        // 2. From DB if connected
        if (mongoose.connection.readyState === 1) {
            try {
                const dbSkills = await Skill.find({
                    prerequisites: { $in: [new RegExp(`^${norm}$`, 'i')] }
                });
                dbSkills.forEach(s => dependents.add(s.name));
            } catch (e) {
                console.error('[SkillGraphService] getDependents DB error:', e);
            }
        }

        return Array.from(dependents);
    }

    /**
     * Evaluate if a user meets all prerequisites for a skill
     * @param {string} userId
     * @param {string} skillName
     * @param {Map<string, Object>} preloadedMasteryMap
     * @returns {Promise<{ isBlocked: boolean, missingPrerequisites: Array<{ name: string, masteryScore: number, required: number }>, reason: string }>}
     */
    static async evaluateSkillPrerequisites(userId, skillName, preloadedMasteryMap = null) {
        const prereqs = await this.getPrerequisites(skillName);
        if (!prereqs || prereqs.length === 0) {
            return {
                isBlocked: false,
                missingPrerequisites: [],
                reason: 'No prerequisites required'
            };
        }

        let masteryMap = preloadedMasteryMap;
        if (!masteryMap) {
            const userMasteries = await SkillMastery.find({ userId });
            masteryMap = new Map();
            userMasteries.forEach(m => masteryMap.set(this.normalize(m.skillName), m));
        }

        const requiredThreshold = MASTERY_THRESHOLDS.PREREQUISITE_MIN || 70;
        const missingPrerequisites = [];

        for (const prereq of prereqs) {
            const prereqNorm = this.normalize(prereq);
            // Search mastery map for exact or substring match
            let matchedMastery = masteryMap.get(prereqNorm);
            if (!matchedMastery) {
                for (const [key, val] of masteryMap.entries()) {
                    if (key.includes(prereqNorm) || prereqNorm.includes(key)) {
                        matchedMastery = val;
                        break;
                    }
                }
            }

            const currentScore = matchedMastery ? matchedMastery.masteryScore : 0;
            if (currentScore < requiredThreshold) {
                missingPrerequisites.push({
                    name: prereq,
                    masteryScore: currentScore,
                    required: requiredThreshold
                });
            }
        }

        const isBlocked = missingPrerequisites.length > 0;
        const reason = isBlocked
            ? `Blocked by prerequisite gaps: ${missingPrerequisites.map(p => `${p.name} (${p.masteryScore}% / ${p.required}% min)`).join(', ')}`
            : 'All prerequisites satisfied';

        return {
            isBlocked,
            missingPrerequisites,
            reason
        };
    }

    /**
     * Determine next eligible skills that the user can unlock
     * @param {string} userId
     * @param {string[]} candidateSkills
     * @returns {Promise<Array<{ name: string, prerequisites: string[], status: string }>>}
     */
    static async getNextEligibleSkills(userId, candidateSkills = []) {
        const userMasteries = await SkillMastery.find({ userId });
        const masteryMap = new Map();
        userMasteries.forEach(m => masteryMap.set(this.normalize(m.skillName), m));

        const eligible = [];

        for (const skillName of candidateSkills) {
            const norm = this.normalize(skillName);
            const mastery = masteryMap.get(norm);
            const currentScore = mastery ? mastery.masteryScore : 0;

            // Only consider skills that are not already mastered
            if (currentScore < MASTERY_THRESHOLDS.MASTERED_MIN) {
                const evalResult = await this.evaluateSkillPrerequisites(userId, skillName, masteryMap);
                if (!evalResult.isBlocked) {
                    eligible.push({
                        name: skillName,
                        prerequisites: await this.getPrerequisites(skillName),
                        masteryScore: currentScore,
                        status: currentScore >= 70 ? 'proficient' : (currentScore > 0 ? 'in-progress' : 'ready-to-start')
                    });
                }
            }
        }

        return eligible;
    }

    /**
     * Generate full skill graph visualization data for the UI
     * @param {string} userId
     * @param {string} goal
     * @returns {Promise<{ nodes: Array, edges: Array }>}
     */
    static async getSkillGraphData(userId, goal = '') {
        // 1. Fetch user mastery records
        const userMasteries = await SkillMastery.find({ userId });
        const masteryMap = new Map();
        userMasteries.forEach(m => masteryMap.set(this.normalize(m.skillName), m));

        const nodesMap = new Map();
        const edges = [];

        // Collect all known skills from dictionary + user masteries
        const allKnownSkills = new Set([
            ...Object.keys(DEFAULT_SKILL_DEPENDENCIES),
            ...Object.values(DEFAULT_SKILL_DEPENDENCIES).flat(),
            ...userMasteries.map(m => m.skillName)
        ]);

        for (const rawSkill of allKnownSkills) {
            const norm = this.normalize(rawSkill);
            const prereqs = DEFAULT_SKILL_DEPENDENCIES[norm] || [];
            const mastery = masteryMap.get(norm);
            const score = mastery ? mastery.masteryScore : 0;

            // Determine visual state
            let nodeStatus = 'developing';
            if (score >= 85) nodeStatus = 'mastered';
            else if (score >= 70) nodeStatus = 'proficient';
            else if (score < 40 && score > 0) nodeStatus = 'weak';
            else if (score === 0) nodeStatus = 'pending';

            // Check if blocked
            let isBlocked = false;
            let missingCount = 0;
            if (prereqs.length > 0) {
                for (const p of prereqs) {
                    const pMastery = masteryMap.get(this.normalize(p));
                    if (!pMastery || pMastery.masteryScore < 70) {
                        missingCount++;
                    }
                }
                if (missingCount > 0 && score < 70) {
                    isBlocked = true;
                    nodeStatus = 'locked';
                }
            }

            nodesMap.set(norm, {
                id: norm,
                name: rawSkill.charAt(0).toUpperCase() + rawSkill.slice(1),
                masteryScore: score,
                level: mastery ? mastery.level : (score >= 85 ? 'Mastered' : (score >= 70 ? 'Proficient' : (score >= 40 ? 'Developing' : 'Beginner'))),
                status: nodeStatus,
                isBlocked,
                prerequisites: prereqs,
                mistakeCount: mastery ? (mastery.mistakeCount || 0) : 0,
                assessmentScore: mastery ? (mastery.assessmentScore || 0) : 0
            });

            // Create directed edges: Prerequisite -> Dependent
            prereqs.forEach(prereq => {
                edges.push({
                    from: this.normalize(prereq),
                    to: norm,
                    type: 'prerequisite'
                });
            });
        }

        return {
            nodes: Array.from(nodesMap.values()),
            edges
        };
    }

    /**
     * Backward-compatible expandSkills method
     */
    static async expandSkills(userSkills) {
        if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
            return new Set();
        }

        const expandedSet = new Set(userSkills.map(s => s.trim().toLowerCase()));

        try {
            const matchedSkills = await Skill.find({
                name: { $in: userSkills.map(s => new RegExp(`^${s.trim()}$`, 'i')) }
            });

            matchedSkills.forEach(skillDoc => {
                if (skillDoc.relatedSkills && Array.isArray(skillDoc.relatedSkills)) {
                    skillDoc.relatedSkills.forEach(related => {
                        expandedSet.add(related.trim().toLowerCase());
                    });
                }
                if (skillDoc.dependents && Array.isArray(skillDoc.dependents)) {
                    skillDoc.dependents.forEach(dep => {
                        expandedSet.add(dep.trim().toLowerCase());
                    });
                }
            });
        } catch (error) {
            console.error('[SkillGraphService] Error expanding skills:', error);
        }

        return expandedSet;
    }
}

module.exports = SkillGraphService;
