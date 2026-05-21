const { z } = require('zod');

const CareerSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  industry: z.string().trim().optional(),
  description: z.string().trim().optional(),
  salaryRange: z.string().trim().optional(),
  demandLevel: z.enum(['Low', 'Medium', 'High', 'Very High']).optional(),
  growthRate: z.string().trim().optional(),
  requiredSkills: z.array(z.string().trim()).optional(),
  advantages: z.array(z.string().trim()).optional(),
  challenges: z.array(z.string().trim()).optional()
});

module.exports = {
  CareerSchema
};
