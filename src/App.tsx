import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RecruiterLayout } from '@/layouts/RecruiterLayout';
import { CandidateLayout } from '@/layouts/CandidateLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Lazy-loaded pages for route-level code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Public Pages
const PublicJobs = lazy(() => import('./pages/public/PublicJobs'));
const PublicJobDetail = lazy(() => import('./pages/public/PublicJobDetail'));
const About = lazy(() => import('./pages/public/About'));
const Pricing = lazy(() => import('./pages/public/Pricing'));
const Privacy = lazy(() => import('./pages/public/Privacy'));
const Terms = lazy(() => import('./pages/public/Terms'));
const CareerGuides = lazy(() => import('./pages/public/CareerGuides'));
const AiPrep = lazy(() => import('./pages/public/AiPrep'));

const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const RecruiterJobs = lazy(() => import('./pages/recruiter/RecruiterJobs'));
const CreateJob = lazy(() => import('./pages/recruiter/CreateJob'));
const JobDetail = lazy(() => import('./pages/recruiter/JobDetail'));
const RecruiterCandidates = lazy(() => import('./pages/recruiter/RecruiterCandidates'));
const CandidateProfile = lazy(() => import('./pages/recruiter/CandidateProfile'));
const RecruiterInterviews = lazy(() => import('./pages/recruiter/RecruiterInterviews'));
const RecruiterScorecards = lazy(() => import('./pages/recruiter/RecruiterScorecards'));
const RecruiterOffers = lazy(() => import('./pages/recruiter/RecruiterOffers'));
const RecruiterNotifications = lazy(() => import('./pages/recruiter/RecruiterNotifications'));
const RecruiterSettings = lazy(() => import('./pages/recruiter/RecruiterSettings'));

const CandidateDashboard = lazy(() => import('./pages/candidate/CandidateDashboard'));
const CandidateProfilePage = lazy(() => import('./pages/candidate/CandidateProfilePage'));
const CandidateJobs = lazy(() => import('./pages/candidate/CandidateJobs'));
const CandidateJobDetail = lazy(() => import('./pages/candidate/CandidateJobDetail'));
const CandidateApplications = lazy(() => import('./pages/candidate/CandidateApplications'));
const CandidateInterview = lazy(() => import('./pages/candidate/CandidateInterview'));
const CandidateOffer = lazy(() => import('./pages/candidate/CandidateOffer'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTenants = lazy(() => import('./pages/admin/AdminTenants'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-accent"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '8px', fontSize: '13px' } }} />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              <Route element={<PublicLayout />}>
                <Route path="/jobs" element={<PublicJobs />} />
                <Route path="/jobs/:id" element={<PublicJobDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/guides" element={<CareerGuides />} />
              </Route>

              <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<RecruiterDashboard />} />
                <Route path="jobs" element={<RecruiterJobs />} />
                <Route path="jobs/new" element={<CreateJob />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="candidates" element={<RecruiterCandidates />} />
                <Route path="candidates/:id" element={<CandidateProfile />} />
                <Route path="interviews" element={<RecruiterInterviews />} />
                <Route path="scorecards" element={<RecruiterScorecards />} />
                <Route path="offers" element={<RecruiterOffers />} />
                <Route path="notifications" element={<RecruiterNotifications />} />
                <Route path="settings" element={<RecruiterSettings />} />
              </Route>

              <Route path="/candidate" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<CandidateDashboard />} />
                <Route path="profile" element={<CandidateProfilePage />} />
                <Route path="jobs" element={<CandidateJobs />} />
                <Route path="jobs/:id" element={<CandidateJobDetail />} />
                <Route path="applications" element={<CandidateApplications />} />
                <Route path="interview/:id" element={<CandidateInterview />} />
                <Route path="offers/:id" element={<CandidateOffer />} />
              </Route>

              <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="tenants" element={<AdminTenants />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
