const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Career = require('./models/Career');

// The dummy data provided in the prompt + existing hardcoded examples
const careerData = [
  {
    title: "Frontend Developer",
    industry: "Startups & Agencies",
    description: "Specialize in building user interfaces and web applications using modern web technologies.",
    salaryRange: "$70k - $100k",
    demandLevel: "High",
    growthRate: "+15%",
    requiredSkills: ["React", "TypeScript", "CSS", "Figma"],
    advantages: [
      "Creative work",
      "High demand jobs"
    ],
    challenges: [
      "Rapid framework changes"
    ]
  },
  {
    title: "Full Stack Developer",
    industry: "Tech Companies",
    description: "Handle both frontend and backend development tasks, bringing entire applications to life.",
    salaryRange: "$80k - $120k",
    demandLevel: "Very High",
    growthRate: "+18%",
    requiredSkills: ["React", "Node.js", "PostgreSQL", "AWS"],
    advantages: [
      "High autonomy",
      "Great stepping stone to architecture"
    ],
    challenges: [
      "Broad knowledge required"
    ]
  },
  {
    title: "DevOps Engineer",
    industry: "Enterprise",
    description: "Bridge the gap between development and operations, ensuring smooth CI/CD and infrastructure health.",
    salaryRange: "$90k - $140k",
    demandLevel: "Very High",
    growthRate: "+22%",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
    advantages: [
      "High salary",
      "Crucial role in tech organizations"
    ],
    challenges: [
      "On-call responsibilities"
    ]
  },
  {
    title: "Backend Developer",
    industry: "Tech Companies",
    description: "Focus on server-side logic, databases, performance, and API design.",
    salaryRange: "$75k - $115k",
    demandLevel: "High",
    growthRate: "+16%",
    requiredSkills: ["Python", "Node.js", "MongoDB", "Redis"],
    advantages: [
      "Focus on logic and architecture",
      "Less UI/UX concerns"
    ],
    challenges: [
      "Performance optimization can be complex"
    ]
  }
];

async function seedCareers() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected.");
    
    console.log("Upserting dummy careers...");
    const upsertPromises = careerData.map(data => 
      Career.findOneAndUpdate(
        { title: data.title }, // Find by title
        { $set: data },        // Update with data
        { upsert: true, new: true } // Create if doesn't exist
      )
    );
    await Promise.all(upsertPromises);
    console.log("Careers seeded successfully! Existing custom careers were preserved.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding careers:", error);
    process.exit(1);
  }
}

seedCareers();
