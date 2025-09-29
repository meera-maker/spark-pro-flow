export type UserRole = 'Admin' | 'Lead' | 'Designer' | 'QC' | 'CS'

export type WorkflowStatus = 
  | 'intake' 
  | 'assigned-to-cs'
  | 'assigned-to-design-head'
  | 'assigned-to-designer'
  | 'in-design'
  | 'design-complete'
  | 'in-qc'
  | 'qc-approved'
  | 'qc-revision-needed'
  | 'sent-to-client'
  | 'client-approved'
  | 'revision-requested'
  | 'completed'

export interface WorkflowStep {
  id: string
  status: WorkflowStatus
  assignedTo: string
  assignedBy: string
  timestamp: Date
  notes?: string
}

export interface ProjectWorkflow {
  projectId: string
  currentStatus: WorkflowStatus
  currentAssignee: string
  steps: WorkflowStep[]
  notifications: Notification[]
}

export interface Notification {
  type: 'assignment' | 'revision' | 'approval' | 'completion'
  message: string
  timestamp: Date
  read: boolean
  userId: string
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
}