import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'

type Profile = Database['public']['Tables']['users']['Row']
type UserRole = Database['public']['Tables']['user_roles']['Row']

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) throw profileError
      setProfile(profileData)

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)

      if (rolesError) throw rolesError
      setRoles(rolesData || [])
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName
        }
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: Partial<Pick<Profile, 'name' | 'timezone' | 'notification_pref'>>) => {
    if (!user) return { error: new Error('No user logged in') }
    
    // Only allow updating safe fields
    const safeUpdates = {
      name: updates.name,
      timezone: updates.timezone,
      notification_pref: updates.notification_pref
    }
    
    const { data, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (!error && data) {
      setProfile(data)
    }
    
    return { data, error }
  }

  const hasRole = (role: string) => {
    return roles.some(r => r.role === role)
  }

  return {
    user,
    profile,
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasRole
  }
}