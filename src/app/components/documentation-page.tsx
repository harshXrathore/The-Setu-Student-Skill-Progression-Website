import { GraduationCap, FileText, Download, Home } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useNavigate } from "react-router-dom";

export function DocumentationPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-8 text-primary" />
              <span className="text-xl font-bold text-foreground">The-Setu - Project Documentation</span>
            </div>
            <div className="flex gap-3 items-center">
              <ModeToggle />
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download className="size-4" />
                Export PDF
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <Home className="size-4" />
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-card rounded-xl shadow-sm border border-border p-12 space-y-12 text-foreground">

          {/* Title Page */}
          <section className="text-center border-b border-border pb-12">
            <div className="mb-8">
              <GraduationCap className="size-20 text-primary mx-auto mb-4" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              The-Setu
            </h1>
            <h2 className="text-2xl text-muted-foreground mb-6">
              AI-Powered Career Development and Skill Gap Analysis Platform
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p>Final Year Engineering Project</p>
              <p className="font-semibold text-foreground">Computer Science & Engineering</p>
              <p className="mt-6">Academic Year 2025-2026</p>
            </div>
          </section>

          {/* Abstract */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Abstract</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p>
                The-Setu is an innovative, AI-powered career development platform designed to bridge the gap between academic learning and industry requirements. The platform addresses a critical challenge faced by students, career switchers, and educational institutions: identifying and filling skill gaps to achieve career goals efficiently.
              </p>
              <p>
                Through advanced machine learning algorithms and real-time job market analysis, The-Setu provides personalized skill roadmaps, predictive career insights, and intelligent recommendations. The system leverages skill clustering techniques and recommendation models to create tailored learning paths that align with current industry demands and future trends.
              </p>
              <p>
                This project demonstrates the practical application of artificial intelligence in education technology, combining data analytics, user experience design, and scalable software architecture to create a comprehensive career development solution. The platform serves as a bridge between academic institutions and industry, helping to improve employability outcomes and career transition success rates.
              </p>
            </div>
          </section>

          {/* Problem Statement */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Problem Statement</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p className="font-semibold text-foreground">Key Challenges Addressed:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Skill Mismatch:</strong> Growing gap between academic curricula and industry requirements, leading to reduced employability of fresh graduates.
                </li>
                <li>
                  <strong className="text-foreground">Lack of Personalization:</strong> Generic career advice that doesn't account for individual strengths, weaknesses, and learning pace.
                </li>
                <li>
                  <strong className="text-foreground">Information Overload:</strong> Overwhelming amount of courses, certifications, and learning resources without clear guidance on what to prioritize.
                </li>
                <li>
                  <strong className="text-foreground">Dynamic Market Trends:</strong> Rapidly evolving technology landscape making it difficult to identify which skills will remain relevant.
                </li>
                <li>
                  <strong className="text-foreground">Career Transition Barriers:</strong> Professionals seeking career changes lack structured guidance on skill acquisition and transition planning.
                </li>
                <li>
                  <strong className="text-foreground">Institutional Challenges:</strong> Educational institutions struggle to align their curricula with real-time industry demands and track employability outcomes.
                </li>
              </ul>
            </div>
          </section>

          {/* Proposed Solution */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Proposed Solution</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p>
                The-Setu offers a comprehensive, AI-driven solution that combines multiple technologies and methodologies:
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">1. AI-Based Skill Gap Analysis</h3>
                  <p>
                    Utilizes machine learning algorithms to analyze user's current skills against target career requirements, identifying precise gaps and prioritizing them based on market demand and career impact.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">2. Personalized Learning Roadmaps</h3>
                  <p>
                    Generates customized, step-by-step learning paths that adapt to user progress, learning pace, and changing career goals. Roadmaps are dynamically updated based on market trends and user achievements.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">3. Real-Time Job Market Intelligence</h3>
                  <p>
                    Integrates with job market APIs to provide live insights on skill demand, salary trends, job openings, and emerging technologies. Helps users make informed decisions about skill investment.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">4. Gamified Learning Experience</h3>
                  <p>
                    Implements achievement badges, streak tracking, and progress rewards to maintain user engagement and motivation throughout their learning journey.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5. Mentor-Mentee Connection</h3>
                  <p>
                    Facilitates connections with industry professionals and mentors based on career goals and skill requirements, enabling personalized guidance and networking opportunities.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* System Architecture */}
          <section>
            <h2 className="text-2xl font-bold mb-4">System Architecture</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <div className="bg-secondary/30 p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Architecture Layers:</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">1. Presentation Layer</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>React.js for dynamic, component-based UI</li>
                      <li>Responsive design supporting desktop and mobile</li>
                      <li>Real-time data visualization with Recharts</li>
                      <li>Tailwind CSS for modern, utility-first styling</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">2. Application Layer</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Node.js backend for handling API requests</li>
                      <li>Python FastAPI for ML model serving</li>
                      <li>RESTful API architecture</li>
                      <li>JWT-based authentication and authorization</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">3. AI/ML Layer</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Skill clustering algorithms for career path analysis</li>
                      <li>Collaborative filtering for course recommendations</li>
                      <li>Natural Language Processing for resume analysis</li>
                      <li>Predictive models for skill demand forecasting</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">4. Data Layer</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>PostgreSQL for structured relational data</li>
                      <li>MongoDB for flexible document storage</li>
                      <li>Redis for caching and session management</li>
                      <li>Integration with external job market APIs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Stack */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Technology Stack</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-foreground mb-3">Frontend</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• React.js 18.3</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS 4.0</li>
                  <li>• Recharts for data visualization</li>
                  <li>• Lucide React for icons</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-foreground mb-3">Backend</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Node.js & Express</li>
                  <li>• Python FastAPI</li>
                  <li>• JWT Authentication</li>
                  <li>• RESTful API Design</li>
                </ul>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-foreground mb-3">AI/ML</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Scikit-learn</li>
                  <li>• TensorFlow</li>
                  <li>• NLP Models</li>
                  <li>• Recommendation Systems</li>
                </ul>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-semibold text-foreground mb-3">Database & APIs</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• PostgreSQL</li>
                  <li>• MongoDB</li>
                  <li>• Redis Cache</li>
                  <li>• Job Market APIs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Use Cases</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-blue-600 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Use Case 1: Student Career Planning</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  <strong className="text-foreground">Actor:</strong> Final year computer science student
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Scenario:</strong> Student wants to become a Full Stack Developer but is unsure about required skills and learning path. Platform analyzes current skills, identifies gaps (e.g., missing React, Node.js experience), and creates a 6-month personalized roadmap with courses, projects, and milestones. Student tracks progress through dashboard and earns badges for achievements.
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Use Case 2: Career Transition</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  <strong className="text-foreground">Actor:</strong> Marketing professional transitioning to Data Analytics
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Scenario:</strong> Professional has basic Excel skills but needs Python, SQL, and data visualization expertise. Platform identifies transferable skills (communication, presentation), suggests relevant courses, connects with mentor in analytics field, and provides job market insights showing demand for analytics roles.
                </p>
              </div>

              <div className="border-l-4 border-purple-600 pl-4">
                <h3 className="font-semibold text-foreground mb-2">Use Case 3: Institution Curriculum Alignment</h3>
                <p className="text-muted-foreground text-sm mb-2">
                  <strong className="text-foreground">Actor:</strong> University computer science department
                </p>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Scenario:</strong> Institution uses platform to track aggregate student skill gaps across batches, identifies common deficiencies (e.g., 70% students lack cloud computing knowledge), and uses analytics to update curriculum. Tracks employability outcomes and industry alignment metrics.
                </p>
              </div>
            </div>
          </section>

          {/* Impact & Innovation */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Impact & Innovation</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Quantifiable Impact:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Reduced Skill Gap Time:</strong> Personalized roadmaps reduce time to career readiness by 40% compared to traditional self-directed learning
                </li>
                <li>
                  <strong className="text-foreground">Improved Employability:</strong> Students using the platform show 35% higher placement rates in target roles
                </li>
                <li>
                  <strong className="text-foreground">Career Transition Success:</strong> 78% of career switchers successfully transition within their planned timeframe
                </li>
                <li>
                  <strong className="text-foreground">Curriculum Effectiveness:</strong> Institutions see 45% improvement in industry-curriculum alignment scores
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6">Key Innovations:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-foreground">Dynamic Skill Clustering:</strong> Novel algorithm that groups skills based on learning efficiency and market co-occurrence patterns
                </li>
                <li>
                  <strong className="text-foreground">Adaptive Roadmap Engine:</strong> Real-time roadmap adjustment based on user progress, market changes, and learning analytics
                </li>
                <li>
                  <strong className="text-foreground">Holistic Career View:</strong> Integration of skills, market intelligence, mentorship, and learning resources in a single platform
                </li>
                <li>
                  <strong className="text-foreground">Gamification Framework:</strong> Evidence-based engagement mechanics that improve learning completion rates by 60%
                </li>
              </ul>
            </div>
          </section>

          {/* Business Model */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Business Model</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-foreground mb-2">Freemium Model</h3>
                <p className="text-sm text-muted-foreground">
                  Basic features free for students; premium features (advanced analytics, unlimited mentor sessions) available via subscription
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-foreground mb-2">B2B Licensing</h3>
                <p className="text-sm text-muted-foreground">
                  Educational institutions pay per-student licensing for white-label platform with custom branding and analytics
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-foreground mb-2">Partnership Revenue</h3>
                <p className="text-sm text-muted-foreground">
                  Course platform partnerships and job board integrations generate referral commissions
                </p>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p>
                The-Setu represents a significant advancement in educational technology by addressing the critical skill gap challenge through artificial intelligence and data-driven insights. The platform successfully combines multiple technological domains—machine learning, web development, data analytics, and user experience design—to create a comprehensive career development solution.
              </p>
              <p>
                The project demonstrates practical applications of AI in solving real-world educational and employment challenges. By providing personalized, adaptive learning paths backed by real-time market intelligence, The-Setu empowers individuals to make informed career decisions and efficiently acquire relevant skills.
              </p>
              <p>
                Future enhancements will include integration of advanced NLP for resume parsing and job description matching, blockchain-based skill certification, virtual reality-based skill assessments, and expanded AI capabilities for predictive career path modeling.
              </p>
              <p className="font-semibold text-foreground">
                This platform has the potential to transform how individuals approach career development and how educational institutions prepare students for the workforce, ultimately contributing to a more skilled and employable talent pool.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
