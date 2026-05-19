# The-Setu - AI-Powered Career Development Platform

**A comprehensive career development, skill gap analysis, and adaptive learning platform built with the MERN stack and AI.**

---

## 🎯 Project Overview

**The-Setu** is an innovative, full-stack career development platform designed to bridge the gap between academic learning and industry requirements. The platform helps students, career switchers, and educational institutions identify skill gaps, generate adaptive learning paths, and ultimately achieve their career goals efficiently.

### Key Features

- **AI-Based Skill Gap Analysis** - Compares user skills against live job market requirements in real-time.
- **Personalized & Adaptive Learning Roadmaps** - 3-phase AI-generated paths (Beginner → Intermediate → Advanced) powered by Google Gemini, which adapt dynamically based on quiz mistake detection.
- **AI Career Prediction** - Ranks top 3 matching careers using a weighted scoring algorithm (skills, progress, goals, market demand) and provides natural language explanations powered by Grok LLM (xAI).
- **Hybrid Job Board** - A unified board featuring manually posted admin jobs alongside live external listings fetched via the Adzuna API, fully matched to user skill profiles.
- **Mentor Network & Booking Engine** - Connect with industry experts, book sessions based on live availability, and track mentee progress.
- **Gamification & Progress Tracking** - Achievement badges, daily login streaks, points system, and activity heatmaps (Recharts).
- **Robust Security & Auth** - 3-step OTP-verified signup (via Nodemailer), secure JWT authentication, and strict Role-Based Access Control (RBAC).
- **Comprehensive Admin Panel** - Complete oversight of the platform including user management, career paths, job moderation, and system audit logs.

---

## 🏗️ Technology Stack

The project is built on a robust, modern technology stack.

### Frontend
- **React 18.3 & TypeScript** - Modern UI library with strict type-safety.
- **Vite** - Lightning-fast build tool and development server.
- **Tailwind CSS 4.0** - Utility-first CSS framework for responsive design.
- **React Router v7** - Client-side routing.
- **Recharts** - Beautiful, interactive data visualizations and activity heatmaps.
- **Radix UI & Framer Motion / GSAP** - Accessible UI components with smooth animations.

### Backend
- **Node.js & Express.js** - High-performance REST API server.
- **MongoDB & Mongoose** - Flexible NoSQL database with 17+ enforced schema models.
- **JWT & bcryptjs** - Secure stateless authentication and password hashing.
- **Multer** - Handling secure avatar and file uploads.
- **Nodemailer** - Delivering OTP verification emails.
- **Zod** - Robust schema validation for API inputs.

### AI & External Integrations
- **Google Gemini 1.5 Flash** - Generates dynamic learning roadmaps and powers the AI Chat Assistant.
- **Grok LLM (xAI)** - Provides deep reasoning and explanations for career predictions.
- **Adzuna API** - Fetches live, real-world job listings for the hybrid job board.

---

## 📁 Project Structure

```
/
├── /src                      # Frontend React Application
│   ├── /app                  # Main application structure
│   │   ├── /components       # Reusable React components (Pages, Layouts, UI)
│   │   ├── /styles           # Global CSS and Tailwind directives
│   │   ├── /types            # TypeScript type definitions
│   │   └── App.tsx           # Entry point and routing setup
│   └── main.tsx              # React DOM mounting
│
├── /server                   # Backend Node.js/Express Server
│   ├── /config               # Environment and database configurations
│   ├── /controllers          # API route logic and business rules
│   ├── /middleware           # JWT auth, RBAC, rate-limiting, uploads
│   ├── /models               # Mongoose schemas (17+ models)
│   ├── /routes               # Express route definitions
│   ├── /services             # AI integrations (Gemini, Grok), APIs (Adzuna), services
│   ├── /utils                # Helper functions (OTP generation, error handling)
│   └── server.js             # Express application entry point
│
└── package.json              # Frontend dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm installed.
- MongoDB instance (local or Atlas cluster).
- API Keys for Google Gemini, Adzuna (optional for live jobs), and an SMTP server for email (e.g., Gmail App Password).

### 1. Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_google_gemini_api_key
   XAI_API_KEY=your_grok_xai_api_key
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key
   EMAIL_USER=your_smtp_email
   EMAIL_PASS=your_smtp_app_password
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the project root:
   ```bash
   # from the root folder
   ```
2. Install dependencies (pnpm recommended):
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
4. Access the platform at `http://localhost:5173` (or the port Vite provides).

---

## 🎯 User Roles & Capabilities

### 🎓 Students
- Generate AI-powered personalized learning roadmaps.
- Take quizzes and trigger adaptive remediation based on mistakes.
- View AI-predicted career matches and apply for skill-matched jobs.
- Book 1:1 sessions with verified industry mentors.
- Participate in community forums and track learning streaks.

### 👨‍💼 Mentors
- Create professional profiles outlining expertise and session pricing.
- Manage live availability slots for student bookings.
- Accept/decline session requests and track mentee progress.
- Share resources and provide direct career guidance.

### 🛡️ Administrators
- **User Directory**: Suspend/activate users, verify mentor applications.
- **Content Management**: Create/edit courses, lessons, quizzes, and career paths.
- **Job Board**: Moderate manual job postings and manage Adzuna API sync.
- **System Monitoring**: View platform analytics, roadmap monitor, and detailed audit/error logs.
- **Broadcasting**: Send platform-wide announcements.

---

## 🎥 Demo Walkthrough & Application Flow

Here is the typical user journey through the The-Setu platform:

### 1. Onboarding (3-Step Authentication)
- **Step 1:** Users sign up with their basic details.
- **Step 2:** A secure 6-digit OTP is sent via email (Nodemailer). The user verifies the OTP.
- **Step 3:** The user sets a secure password and selects their role (Student/Mentor) to complete registration.

### 2. Profile Setup & AI Generation
- Upon first login, students fill out their profile, existing skills, career goals, and available weekly study hours.
- The system calls the **Gemini AI API** to generate a bespoke, 3-phase learning roadmap (Beginner, Intermediate, Advanced) customized entirely to their profile.

### 3. Student Dashboard Experience
- **Adaptive Learning:** The student begins taking courses and quizzes. If they consistently make mistakes on specific topics (e.g., React Hooks), the **Adaptive Engine** detects this and dynamically inserts a remediation module into their roadmap.
- **Career Predictor:** Based on their skills and learning progress, the student checks the "Career Explorer" tab. The **Grok LLM** predicts their top 3 best-fit careers, providing detailed explanations for why they match.
- **Gamification:** The student views their daily streak, unlocks achievement badges, and views their activity heatmap.

### 4. Mentorship & Jobs
- **Finding Mentors:** A student browses verified mentors, views their real-time availability slots, and books a 1:1 session. The mentor receives a notification and can manage the booking from their dedicated Mentor Dashboard.
- **Job Hunting:** The student visits the Job Board. The system combines manually posted campus jobs with live remote listings from the **Adzuna API**. The **AI Matching Engine** displays a match percentage for each job based on the student's current skill profile.

---

To keep learners engaged, The-Setu features a comprehensive gamification engine:
- **Activity Heatmap**: A GitHub-style contribution graph built with Recharts visualizing daily engagement.
- **Badges & Achievements**: Automated badge unlocking upon completing roadmap milestones, courses, or community participation.
- **Points System**: Users earn points for continuous learning streaks.

---

## 👨‍💻 About The-Setu

**The-Setu** demonstrates the practical application of modern web technologies, AI/ML concepts, and user-centered design to solve real-world career development challenges. Built as a comprehensive academic project for the **Academic Year 2025-2026**.

**Built for the future of adaptive learning and career readiness.** 🚀
