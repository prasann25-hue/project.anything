import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { DashboardLayout } from './components/DashboardLayout.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { OnboardingPage } from './pages/OnboardingPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { NewInterviewPage } from './pages/NewInterviewPage.jsx';
import { LiveInterviewPage } from './pages/LiveInterviewPage.jsx';
import { InterviewResultPage } from './pages/InterviewResultPage.jsx';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage.jsx';
import { StudyPlanPage } from './pages/StudyPlanPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Onboarding - requires Auth but skips complete onboarding checks */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes inside Dashboard Layout */}
          <Route 
            element={
              <ProtectedRoute requireOnboarding={true}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/interview/new" element={<NewInterviewPage />} />
            <Route path="/interview/:id" element={<LiveInterviewPage />} />
            <Route path="/interview/:id/result" element={<InterviewResultPage />} />
            <Route path="/history" element={<InterviewHistoryPage />} />
            <Route path="/study-plan" element={<StudyPlanPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
