const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RoleGuide = require('./models/RoleGuide');
const connectDB = require('./config/db');

dotenv.config();

const guides = [
    {
        roleName: "Full Stack Developer",
        description: "A versatile developer capable of working on both client-side and server-side applications.",
        mustHaveSkills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git", "REST APIs"],
        careerPath: "Junior Dev -> Mid-Level Dev -> Senior Dev -> Tech Lead -> Solutions Architect",
        resources: [
            { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "doc" },
            { title: "Full Stack Open", url: "https://fullstackopen.com", type: "course" }
        ]
    },
    {
        roleName: "Frontend Developer",
        description: "Specializes in building user interfaces and interactive features for websites and web apps.",
        mustHaveSkills: ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind CSS"],
        careerPath: "Junior Frontend -> Senior Frontend -> Staff Engineer",
        resources: [
            { title: "React Docs", url: "https://react.dev", type: "doc" }
        ]
    },
    {
        roleName: "Backend Developer",
        description: "Focuses on server-side logic, databases, and API architecture.",
        mustHaveSkills: ["Node.js", "Python", "SQL", "NoSQL", "Docker", "API Design", "Security"],
        careerPath: "Junior Backend -> Senior Backend -> Systems Architect",
        resources: [
            { title: "Node.js Best Practices", url: "https://github.com/goldbergyoni/nodebestpractices", type: "doc" }
        ]
    },
    {
        roleName: "Data Scientist",
        description: "Analyzes complex data to help organizations make better decisions.",
        mustHaveSkills: ["Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Statistics", "Machine Learning"],
        careerPath: "Analyst -> Data Scientist -> Senior Data Scientist -> Principal Data Scientist",
        resources: [
            { title: "Kaggle", url: "https://www.kaggle.com", type: "course" }
        ]
    },
    {
        roleName: "DevOps Engineer",
        description: "Bridges the gap between development and operations to automate deployment and infrastructure.",
        mustHaveSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS/Azure", "Terraform", "Bash Scripting"],
        careerPath: "SysAdmin -> DevOps Engineer -> SRE -> Platform Engineer",
        resources: [
            { title: "DevOps Roadmap", url: "https://roadmap.sh/devops", type: "doc" }
        ]
    },
    {
        roleName: "Cybersecurity Analyst",
        description: "Protects organizations from cyber threats and monitors networks for security breaches.",
        mustHaveSkills: ["Network Security", "Linux", "Python", "SIEM (Splunk)", "Ethical Hacking", "Firewalls", "Information Security Policy"],
        careerPath: "Security Analyst -> Security Engineer -> Security Architect -> CISO",
        resources: [
            { title: "Cybrary", url: "https://www.cybrary.it", type: "course" },
            { title: "OWASP", url: "https://owasp.org", type: "doc" }
        ]
    },
    {
        roleName: "Cloud Engineer",
        description: "Designs and manages cloud-based infrastructure and services.",
        mustHaveSkills: ["AWS", "Azure", "Google Cloud", "Terraform", "Docker", "Kubernetes", "Networking"],
        careerPath: "Cloud Associate -> Cloud Engineer -> Cloud Architect",
        resources: [
            { title: "AWS Training", url: "https://aws.amazon.com/training/", type: "course" }
        ]
    },
    {
        roleName: "AI/ML Engineer",
        description: "Designs and builds artificial intelligence models and systems.",
        mustHaveSkills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision", "MLOps"],
        careerPath: "ML Engineer -> Senior ML Engineer -> AI Research Scientist",
        resources: [
            { title: "Fast.ai", url: "https://www.fast.ai", type: "course" },
            { title: "DeepLearning.AI", url: "https://www.deeplearning.ai", type: "course" }
        ]
    }
];

const seedKnowledge = async () => {
    try {
        await connectDB();

        await RoleGuide.deleteMany(); // Clear existing
        console.log('Knowledge Base cleared.');

        await RoleGuide.insertMany(guides);
        console.log(`Seeded ${guides.length} Role Guides into Knowledge Base.`);

        process.exit();
    } catch (error) {
        console.error('Error seeding knowledge base:', error);
        process.exit(1);
    }
};

seedKnowledge();
