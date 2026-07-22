import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewInterviewPage } from './pages/NewInterviewPage';
import { LiveInterviewPage } from './pages/LiveInterviewPage';
import { InterviewResultPage } from './pages/InterviewResultPage';
import { InterviewHistoryPage } from './pages/InterviewHistoryPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { ProfilePage } from './pages/ProfilePage';

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
