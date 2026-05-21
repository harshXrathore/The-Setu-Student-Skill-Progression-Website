const { z } = require('zod');

const RoadmapSchema = z.object({
    roadmapPhases: z.array(
        z.object({
            phase: z.string().min(1, "Phase name is required"),
            duration: z.string().min(1, "Duration is required"),
            skills: z.array(
                z.object({
                    name: z.string().min(1, "Skill name is required"),
                    status: z.enum([
                        'pending',
                        'in-progress',
                        'completed',
                        'verified'
                    ]).default('pending'),
                    type: z.string().min(1, "Skill type is required").transform(val => val.toLowerCase()),
                    hours: z.number().int().nonnegative().optional().default(10),
                    progress: z.number().min(0).max(100).optional().default(0)
                })
            ).min(1, "At least one skill is required per phase")
        })
    ).min(3, "Roadmap must have at least 3 phases")
});

module.exports = RoadmapSchema;
