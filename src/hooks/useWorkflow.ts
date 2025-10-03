import { useState, useEffect } from 'react'
import { WorkflowStatus, ProjectWorkflow, User, UserRole } from '@/types/workflow'
import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { useAuth } from '@/hooks/useAuth'

type Profile = Database['public']['Tables']['users']['Row']
type UserRoleRecord = Database['public']['Tables']['user_roles']['Row']

export const useWorkflow = () => {
  const { profile, roles } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [userRoles, setUserRoles] = useState<UserRoleRecord[]>([])

  useEffect(() => {
    fetchUsers()
    fetchUserRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchUserRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')

      if (error) throw error
      setUserRoles(data || [])
    } catch (error) {
      console.error('Error fetching user roles:', error)
    }
  }

  // Get primary role for current user (first role found)
  const currentUserRole = roles && roles.length > 0 ? roles[0].role as UserRole : null
  
  const currentUser = profile && currentUserRole ? {
    id: profile.id,
    name: profile.name || 'User',
    email: profile.email,
    role: currentUserRole
  } : null
  
  const getUsersByRole = (role: UserRole): Profile[] => {
    // Find user IDs that have this role
    const userIdsWithRole = userRoles
      .filter(ur => ur.role === role)
      .map(ur => ur.user_id)
    
    // Return users that have this role
    return users.filter(user => userIdsWithRole.includes(user.id))
  }
  
  const getNextAssignees = (currentStatus: WorkflowStatus): Profile[] => {
    switch (currentStatus) {
      case 'intake':
        return getUsersByRole('Lead')
      case 'assigned-to-cs':
        return getUsersByRole('Lead')
      case 'assigned-to-design-head':
        return getUsersByRole('Designer')
      case 'in-design':
      case 'design-complete':
        return getUsersByRole('QC')
      case 'qc-revision-needed':
        return getUsersByRole('Designer')
      case 'qc-approved':
        return getUsersByRole('Lead')
      default:
        return []
    }
  }
  
  const canAssign = (status: WorkflowStatus, userRole: UserRole): boolean => {
    switch (userRole) {
      case 'Lead':
        return status === 'intake' || status === 'assigned-to-cs' || status === 'qc-approved'
      case 'Designer':
        return false // Designers don't assign, they complete work
      case 'QC':
        return status === 'design-complete' || status === 'in-qc'
      case 'Admin':
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