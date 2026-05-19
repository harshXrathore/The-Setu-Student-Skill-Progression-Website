const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Service to re-rank a final list of jobs using AI reasoning based on suitability.
 */
class JobRankingService {

    /**
     * Ranks the top jobs using Gemini for a specific user profile context.
     * @param {Object} userProfile - The user's Profile model data
     * @param {Array} jobsList - Array of job objects (already pre-filtered/scored)
     * @returns {Promise<Array>} - The same jobs sorted by AI preference, or original if failed
     */
    static async rankJobsBySuitability(userProfile, jobsList) {
        if (!process.env.GEMINI_API_KEY || jobsList.length === 0) {
            return jobsList;
        }

        try {
            // Create a lightweight representation of jobs for the prompt
            const compressedJobs = jobsList.map(j => ({
                id: j._id.toString(),
                title: j.title,
                required: j.requiredSkills.join(', '),
                score: j.matchScore
            }));

            // Create user context
            const userContext = {
                focus: userProfile.learningGoals?.focus || 'General',
                currentRole: userProfile.occupation?.jobTitle || 'Student',
                skills: userProfile.skills || []
            };

            const prompt = `
                You are an expert technical recruiter matching a candidate to jobs.
                
                Candidate Context:
                Target Focus: ${userContext.focus}
                Current Role: ${userContext.currentRole}
                Candidate Skills: ${userContext.skills.join(', ')}

                Job Opportunities (with basic algorithm Match Score):
                ${JSON.stringify(compressedJobs, null, 2)}

                Task:
                Rank these exact jobs in order of suitability for this specific candidate. Consider their skills and target focus.
                You are only allowed to rearrange the order. Do not drop any jobs.
                Return ONLY a JSON array of the Job IDs in the recommended ranked order, from best match to worst match. No markdown.
                Example output: ["id1", "id2", "id3"]
            `;

            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const cleanText = responseText.replace(/```json|```/g, '').trim();
            const rankedIds = JSON.parse(cleanText);

            if (Array.isArray(rankedIds) && rankedIds.length === jobsList.length) {
                // Reorder the original jobsList based on the ranked IDs
                const rankedJobs = [];
                rankedIds.forEach(id => {
                    const job = jobsList.find(j => j._id.toString() === id);
                    if (job) rankedJobs.push(job);
                });
                
                // Fallback: If AI missed a job somehow, just append the ones left over
                if (rankedJobs.length === jobsList.length) {
                    return { jobs: rankedJobs, metadata: { rankedBy: 'ai' } };
                }
            }

            return { jobs: jobsList, metadata: { rankedBy: 'algorithm' } }; // Fallback to original
        } catch (error) {
            console.error('[JobRankingService] Error ranking jobs:', error);
            // Non-blocking failure, return original list sorted by algorithmic match score
            return { jobs: jobsList.sort((a, b) => b.matchScore - a.matchScore), metadata: { rankedBy: 'algorithm' } };
        }
    }
}

module.exports = JobRankingService;
