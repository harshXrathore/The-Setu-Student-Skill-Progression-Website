const { GoogleGenerativeAI } = require('@google/generative-ai');
const Roadmap = require('../models/Roadmap');
const RoleGuide = require('../models/RoleGuide');
const Course = require('../models/Course');
const MistakeAnalysisService = require('../services/mistakeAnalysis.service');
const RoadmapSchema = require('../validators/roadmapSchema');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Task 7: Escape regex special chars to prevent ReDoS
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Analyze profile and generate roadmap
// @route   POST /api/skills/analyze
// @access  Private
const analyzeProfile = async (req, res) => {
  try {
    const userProfile = req.body;
    console.log("INCOMING PROFILE DATA:", JSON.stringify(userProfile, null, 2)); // DEBUG LOG
    // Improvement 7: Fix Goal Consistency - Prefer jobTitle, fallback to desiredRole or learning focus
    const targetRoleName =
      userProfile.occupation?.jobTitle ||
      userProfile.preferences?.desiredRole ||
      userProfile.learningGoals?.focus ||
      (userProfile.occupation?.major ? `${userProfile.occupation.major} Student` : null) ||
      'Full Stack Developer';
    const learningFocus = targetRoleName;

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration: AI key missing." });
    }

    // 1. Check if a roadmap for this specific goal already exists (Caching / Cost Control)
    if (req.user && !req.body.regenerate) {
      const existingRoadmap = await Roadmap.findOne({
        user: req.user.id,
        goal: learningFocus
      }).sort({ createdAt: -1 }); // Get latest if multiple

      if (existingRoadmap) {
        console.log(`Found existing roadmap for goal: ${learningFocus}`);
        return res.json(existingRoadmap);
      }
    }

    // --- RAG: RETRIEVAL STEP (Improvement 2: Text Search) ---
    let contextString = "";
    let roleResources = [];
    try {
      console.log(`[RAG] Searching Knowledge Base for role: "${targetRoleName}"...`);

      // Use MongoDB Text Search for better matching
      const roleGuide = await RoleGuide.findOne({
        $text: { $search: targetRoleName }
      }, { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } });

      if (roleGuide) {
        console.log(`[RAG] Found context: ${roleGuide.roleName}`);
        roleResources = roleGuide.resources || [];

        // Improvement 6: Inject Resources into Context
        const resourceList = roleResources.map(r => `- [${r.type.toUpperCase()}] ${r.title}: ${r.url}`).join('\n');

        contextString = `
            [INDUSTRY STANDARD CONTEXT]
            Role: ${roleGuide.roleName}
            Description: ${roleGuide.description}
            MUST-HAVE SKILLS: ${roleGuide.mustHaveSkills.join(', ')}
            Typical Career Path: ${roleGuide.careerPath}
            RECOMMENDED RESOURCES:
            ${resourceList}
            
            INSTRUCTION: 
            1. You MUST explicitly include ALL the "MUST-HAVE SKILLS" listed above directly into the generated roadmap phases.
            2. You MUST include the "Recommended Resources" in your response (if the schema supports it, otherwise use them to inform difficulty).
            `;
      } else {
        console.log(`[RAG] No specific guide found for "${targetRoleName}". Using general knowledge.`);
      }
    } catch (ragError) {
      console.error("[RAG] Retrieval failed (continuing without context):", ragError);
    }
    // ---------------------------

    console.log(`Generating NEW roadmap for goal: ${learningFocus}`);

    // Improvement 1: Must-Have Skills Enforcement (Prompt Update)
    const systemPrompt = `
      You are an expert career coach and technical mentor. 
      Analyze the provided user profile JSON. 
      ${contextString}

      Return a JSON object strictly following this schema for a "Detailed Skill Roadmap":
      
      {
        "roadmapPhases": [
          {
            "phase": "String (e.g., Phase 1: Foundation)",
            "duration": "String (e.g., 1-2 months)",
            "skills": [
              { "name": "String", "status": "pending", "type": "String (fundamental|framework|backend|language|tool|devops)", "hours": Number }
            ]
          }
        ]
      }

      RULES:
      1. Tailor skills to the user's "interests", "jobTitle", and "goals" found in the input.
      2. MANDATORY: If [INDUSTRY STANDARD CONTEXT] is provided, you MUST include ALL "MUST-HAVE SKILLS" listed there.
      3. If they are a 'student', focus on foundational and industry-standard skills.
      4. If they are a 'mentor' or professional, focus on advanced, niche, or leadership skills.
      5. Return ONLY raw JSON. No markdown formatting.
      6. Provide at least 3 phases with 4 skills each.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    // Retry logic for 429 errors
    const MAX_RETRIES = 3;
    let attempt = 0;
    let response;

    while (attempt < MAX_RETRIES) {
      try {
        const result = await model.generateContent([
          systemPrompt,
          JSON.stringify(userProfile)
        ]);
        response = await result.response;
        break; // Success
      } catch (error) {
        if (error.response && error.response.status === 429) {
          attempt++;
          console.log(`Gemini 429 Error. Retrying attempt ${attempt}/${MAX_RETRIES}...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Wait 2s, 4s, 6s
        } else {
          // Break cleanly instead of throwing on 503, letting fallback take over
          console.log(`[Gemini API] Reached error on attempt ${attempt}:`, error.message);
          break;
        }
      }
    }

    let text = "";

    if (!response) {
      console.warn("Max retries exceeded for Gemini API. Using resilient fallback roadmap.");
      // Fallback Roadmap Generator (Hardcoded resilient default for 503 outages)
      text = JSON.stringify({
        roadmapPhases: [
          {
            phase: "Phase 1: Fundamentals & Environment Setup",
            duration: "2-4 weeks",
            skills: [
              { name: "Version Control (Git/GitHub)", status: "pending", type: "tool", hours: 20 },
              { name: "Programming Basics (Variables, Loops, Functions)", status: "pending", type: "language", hours: 40 },
              { name: "Basic Command Line/Terminal", status: "pending", type: "tool", hours: 10 },
              { name: "Developer Tools & IDE Config", status: "pending", type: "tool", hours: 10 }
            ]
          },
          {
            phase: `Phase 2: Core ${learningFocus} Concepts`,
            duration: "1-2 months",
            skills: [
              { name: "Core Architecture & Paradigms", status: "pending", type: "fundamental", hours: 30 },
              { name: "Basic Project Implementation", status: "pending", type: "practical", hours: 50 },
              { name: "Debugging & Troubleshooting", status: "pending", type: "skill", hours: 20 },
              { name: "Documentation Reading", status: "pending", type: "skill", hours: 15 }
            ]
          },
          {
            phase: "Phase 3: Industry Standards",
            duration: "1-2 months",
            skills: [
              { name: "Testing Basics", status: "pending", type: "tool", hours: 25 },
              { name: "Deployment & Hosting", status: "pending", type: "devops", hours: 30 },
              { name: "Security Best Practices", status: "pending", type: "fundamental", hours: 20 },
              { name: "Portfolio Building", status: "pending", type: "practical", hours: 40 }
            ]
          }
        ]
      });
    } else {
      text = response.text();
    }

    let skillsData;

    try {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleanText);

      // ZOD VALIDATION UPGRADE (Improvement 5)
      const validationResult = RoadmapSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        console.error("Zod Validation Failed:", JSON.stringify(validationResult.error.format(), null, 2));
        return res.status(400).json({
          error: "Invalid AI Roadmap Format",
          details: validationResult.error.format()
        });
      }

      skillsData = validationResult.data; // Use the sanitized/transformed data from Zod

    } catch (e) {
      console.error("Failed to parse/validate AI response. Raw text:", text, e);
      return res.status(500).json({ error: "Failed to parse AI response", raw: text });
    }

    // Save to Database
    let savedRoadmap = skillsData; // Fallback
    if (req.user) {
      try {
        savedRoadmap = await Roadmap.create({
          user: req.user.id,
          title: `Roadmap: ${learningFocus}`,
          goal: learningFocus,
          roadmapPhases: skillsData.roadmapPhases
        });
        console.log("Roadmap saved DB:", learningFocus);
      } catch (dbError) {
        console.error("Failed to save roadmap to DB:", dbError);
      }
    }

    // Improvement 4: Return Saved Roadmap Object Consistently
    res.json(savedRoadmap);
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to analyze profile", details: error.message });
  }
};

// @desc    Get latest roadmap for user
// @route   GET /api/skills/latest
// @access  Private
const getLatestRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user.id }).sort({ updatedAt: -1 });
    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap found' });
    }

    // Adaptive Learning Augmentation
    const updatedRoadmapObj = roadmap.toObject();
    
    // 1. Fetch Mistake Analytics for this user
    let mistakeData = { countsBySkill: {} };
    try {
        mistakeData = await MistakeAnalysisService.analyzeUserMistakes(req.user.id);
    } catch (e) {
        console.error("Failed to fetch mistake analysis for adaptive roadmap:", e);
    }

    // 2. Augment Roadmap Phases with Courses and Remediation Iteratively
    const learningPlan = [];
    let stepCounter = 1;

    if (updatedRoadmapObj.roadmapPhases && updatedRoadmapObj.roadmapPhases.length > 0) {

        // Task 8: Batch course lookup — collect all unique skill names first
        const allSkillNames = [];
        updatedRoadmapObj.roadmapPhases.forEach(phase => {
            phase.skills.forEach(skill => {
                if (skill.name) allSkillNames.push(skill.name);
            });
        });
        const uniqueSkillNames = [...new Set(allSkillNames)];

        // Single batched query instead of N+1 per skill
        const allCourses = await Course.find({
            $or: [
                { skillTag: { $in: uniqueSkillNames.map(n => new RegExp(escapeRegex(n), 'i')) } },
                { title:    { $in: uniqueSkillNames.map(n => new RegExp(escapeRegex(n), 'i')) } }
            ]
        }).limit(50).select('title difficulty skillTag _id');

        // Build a map: skillName -> matching courses
        const coursesBySkill = {};
        uniqueSkillNames.forEach(skillName => {
            const pattern = new RegExp(escapeRegex(skillName), 'i');
            coursesBySkill[skillName] = allCourses
                .filter(c => pattern.test(c.skillTag || '') || pattern.test(c.title || ''))
                .slice(0, 3);
        });

        for (let i = 0; i < updatedRoadmapObj.roadmapPhases.length; i++) {
            const phase = updatedRoadmapObj.roadmapPhases[i];
            const adaptedSkills = [];

            for (let j = 0; j < phase.skills.length; j++) {
                const skill = phase.skills[j];
                const courses = coursesBySkill[skill.name] || [];

                skill.courses = courses;
                adaptedSkills.push(skill);

                learningPlan.push({
                    step: stepCounter++,
                    title: skill.name,
                    courses: courses
                });

                // Mistake-based remediation injection
                let mistakeCount = 0;
                const skillNameLower = skill.name.toLowerCase();
                for (const [key, count] of Object.entries(mistakeData.countsBySkill)) {
                    if (key.toLowerCase().includes(skillNameLower) || skillNameLower.includes(key.toLowerCase())) {
                        mistakeCount += count;
                    }
                }

                if (mistakeCount > 5) {
                    const remediationName = `Improve ${skill.name} Fundamentals`;
                    adaptedSkills.push({
                        name: remediationName,
                        type: "remediation",
                        status: "pending",
                        reason: "Repeated mistakes detected in this exact skill",
                        hours: 5,
                        courses: courses
                    });
                    learningPlan.push({
                        step: stepCounter++,
                        title: remediationName,
                        type: "remediation",
                        reason: "Repeated mistakes detected"
                    });
                }
            }

            updatedRoadmapObj.roadmapPhases[i].skills = adaptedSkills;
        }
    }
    
    // Attach the flat structure requested
    updatedRoadmapObj.learningPlan = learningPlan;

    res.json(updatedRoadmapObj);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update a skill's status in a roadmap
// @route   PATCH /api/skills/:roadmapId/skills/:skillName
// @access  Private
const updateSkillStatus = async (req, res) => {
  try {
    const { roadmapId, skillName } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed', 'verified'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user.id });
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap not found' });
    }

    // Find the skill across all phases
    const decodedName = decodeURIComponent(skillName);
    let updated = false;
    for (const phase of roadmap.roadmapPhases) {
      for (const skill of phase.skills) {
        if (skill.name.toLowerCase() === decodedName.toLowerCase()) {
          skill.status = status;
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (!updated) {
      return res.status(404).json({ error: `Skill "${decodedName}" not found in roadmap` });
    }

    await roadmap.save();
    res.json(roadmap);
  } catch (err) {
    console.error('updateSkillStatus error:', err.message);
    res.status(500).json({ error: 'Server error updating skill status' });
  }
};

module.exports = {
  analyzeProfile,
  getLatestRoadmap,
  updateSkillStatus
};
