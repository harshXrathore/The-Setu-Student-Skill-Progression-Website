const Skill = require('../models/Skill');

/**
 * Skill Graph Engine Service
 * Expands a user's isolated skills into a broader network of related skills
 * using the centralized Skill model graph.
 */
class SkillGraphService {
    
    /**
     * Expands an array of skill names by finding their matching documents
     * in the Skill model and including their `relatedSkills`.
     * 
     * @param {string[]} userSkills - Array of skill names (e.g., ["React", "Node.js"])
     * @returns {Promise<Set<string>>} - A Set of expanded, unique skill names
     */
    static async expandSkills(userSkills) {
        if (!userSkills || !Array.isArray(userSkills) || userSkills.length === 0) {
            return new Set();
        }

        const expandedSet = new Set(userSkills.map(s => s.trim().toLowerCase()));

        try {
            // Find all skill documents that match the user's skills (case-insensitive)
            const matchedSkills = await Skill.find({
                name: { 
                    $in: userSkills.map(s => new RegExp(`^${s.trim()}$`, 'i')) 
                }
            });

            // For each matched skill, add its related skills to the set
            matchedSkills.forEach(skillDoc => {
                if (skillDoc.relatedSkills && Array.isArray(skillDoc.relatedSkills)) {
                    skillDoc.relatedSkills.forEach(related => {
                        expandedSet.add(related.trim().toLowerCase());
                    });
                }
            });

        } catch (error) {
            console.error('[SkillGraphService] Error expanding skills:', error);
            // On error, just return the unexpanded set to prevent blocking matching
        }

        return expandedSet;
    }
}

module.exports = SkillGraphService;
