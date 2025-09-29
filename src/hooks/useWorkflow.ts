import { useState, useEffect } from 'react'
import { WorkflowStatus, ProjectWorkflow, User, UserRole } from '@/types/workflow'

// Mock current user - in real app, this would come from auth
const getCurrentUser = (): User => ({
  id: 'user-1',
  name: 'John Doe',
  email: 'john@sparkpro.com',
  role: 'senior-cs' // Change this to test different roles
})

// Mock users data
const mockUsers: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john@sparkpro.com', role: 'senior-cs' },
  { id: 'user-2', name: 'Sarah Smith', email: 'sarah@sparkpro.com', role: 'cs' },
  { id: 'user-3', name: 'Mike Johnson', email: 'mike@sparkpro.com', role: 'design-head' },
  { id: 'user-4', name: 'Lisa Chen', email: 'lisa@sparkpro.com', role: 'designer' },
  { id: 'user-5', name: 'David Brown', email: 'david@sparkpro.com', role: 'designer' },
  { id: 'user-6', name: 'Emma Wilson', email: 'emma@sparkpro.com', role: 'qc' },
  { id: 'user-7', name: 'Admin User', email: 'admin@sparkpro.com', role: 'admin' }
]

export const useWorkflow = () => {
  const [currentUser] = useState<User>(getCurrentUser)
  const [users] = useState<User[]>(mockUsers)
  
  const getUsersByRole = (role: UserRole): User[] => {
    return users.filter(user => user.role === role)
  }
  
  const getNextAssignees = (currentStatus: WorkflowStatus): User[] => {
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