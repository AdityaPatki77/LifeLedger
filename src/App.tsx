import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppLayout } from './layouts/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PageLoader } from './components/ui/Spinner'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { SignUpPage } from './pages/auth/SignUpPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { OnboardingPage } from './pages/onboarding/OnboardingPage'
import { DashboardPage } from './pages/DashboardPage'
import { LogDecisionPage } from './pages/LogDecisionPage'
import { DecisionDetailPage } from './pages/DecisionDetailPage'
import { ReflectionPage } from './pages/ReflectionPage'
import { JournalPage } from './pages/JournalPage'
import { PatternsPage } from './pages/PatternsPage'
import { MoodTrackerPage } from './pages/MoodTrackerPage'
import { PricingPage } from './pages/PricingPage'
import { SettingsPage } from './pages/SettingsPage'
import { CalendarPage } from './pages/CalendarPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, retry: 1 },
  },
})

function RootRedirect() {
  const { session, loading } = useAuth()
  if (loading) return <PageLoader />
  return session ? <Navigate to="/dashboard" replace /> : <LandingPage />
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingLandingWrapper />} />

              {/* Onboarding */}
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              } />

              {/* App (authenticated, with layout) */}
              <Route element={
                <ProtectedRoute requiresOnboarding>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/log" element={<LogDecisionPage />} />
                <Route path="/decision/:id" element={<DecisionDetailPage />} />
                <Route path="/decision/:id/edit" element={<LogDecisionPage />} />
                <Route path="/reflect/:decisionId/:type" element={<ReflectionPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/patterns" element={<PatternsPage />} />
                <Route path="/mood" element={<MoodTrackerPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                {/* Pricing also accessible inside app */}
                <Route path="/app/pricing" element={<PricingPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

// Pricing accessible from both logged-in and landing contexts
function PricingLandingWrapper() {
  const { session } = useAuth()
  if (session) return <Navigate to="/app/pricing" replace />
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <nav style={{ padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'var(--text-primary)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>LifeLedger</span>
        </a>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/login" className="btn btn-secondary btn-sm">Sign In</a>
          <a href="/signup" className="btn btn-primary btn-sm">Start Free</a>
        </div>
      </nav>
      <PricingPage />
    </div>
  )
}
