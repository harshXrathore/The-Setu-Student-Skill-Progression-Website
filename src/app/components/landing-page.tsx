import { useState, useEffect } from "react";
import { GraduationCap, Target, TrendingUp, Sparkles, RefreshCw, BarChart, GitBranch, Search, Map, Trophy, Briefcase, ArrowRight, ChevronDown } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  const [textIndex, setTextIndex] = useState(0);
  const titles = ["Accelerate Your Future.", "Land Your Dream Job.", "Master New Skills.", "Build Your Career."];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden font-sans relative group/landing">


      {/* Navbar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="size-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">The-Setu</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                <Sparkles className="size-2.5" /> AI-Powered
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              Login
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all group-hover:w-full"></span>
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Abstract Background Aurora */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden flex justify-center">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/15 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/15 rounded-full blur-[120px] mix-blend-screen"
          />
          <motion.div
            animate={{
              y: [0, -50, 0],
              x: [0, 50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 left-[20%] w-[60vw] h-[60vw] bg-pink-500/15 rounded-full blur-[120px] mix-blend-screen"
          />
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-background/50 border border-border/50 backdrop-blur-md rounded-full mb-8 shadow-sm hover:border-primary/50 transition-colors cursor-default"
          >
            <Sparkles className="size-3.5 text-yellow-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Reinventing Career Growth</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]"
          >
            Bridge Your Skill Gaps.<br />
            <motion.span
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent pb-2 inline-block min-w-[300px]"
            >
              {titles[textIndex]}
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Stop guessing what to learn. Get personalized roadmaps, real-time job market intelligence, and AI-driven insights to seamlesssly transition into your dream role.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-semibold shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2 overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center gap-2">
                Get Started Free
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <ArrowRight className="size-5" />
                </motion.div>
              </span>
            </motion.button>
            <button
              onClick={() => navigate('/docs')}
              className="px-8 py-4 bg-background border border-border text-foreground rounded-full hover:bg-muted/50 hover:border-foreground/30 text-lg font-semibold transition-all backdrop-blur-sm"
            >
              View Documentation
            </button>
          </motion.div>


          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground/50 flex flex-col items-center gap-2 pointer-events-none"
          >
            <span className="text-xs font-medium uppercase tracking-widest">Scroll to explore</span>
            <ChevronDown className="size-6" />
          </motion.div>

          {/* Dashboard Preview or Abstract Graphic could go here */}
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24 relative">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-1.5 rounded-full">Core Platform</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Complete set of tools to guide you from learning to earning.</p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(180px,auto)]">
            {/* Large Card - Real-Time Market Data */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-3 md:row-span-2"
              icon={<TrendingUp className="size-10 text-blue-500" />}
              title="Real-Time Market Data"
              description="Roadmaps powered by current job market demands. We analyze thousands of job listings daily so your learning path is always relevant and never outdated."
              gradient="from-blue-500/10 via-blue-500/5 to-transparent"
              glowColor="rgba(59,130,246,0.15)"
              tag="Live"
            />
            {/* Medium Card - Gap Analysis */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-3"
              icon={<Target className="size-8 text-red-500" />}
              title="Personalized Gap Analysis"
              description="Identify exactly what skills you're missing and get a clear path to acquire them."
              gradient="from-red-500/10 via-red-500/5 to-transparent"
              glowColor="rgba(239,68,68,0.15)"
            />
            {/* Small Card - Dynamic Updates */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-3"
              icon={<RefreshCw className="size-8 text-green-500" />}
              title="Dynamic Updates"
              description="Your roadmap automatically adjusts as industries evolve and your goals change."
              gradient="from-green-500/10 via-green-500/5 to-transparent"
              glowColor="rgba(34,197,94,0.15)"
            />
            {/* Small Card - Progress Tracking */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-2"
              icon={<BarChart className="size-8 text-purple-500" />}
              title="Progress Tracking"
              description="Visual milestones and progress indicators to keep you motivated."
              gradient="from-purple-500/10 via-purple-500/5 to-transparent"
              glowColor="rgba(168,85,247,0.15)"
            />
            {/* Small Card - Multiple Career */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-2"
              icon={<GitBranch className="size-8 text-orange-500" />}
              title="Multi-Career Support"
              description="Switch career paths as many times as you need, anytime."
              gradient="from-orange-500/10 via-orange-500/5 to-transparent"
              glowColor="rgba(249,115,22,0.15)"
            />
            {/* Large Card - Smart Recommendations */}
            <BentoCard
              variants={fadeInUp}
              className="md:col-span-2"
              icon={<Sparkles className="size-8 text-yellow-500" />}
              title="Smart Recommendations"
              description="AI-driven suggestions for courses, resources, and next steps."
              gradient="from-yellow-500/10 via-yellow-500/5 to-transparent"
              glowColor="rgba(234,179,8,0.15)"
            />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:48px_48px] -z-10 opacity-40" />
        <div className="w-full max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-4 py-1.5 rounded-full">The Journey</span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">How It Works</h2>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8 relative max-w-6xl mx-auto"
          >
            {/* Animated Connecting Line */}
            <div className="hidden md:block absolute top-11 left-[12.5%] right-[12.5%] h-px -z-10 overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                style={{ originX: 0 }}
                className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              />
            </div>

            <StepCard
              variants={fadeInUp}
              number="1"
              icon={<Search className="size-6 text-blue-500" />}
              color="blue"
              title="Analyze Skills"
              description="Upload your resume or link GitHub to identify your current skill set."
            />
            <StepCard
              variants={fadeInUp}
              number="2"
              icon={<Map className="size-6 text-purple-500" />}
              color="purple"
              title="Get Roadmap"
              description="AI generates a personalized learning path to reach your dream role."
            />
            <StepCard
              variants={fadeInUp}
              number="3"
              icon={<Trophy className="size-6 text-orange-500" />}
              color="orange"
              title="Track & Improve"
              description="Complete daily challenges and get mentorship to bridge gaps."
            />
            <StepCard
              variants={fadeInUp}
              number="4"
              icon={<Briefcase className="size-6 text-green-500" />}
              color="green"
              title="Get Hired"
              description="Receive job matches tailored to your newly acquired skills."
            />
          </motion.div>
        </div>
      </section>

      {/* Built For Everyone (Roles) */}
      <section className="py-24">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For Everyone</h2>
            <p className="text-muted-foreground">Tailored experiences for every stage of your journey.</p>
          </div>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <RoleCard
              variants={fadeInUp}
              emoji="🎓"
              title="Students"
              features={[
                "Personalized skill roadmaps",
                "Career progress tracking",
                "Industry-aligned learning paths"
              ]}
              color="bg-blue-500/5 hover:bg-blue-500/10 border-blue-200/50"
            />
            <RoleCard
              variants={fadeInUp}
              emoji="🔁"
              title="Career Switchers"
              features={[
                "Missing skill detection",
                "Structured transition planning",
                "Gap analysis tools"
              ]}
              color="bg-purple-500/5 hover:bg-purple-500/10 border-purple-200/50"
            />
            <RoleCard
              variants={fadeInUp}
              emoji="🏫"
              title="Institutions"
              features={[
                "Curriculum alignment",
                "Employability analytics",
                "Student outcome tracking"
              ]}
              color="bg-orange-500/5 hover:bg-orange-500/10 border-orange-200/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24 border-t border-border/50">
        <h2 className="text-2xl font-bold text-center mb-16 text-muted-foreground uppercase tracking-widest text-sm">Powered By Modern Technology</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <TechStack
              category="Frontend"
              items={["React.js", "HTML/CSS", "JavaScript", "Tailwind CSS"]}
            />
            <TechStack
              category="Backend"
              items={["Node.js", "Python FastAPI", "PostgreSQL", "MongoDB"]}
            />
            <TechStack
              category="AI/ML"
              items={["Skill Clustering", "Recommendation Models", "Predictive Analytics"]}
            />
            <TechStack
              category="APIs"
              items={["Job Market APIs", "Analytics APIs", "Real-time Data"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="w-full mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl p-px overflow-hidden shadow-2xl shadow-primary/20"
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-gradient-border" />
            <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-12 md:p-16 text-center text-white overflow-hidden">
              {/* Ambient glows inside CTA */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15)_0%,transparent_70%)] pointer-events-none" />
              <span className="relative z-10 inline-block text-xs font-bold uppercase tracking-widest text-purple-300 mb-4 bg-white/10 px-4 py-1.5 rounded-full">Start Today</span>
              <h2 className="relative z-10 text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Ready to Transform<br /><span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Your Career?</span>
              </h2>
              <p className="relative z-10 text-lg mb-10 text-white/70 max-w-2xl mx-auto">
                Join thousands of learners already building their future with personalized AI guidance.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/signup')}
                className="relative z-10 px-10 py-5 bg-white text-slate-900 rounded-full text-lg font-bold transition-all shadow-xl shadow-white/20 hover:shadow-white/40"
              >
                Start Your Journey Today
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-background">
        <div className="w-full max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur-sm opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <GraduationCap className="size-4 text-white" />
                </div>
              </div>
              <span className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500">The-Setu</span>
            </div>
            {/* Nav Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {[["Home", "/"], ["Login", "/login"], ["Sign Up", "/signup"], ["Docs", "/docs"]].map(([label, path]) => (
                <button key={label} onClick={() => navigate(path)} className="hover:text-foreground transition-colors font-medium">{label}</button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground/70">© 2026 The-Setu · Empowering careers through AI-driven insights · Built with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BentoCard({ icon, title, description, variants, className, gradient, glowColor, tag }: { icon: React.ReactNode; title: string; description: string; variants?: any; className?: string; gradient?: string; glowColor?: string; tag?: string; }) {
  return (
    <motion.div
      variants={variants}
      className={`relative group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 overflow-hidden hover:border-border transition-all hover:shadow-xl flex flex-col ${className || ""}`}
      style={{ boxShadow: `0 0 0 0 ${glowColor}` }}
      whileHover={{ boxShadow: `0 0 60px ${glowColor}` }}
    >
      {/* Background gradient glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient || "from-primary/5 to-transparent"} opacity-60 group-hover:opacity-100 transition-opacity`} />
      {/* Tag */}
      {tag && <span className="relative z-10 self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-md mb-4">{tag}</span>}
      {/* Icon */}
      <div className="relative z-10 mb-4 w-fit p-3 rounded-xl bg-background/70 border border-border/30 group-hover:scale-110 transition-transform duration-300 shadow-sm">{icon}</div>
      <h3 className="relative z-10 text-xl font-bold mb-2">{title}</h3>
      <p className="relative z-10 text-muted-foreground leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}

function RoleCard({ emoji, title, features, variants, color }: { emoji: string; title: string; features: string[]; variants?: any, color?: string }) {
  return (
    <motion.div
      variants={variants}
      whileHover={{ y: -6 }}
      className={`p-8 rounded-2xl border transition-all hover:shadow-xl ${color || "bg-card border-border"}`}
    >
      <div className="text-5xl mb-6">{emoji}</div>
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <ul className="space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-muted-foreground">
            <div className="mt-1 bg-green-500/20 rounded-full p-0.5"><div className="size-1.5 bg-green-500 rounded-full"></div></div>
            <span className="text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function TechStack({ category, items }: { category: string; items: string[] }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card/40 p-6 rounded-2xl border border-border/50 hover:border-border hover:shadow-lg transition-all"
    >
      <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest text-primary">{category}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="px-3 py-1.5 bg-background/60 border border-border/60 text-foreground rounded-lg text-sm font-medium hover:border-primary/40 transition-colors">
            {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

const stepColors: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-500/0 border-blue-500/30 shadow-blue-500/20",
  purple: "from-purple-500/20 to-purple-500/0 border-purple-500/30 shadow-purple-500/20",
  orange: "from-orange-500/20 to-orange-500/0 border-orange-500/30 shadow-orange-500/20",
  green: "from-green-500/20 to-green-500/0 border-green-500/30 shadow-green-500/20",
};

function StepCard({ number, icon, title, description, variants, color }: { number: string; icon: React.ReactNode; title: string; description: string; variants?: any; color?: string }) {
  const c = stepColors[color || "blue"];
  return (
    <motion.div variants={variants} className="relative group z-10">
      <motion.div
        whileHover={{ y: -8, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`bg-gradient-to-b ${c} rounded-2xl border p-6 shadow-lg transition-shadow hover:shadow-xl`}
      >
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div className="size-16 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-border/50 shadow-sm">{icon}</div>
          <div className="absolute -top-2 -right-2 size-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-xs shadow-lg ring-2 ring-background">{number}</div>
        </div>
        <h3 className="text-lg font-bold mb-2 text-center">{title}</h3>
        <p className="text-muted-foreground text-xs text-center leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  );
}

