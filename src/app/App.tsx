import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy imports
const LandingPage = lazy(() => import("./components/landing-page").then(module => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("./components/auth-pages").then(module => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("./components/auth-pages").then(module => ({ default: module.SignupPage })));
const DashboardMain = lazy(() => import("./components/dashboard-main").then(module => ({ default: module.DashboardMain })));
const DocumentationPage = lazy(() => import("./components/documentation-page").then(module => ({ default: module.DocumentationPage })));
const MentorDashboard = lazy(() => import("./components/mentor-dashboard").then(module => ({ default: module.MentorDashboard })));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard").then(module => ({ default: module.AdminDashboard })));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage").then(module => ({ default: module.AdminLoginPage })));

import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { ProfileProvider } from "./context/profile-context";

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ProfileProvider>
        <div className="size-full bg-background text-foreground overflow-hidden">
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/dashboard/*" element={<DashboardMain />} />
                <Route path="/mentor-dashboard/*" element={<MentorDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/docs" element={<DocumentationPage />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
        </div>
      </ProfileProvider>
    </ThemeProvider>
  );
}