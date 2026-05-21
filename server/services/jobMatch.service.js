const Course = require('../models/Course');

/**
 * Job Matching Engine
 * Calculates match scores, detects skill gaps, and recommends courses.
 */
class JobMatchService {

    /**
     * Calculates the Match Score for a single job against user profile.
     * Match Score = Skill Match (50%) + Graph Sim (20%) + Career Goal (20%) + Market Demand (10%)
     */
    static calculateScore(user, job, expandedSkillsSet, userSkillsSet) {
        if (!job.requiredSkills || job.requiredSkills.length === 0) return 30; // Base score if no skills listed

        // 1. Skill Match (50%)
        let exactMatches = 0;
        job.requiredSkills.forEach(reqSkill => {
            if (userSkillsSet.has(reqSkill.trim().toLowerCase())) exactMatches++;
        });
        const exactMatchRatio = exactMatches / job.requiredSkills.length;
        const exactScore = exactMatchRatio * 50;

        // 2. Skill Graph Similarity (20%)
        let graphMatches = 0;
        job.requiredSkills.forEach(reqSkill => {
            if (expandedSkillsSet.has(reqSkill.trim().toLowerCase()) && !userSkillsSet.has(reqSkill.trim().toLowerCase())) {
                graphMatches++;
            }
        });
        
        // Max out graph similarity points if they have related skills
        const graphMatchRatio = job.requiredSkills.length > exactMatches 
            ? Math.min(graphMatches / (job.requiredSkills.length - exactMatches), 1) 
            : 0;
        const graphScore = graphMatchRatio * 20;

        // 3. Career Goal Match (20%)
        let goalScore = 0;
        const jobTitleLower = job.title.toLowerCase();
        
        const focus = user.learningGoals?.focus?.toLowerCase() || '';
        const desiredRole = user.preferences?.desiredRole?.toLowerCase() || '';
        const currentRole = user.occupation?.jobTitle?.toLowerCase() || user.occupation?.role?.toLowerCase() || '';
        
        const matchesTarget = (target) => {
            if (!target) return false;
            // Exact inclusion
            if (jobTitleLower.includes(target)) return true;
            // Word overlap
            const words = target.split(/\s+/).filter(w => w.length > 3);
            return words.some(w => jobTitleLower.includes(w));
        };

        if (matchesTarget(focus) || matchesTarget(desiredRole) || matchesTarget(currentRole)) {
            goalScore = 20;
        } else {
            goalScore = 10; // Default flat rate
        }

        // 4. Market Demand / Recency (10%)
        let demandScore = 5; // Standard baseline
        if (job.postedDate) {
            const daysOld = (new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24);
            if (daysOld < 7) demandScore += 3; // Recent listing bump
            else if (daysOld > 30) demandScore -= 2; // Stale penalty
        }
        if (job.applicants !== undefined) {
             if (job.applicants < 10) demandScore += 2; // Low competition edge
             else if (job.applicants > 100) demandScore -= 2; // Saturated competition
        }
        demandScore = Math.max(0, Math.min(demandScore, 10)); // Clamp between 0-10

        let totalScore = exactScore + graphScore + goalScore + demandScore;
        return Math.min(Math.round(totalScore), 100);
    }

    /**
     * Skill Gap Detection (Step 5)
     */
    static detectMissingSkills(job, userSkillsSet) {
        if (!job.requiredSkills) return [];
        return job.requiredSkills.filter(reqSkill => 
            !userSkillsSet.has(reqSkill.trim().toLowerCase())
        );
    }

    /**
     * ReDoS Security Utility
     */
    static escapeRegex(text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    /**
     * Course Recommendations for Missing Skills Batch Query (Step 6)
     */
    static async getBulkCourses(allMissingSkills) {
        if (!allMissingSkills || allMissingSkills.length === 0) return [];

        try {
            // Apply ReDoS escaping prior to RegExp casting
            const regexQueries = allMissingSkills.map(skill => new RegExp(this.escapeRegex(skill), 'i'));

            // Fetch generic mapped courses matching any overlapping missing skill requirements
            const courses = await Course.find({
                $or: [
                    { skillTag: { $in: regexQueries } },
                    { category: { $in: regexQueries } },
                    { title: { $in: regexQueries } }
                ]
            }).select('_id title skillTag difficulty duration category');

            return courses;
        } catch (err) {
            console.error('[JobMatchService] Failed to fetch gap courses:', err);
            return [];
        }
    }
}

module.exports = JobMatchService;
