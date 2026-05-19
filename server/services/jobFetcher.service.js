const fetch = require('node-fetch');
const Job = require('../models/Job');
const SkillExtractionService = require('./skillExtraction.service');

/**
 * Service to sync jobs from the Adzuna External Job API into the internal Mongo Database.
 */
class JobFetcherService {
    
    /**
     * Connects to Adzuna, formats incoming results, runs skill extraction, and saves to DB.
     */
    static async fetchAdzunaJobs(country = 'us', resultsPerPage = 30) {
        const appId = process.env.ADZUNA_APP_ID;
        const appKey = process.env.ADZUNA_APP_KEY;

        if (!appId || !appKey) {
            console.warn('[JobFetcher] Adzuna credentials (ADZUNA_APP_ID, ADZUNA_APP_KEY) missing in .env. Skipping external fetch.');
            return [];
        }

        try {
            console.log(`[JobFetcher] Querying Adzuna for latest ${resultsPerPage} jobs in ${country}...`);
            const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${resultsPerPage}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Adzuna API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const jobs = data.results || [];
            const savedJobs = [];

            for (const jobData of jobs) {
                // Step 6 / Deduplication: Check if already stored via externalId
                const existingJob = await Job.findOne({ externalId: jobData.id?.toString(), source: 'adzuna' });
                if (existingJob) continue;

                // Extract skills dynamically from unstructured description
                const description = jobData.description || '';
                const requiredSkills = SkillExtractionService.extractSkills(description);

                const newJob = await Job.create({
                    title: jobData.title,
                    company: jobData.company?.display_name || 'Unknown Company',
                    location: jobData.location?.display_name || 'Remote',
                    description: description,
                    applicationUrl: jobData.redirect_url,
                    postedDate: jobData.created ? new Date(jobData.created) : Date.now(),
                    source: 'adzuna',
                    externalId: jobData.id?.toString(),
                    requiredSkills: requiredSkills,
                    jobType: (jobData.contract_type === 'contract') ? 'Contract' : 
                             (jobData.contract_type === 'part_time') ? 'Part-time' : 'Full-time'
                });
                savedJobs.push(newJob);
            }
            
            console.log(`[JobFetcher] Successfully fetched and stored ${savedJobs.length} new external jobs.`);
            return savedJobs;

        } catch (error) {
            console.error('[JobFetcher] Failed to fetch external jobs:', error);
            return [];
        }
    }
}

module.exports = JobFetcherService;
