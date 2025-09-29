import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { SupabaseConnectionError } from '@/components/SupabaseConnectionError'

// Check if Supabase is properly connected
const isSupabaseConnected = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // First check if Supabase is connected
  if (!isSupabaseConnected()) {
    return <SupabaseConnectionError />
  }

  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return <>{children}</>
}