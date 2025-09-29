import { useState, useEffect } from 'react'
import { WorkflowStatus, ProjectWorkflow, User, UserRole } from '@/types/workflow'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Profile = Database['public']['Tables']['profiles']['Row']

export const useWorkflow = () => {
  const { profile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const currentUser = profile ? {
    id: profile.id,
    name: profile.full_name || 'User',
    email: profile.email,
    role: profile.role as UserRole
  } : null
  
  const getUsersByRole = (role: UserRole): Profile[] => {
    return users.filter(user => user.role === role)
  }
  
  const getNextAssignees = (currentStatus: WorkflowStatus): Profile[] => {
    switch (currentStatus) {
      case 'intake':
        return getUsersByRole('cs')
      case 'assigned-to-cs':
        return getUsersByRole('design-head')
      case 'assigned-to-design-head':
        return getUsersByRole('designer')
      case 'in-design':
      case 'design-complete':
        return getUsersByRole('qc')
      case 'qc-revision-needed':
        return getUsersByRole('designer')
      case 'qc-approved':
        return getUsersByRole('cs')
      default:
        return []
    }
  }
  
  const canAssign = (status: WorkflowStatus, userRole: UserRole): boolean => {
    switch (userRole) {
      case 'senior-cs':
        return status === 'intake'
      case 'cs':
        return status === 'assigned-to-cs'
      case 'design-head':
        return status === 'assigned-to-design-head'
      case 'qc':
        return status === 'design-complete' || status === 'in-qc'
      case 'admin':
        return true
      default:
        return false
    }
  }
  
  const getStatusColor = (status: WorkflowStatus): string => {
    switch (status) {
      case 'intake':
        return 'bg-gray-100 text-gray-800'
      case 'assigned-to-cs':
      case 'assigned-to-design-head':
        return 'bg-blue-100 text-blue-800'
      case 'assigned-to-designer':
      case 'in-design':
        return 'bg-yellow-100 text-yellow-800'
      case 'design-complete':
        return 'bg-green-100 text-green-800'
      case 'in-qc':
        return 'bg-purple-100 text-purple-800'
      case 'qc-approved':
        return 'bg-green-100 text-green-800'
      case 'qc-revision-needed':
      case 'revision-requested':
        return 'bg-red-100 text-red-800'
      case 'sent-to-client':
        return 'bg-blue-100 text-blue-800'
      case 'client-approved':
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return {
    currentUser,
    users,
    getUsersByRole,
    getNextAssignees,
    canAssign,
    getStatusColor
  }
}