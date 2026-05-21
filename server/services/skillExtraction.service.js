/**
 * Service to extract technical skills from unstructured text (like Job Descriptions)
 * using a keyword-matching dictionary to avoid heavy API rate limits during bulk fetching.
 */
const TECHNOLOGY_KEYWORDS = [
    'React', 'Node.js', 'TypeScript', 'Docker', 'AWS', 'MongoDB',
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP',
    'Go', 'Swift', 'Kotlin', 'Rust', 'SQL', 'NoSQL', 'PostgreSQL',
    'MySQL', 'Redis', 'GraphQL', 'REST API', 'Kubernetes', 'Azure',
    'GCP', 'Linux', 'Git', 'CI/CD', 'Jenkins', 'Ansible', 'Terraform',
    'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js', 'Express',
    'Django', 'Flask', 'Spring Boot', 'ASP.NET', 'Laravel', 'TensorFlow',
    'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'HTML', 'CSS',
    'Tailwind CSS', 'Sass', 'Figma', 'Agile', 'Scrum'
];

class SkillExtractionService {
    /**
     * Parse text and return an array of matching technology skills.
     * @param {string} description - The job description text
     * @returns {string[]} Array of technical skills required
     */
    static extractSkills(description) {
        if (!description) return [];
        const descLower = description.toLowerCase();
        const extracted = new Set();
        
        for (const keyword of TECHNOLOGY_KEYWORDS) {
            // Match whole words to avoid partial overlapping (e.g. 'go' in 'good')
            // Escaping regex special characters in the keyword
            const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
            
            if (regex.test(descLower)) {
                extracted.add(keyword);
            }
        }
        
        // Fallback for special characters where \b boundaries might fail
        if (descLower.includes('c++')) extracted.add('C++');
        if (descLower.includes('c#')) extracted.add('C#');
        if (descLower.includes('node.js') || descLower.includes('nodejs')) extracted.add('Node.js');
        if (descLower.includes('vue.js') || descLower.includes('vuejs')) extracted.add('Vue.js');
        if (descLower.includes('react.js') || descLower.includes('reactjs')) extracted.add('React');

        return Array.from(extracted);
    }
}

module.exports = SkillExtractionService;
