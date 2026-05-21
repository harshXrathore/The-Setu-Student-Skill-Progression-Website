<<<<<<< HEAD
# CareerPath AI - AI-Powered Career Development Platform

**A comprehensive career development and skill gap analysis platform built with React, TypeScript, and Tailwind CSS**
=======
# The-Setu - AI-Powered Career Development Platform

**A comprehensive career development, skill gap analysis, and adaptive learning platform built with the MERN stack and AI.**
>>>>>>> 322b12c50e9bedc5448cb5fcf8909928ef353a0f

---

## 🎯 Project Overview

<<<<<<< HEAD
CareerPath AI is an innovative, AI-powered career development platform designed to bridge the gap between academic learning and industry requirements. The platform helps students, career switchers, and educational institutions identify and fill skill gaps to achieve career goals efficiently.

### Key Features

✅ **AI-Based Skill Gap Analysis** - Identify missing skills with intelligent recommendations  
✅ **Personalized Learning Roadmaps** - Step-by-step paths from Beginner → Advanced  
✅ **Real-Time Job Market Intelligence** - Live insights on trending skills and salaries  
✅ **Interactive Dashboard** - Comprehensive analytics with charts and progress tracking  
✅ **Mentor Network** - Connect with industry experts for guidance  
✅ **Gamification** - Badges, streaks, and achievement tracking  
✅ **Community Forum** - Connect with fellow learners  
✅ **AI Chat Assistant** - Get career guidance instantly  
✅ **Job Board** - Discover opportunities matched to your skills  
✅ **Learning Courses** - Curated courses with progress tracking  
=======
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
>>>>>>> 322b12c50e9bedc5448cb5fcf8909928ef353a0f

---

## 🏗️ Technology Stack

<<<<<<< HEAD
### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.0** - Utility-first styling
- **Recharts** - Beautiful data visualizations
- **Lucide React** - Consistent icon system

### Backend (Proposed)
- **Node.js & Express** - REST API server
- **Python FastAPI** - ML model serving
- **PostgreSQL** - Relational data storage
- **MongoDB** - Flexible document storage
- **Redis** - Caching layer

### AI/ML (Proposed)
- **Scikit-learn** - Skill clustering algorithms
- **TensorFlow** - Deep learning models
- **NLP Models** - Resume and job description analysis
- **Recommendation Systems** - Personalized suggestions
=======
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
>>>>>>> 322b12c50e9bedc5448cb5fcf8909928ef353a0f

---

## 📁 Project Structure

```
<<<<<<< HEAD
/src
├── /app
│   ├── App.tsx                          # Main app component with routing
│   └── /components
│       ├── landing-page.tsx             # Landing page with hero section
│       ├── auth-pages.tsx               # Login & Signup pages
│       ├── dashboard-layout.tsx         # Dashboard shell with navigation
│       ├── dashboard-main.tsx           # Main dashboard content
│       ├── feature-pages.tsx            # Career Explorer & Skill Roadmap
│       ├── additional-pages.tsx         # Job Board, Courses, Mentors, etc.
│       ├── settings-page.tsx            # Settings & Support
│       └── documentation-page.tsx       # Academic project documentation
└── /styles
    └── theme.css                        # Global styles and theme
=======
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
>>>>>>> 322b12c50e9bedc5448cb5fcf8909928ef353a0f
```

---

## 🚀 Getting Started

### Prerequisites
<<<<<<< HEAD
- Node.js 18+ and npm/pnpm installed
- Modern web browser

### Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   - Navigate to the URL shown in terminal (typically `http://localhost:5173`)

---

## 📱 Application Flow

### 1. Landing Page
- Hero section with value proposition
- Features showcase
- User role sections (Students, Career Switchers, Institutions)
- Technology stack overview
- CTA sections

**Navigation:** Click "Login" or "Sign Up" buttons

### 2. Authentication
- **Login Page:** Email/password authentication with "Remember me"
- **Signup Page:** Registration with role selection

**Credentials:** Any email/password works (mock authentication)

### 3. Dashboard
After login, access the full dashboard with:

#### Sidebar Navigation
- 🏠 **Dashboard** - Overview with stats and charts
- 🧭 **Career Explorer** - Browse career paths with match percentages
- 🎯 **My Skills** - Detailed skill roadmap (Beginner → Advanced)
- 💼 **Job Board** - Job listings matched to your skills
- 📚 **Learning (Courses)** - Course catalog with progress tracking
- 👥 **Mentors** - Find and book sessions with mentors
- 💬 **Community** - Discussion forums and Q&A
- 🤖 **AI Chat Assistant** - Career guidance chatbot
- 🏆 **Achievements & Badges** - Gamification and progress
- ⚙️ **Support & Settings** - Account settings and help

#### Dashboard Highlights
- **Profile Summary** - Career goal, skills mastered, progress percentage
- **Skill Growth Chart** - Area chart showing progress over time
- **Skill Distribution** - Pie chart of beginner/intermediate/advanced skills
- **Personalized Roadmap** - Step-by-step learning path
- **Job Market Intelligence** - Trending skills with demand metrics
- **Mentor Recommendations** - Top mentors with availability
- **Achievements** - Badges and streak tracker

### 4. Documentation
Access comprehensive project documentation with:
- Abstract & Problem Statement
- Proposed Solution
- System Architecture
- Technology Stack
- Use Cases
- Impact & Innovation
- Business Model
- Conclusion

**Export:** Click "Export PDF" to print/save documentation

---

## 🎨 Design Features

### Visual Design
- **Modern SaaS aesthetic** with clean layouts
- **Blue primary color** (#3b82f6) for trust and professionalism
- **Gradient accents** for visual interest
- **Card-based UI** with subtle shadows
- **Consistent spacing** and typography

### Responsive Design
- **Desktop-first** with full sidebar navigation
- **Mobile-optimized** with hamburger menu
- **Tablet support** with adaptive grid layouts

### Interactive Elements
- **Hover effects** on cards and buttons
- **Smooth transitions** for state changes
- **Progress bars** with animations
- **Charts** with tooltips

---

## 📊 Dashboard Features in Detail

### Career Explorer
- Browse 4+ career paths
- **Match Percentage** based on current skills
- **Salary Range** information
- **Demand Level** indicators
- **Growth Trends** (e.g., +18%)
- **Required Skills** tags

### My Skills (Roadmap)
- **3 Learning Phases:** Beginner, Intermediate, Advanced
- **12 Skills** across all phases
- **Progress Tracking** with completion status
- **Hour Estimates** for each skill
- **Category Tags** (Frontend, Backend, DevOps, etc.)
- **Resources** section with courses, videos, projects

### Job Board
- **Job Listings** with company names
- **Location** and salary information
- **Match Percentage** for each job
- **Applicant Count** to gauge competition
- **Skills Required** badges
- **Apply/Save/Share** actions

### Learning Courses
- **Course Catalog** with 8+ courses
- **Progress Tracking** for enrolled courses
- **Ratings & Reviews** (e.g., 4.8 stars)
- **Duration** and lesson count
- **Instructor** information
- **Difficulty Levels** (Beginner, Intermediate, Advanced)

### Mentors
- **Mentor Profiles** with experience
- **Availability Status** (Available, Limited, Booked)
- **Session Pricing** per hour
- **Specialties** tags
- **Rating & Session Count**
- **Book/View Profile** actions

### Community
- **Discussion Forum** with categories
- **Post Creation** with category selection
- **Like/Comment/Share** functionality
- **Category Filters** (Career Advice, Learning, Technical Help)
- **User Avatars** and timestamps

### Achievements
- **8 Badges** (4 unlocked, 4 locked)
- **Progress Bars** for locked achievements
- **Streak Tracker** (14-day current streak)
- **Points System** (850 total points)
- **Milestones** timeline
- **Weekly Activity** calendar

### Settings & Support
- **Profile Management** - Edit name, email, bio
- **Notifications** - Granular email preferences
- **Privacy & Security** - Password change, visibility settings
- **Preferences** - Language, timezone, theme
- **Support** - Contact form, FAQs, help resources

---

## 🎓 Academic Documentation

The platform includes a complete academic documentation page suitable for final-year engineering projects:

### Sections Included
1. **Title Page** - Project name, department, year
2. **Abstract** - Project overview and objectives
3. **Problem Statement** - Challenges addressed
4. **Proposed Solution** - Feature breakdown
5. **System Architecture** - 4-layer architecture diagram
6. **Technology Stack** - Frontend, Backend, AI/ML, Database
7. **Use Cases** - 3 detailed scenarios
8. **Impact & Innovation** - Metrics and innovations
9. **Business Model** - Revenue streams
10. **Conclusion** - Summary and future work
11. **References** - Technologies and research papers

### Export Feature
- Click "Export PDF" to print
- Professional formatting for submission
- All content is print-ready

---

## 💡 Mock Data & Features

All data in the application is **mock data** for demonstration purposes:

- User authentication uses any credentials
- Dashboard stats are hardcoded examples
- Charts display sample data
- Jobs, courses, mentors are fictional
- Progress percentages are illustrative
- Community posts are sample discussions

In a production version, this would connect to:
- Backend API for real data
- ML models for skill analysis
- Job market APIs for live listings
- Database for user profiles

---

## 🎯 User Roles Supported

### 🎓 Students
- Personalized skill roadmaps
- Career progress tracking
- Industry-aligned learning paths
- Mentor connections

### 🔁 Career Switchers
- Missing skill detection
- Structured transition planning
- Gap analysis tools
- Transferable skill identification

### 🏫 Institutions
- Curriculum alignment analytics
- Employability tracking
- Student outcome metrics
- Aggregate skill gap reports

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Real backend API integration
- [ ] Advanced NLP for resume parsing
- [ ] Blockchain-based skill certification
- [ ] VR-based skill assessments
- [ ] Predictive career path modeling
- [ ] Social authentication (Google, LinkedIn)
- [ ] Real-time mentor video calls
- [ ] Collaborative learning groups
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard for institutions

### AI/ML Enhancements
- [ ] Skill clustering algorithms
- [ ] Job-skill matching engine
- [ ] Personalized course recommendations
- [ ] Career trajectory predictions
- [ ] Market demand forecasting

---

## 📈 Impact Metrics (Projected)

Based on the proposed system:

- **40% Reduction** in time to career readiness
- **35% Higher** placement rates in target roles
- **78% Success Rate** for career transitions
- **45% Improvement** in curriculum-industry alignment

---

## 🤝 Contributing

This is an academic project demonstration. For production deployment:

1. Implement backend API
2. Add authentication system
3. Integrate ML models
4. Connect to job market APIs
5. Set up database
6. Add analytics tracking
7. Implement payment system (for premium features)
8. Add comprehensive testing

---

## 📄 License

This project is created for educational purposes as a final-year engineering project.

---

## 👨‍💻 About

**CareerPath AI** demonstrates the practical application of modern web technologies, AI/ML concepts, and user-centered design to solve real-world career development challenges.

### Built With
- ❤️ **React** for dynamic UIs
- 🎨 **Tailwind CSS** for beautiful styling  
- 📊 **Recharts** for data visualization
- 🚀 **Modern JavaScript** best practices

---

## 📞 Support

For questions or issues:
- 📧 Email: support@careerpath.ai
- 📱 Phone: 1-800-CAREER
- 💬 Live Chat: Available in Settings → Support

---

**Built for the future of career development** 🚀

**Academic Year 2025-2026**
=======
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
>>>>>>> 322b12c50e9bedc5448cb5fcf8909928ef353a0f
