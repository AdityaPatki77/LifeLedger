import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/Spinner'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiresOnboarding?: boolean
}

export function ProtectedRoute({ children, requiresOnboarding = false }: ProtectedRouteProps) {
    const { session, profile, loading } = useAuth()

    if (loading) return <PageLoader />
    if (!session) return <Navigate to="/login" replace />
    if (requiresOnboarding && profile && !profile.age_range) return <Navigate to="/onboarding" replace />

    return <>{children}</>
}
