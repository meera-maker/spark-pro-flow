import { useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'

export function useAttendance() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    let attendanceId: string | null = null

    // Record login
    const recordLogin = async () => {
      try {
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            user_id: user.id,
            login_time: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        attendanceId = data.id
      } catch (error) {
        console.error('Failed to record attendance:', error)
      }
    }

    // Record logout
    const recordLogout = async () => {
      if (!attendanceId) return

      try {
        await supabase
          .from('attendance')
          .update({
            logout_time: new Date().toISOString()
          })
          .eq('id', attendanceId)
      } catch (error) {
        console.error('Failed to record logout:', error)
      }
    }

    recordLogin()

    // Record logout on page unload
    window.addEventListener('beforeunload', recordLogout)

    return () => {
      recordLogout()
      window.removeEventListener('beforeunload', recordLogout)
    }
  }, [user])
}
