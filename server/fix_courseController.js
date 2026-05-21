const fs = require('fs');

const replacement = `// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        await course.deleteOne();
        res.json({ message: 'Course removed' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// Get personalized learning dashboard
const getCourseDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Fetch user profile
        const profile = await Profile.findOne({ user: userId });
        const userRole = profile?.occupation?.role || 'student';
        
        // 2. Fetch mistakes to find weak skills
        const mistakes = await Mistake.find({ userId: userId, status: 'open', source: 'quiz' });
        const weakSkills = [...new Set(mistakes.map(m => m.skillTag).filter(Boolean))];
        
        // 3. Fetch roadmap to find required skills
        const roadmap = await Roadmap.findOne({ user: userId }).sort({ createdAt: -1 });
        let roadmapSkills = [];
        if (roadmap && roadmap.roadmapPhases) {
            roadmap.roadmapPhases.forEach(phase => {
                if (phase.skills) {
                    phase.skills.forEach(skill => {
                        if (skill.status === 'pending' || skill.status === 'in-progress') {
                            roadmapSkills.push(skill.name);
                        }
                    });
                }
            });
        }
        roadmapSkills = [...new Set(roadmapSkills.filter(Boolean))];
        
        // 4. Fetch courses
        const popular = await Course.find().sort({ students: -1, rating: -1 }).limit(5);
        const weakSkillCourses = await Course.find({ skillTag: { $in: weakSkills } }).limit(5);
        const roadmapCourses = await Course.find({ skillTag: { $in: roadmapSkills } }).limit(5);
        
        const profileSkills = profile?.skills || [];
        let recommended = await Course.find({ 
            $or: [
                { recommendedFor: userRole },
                { skillTag: { $in: profileSkills } }
            ]
        }).limit(5);
        
        // --- Fallback & Seeding Logic ---
        // If a user has a specific skill (e.g. "Cybersecurity") but the DB has no courses for it,
        // let's generate a placeholder/curated course temporarily so the dashboard isn't empty.
        
        if (recommended.length === 0 && profileSkills.length > 0) {
            // Pick the first skill as a target
            const targetSkill = profileSkills[0];`;

const filepath = 'c:/Users/harsh/Downloads/Website Dashboard Structure (1)/server/controllers/courseController.js';
let content = fs.readFileSync(filepath, 'utf8');

// Find the corrupted section starting at "const deleteCourse" and ending exactly at "const targetSkill = profileSkills[0];"
const startStr = '// @desc    Delete a course';
const endStr = 'const targetSkill = profileSkills[0];';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log("Successfully fixed courseController.js");
} else {
    console.log("Could not find start or end index.");
}
