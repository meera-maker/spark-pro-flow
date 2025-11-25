import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { WorkflowTimeline } from "@/components/workflow/workflow-timeline"
import { StatusActions } from "@/components/workflow/status-actions"
import { NotificationsPanel } from "@/components/workflow/notifications-panel"
import { ProjectStages, ProjectStage } from "@/components/project-stages"
import { AssignmentHistory, AssignmentRecord } from "@/components/assignment-history"
import { RevisionDetailView, Revision } from "@/components/revision-detail-view"
import { TimeTrackingPanel } from "@/components/time-tracking-panel"
import { useWorkflow } from "@/hooks/useWorkflow"
import { WorkflowStatus, WorkflowStep, Notification } from "@/types/workflow"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  Send, 
  MessageCircle,
  ExternalLink,
  Clock,
  Download
} from "lucide-react"

// Mock workflow steps
const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: "step-1",
    status: "intake",
    assignedTo: "user-1",
    assignedBy: "user-1",
    timestamp: new Date("2024-01-01T09:00:00"),
    notes: "New project received from client intake form"
  },
  {
    id: "step-2", 
    status: "assigned-to-cs",
    assignedTo: "user-2",
    assignedBy: "user-1",
    timestamp: new Date("2024-01-01T10:15:00"),
    notes: "Assigned to CS team for initial client communication"
  },
  {
    id: "step-3",
    status: "assigned-to-design-head", 
    assignedTo: "user-3",
    assignedBy: "user-2",
    timestamp: new Date("2024-01-02T14:30:00"),
    notes: "Client brief confirmed, ready for design assignment"
  },
  {
    id: "step-4",
    status: "assigned-to-designer",
    assignedTo: "user-4", 
    assignedBy: "user-3",
    timestamp: new Date("2024-01-02T16:45:00"),
    notes: "Assigned to Maria Rodriguez for logo design work"
  },
  {
    id: "step-5",
    status: "in-design",
    assignedTo: "user-4",
    assignedBy: "user-4", 
    timestamp: new Date("2024-01-03T09:00:00"),
    notes: "Started working on initial logo concepts"
  }
]

// Mock project data with workflow
const mockProject = {
  id: "SP001",
  client: "TechCorp Solutions", 
  clientEmail: "sarah@techcorp.com",
  creativeType: "Brand Identity",
  deadline: "2024-01-15",
  workflowStatus: "in-design" as WorkflowStatus,
  currentAssignee: "user-4",
  revisionCount: 2,
  brief: "We need a complete brand identity for our new fintech startup. The brand should convey trust, innovation, and accessibility. We're targeting young professionals aged 25-40 who are tech-savvy but want simplified financial tools. The aesthetic should be modern, clean, and professional while remaining approachable.",
  referenceLinks: [
    "https://stripe.com/brand",
    "https://monzo.com/press/brand-guidelines",
    "https://revolut.com/brand"
  ],
  driveFolderUrl: "https://drive.google.com/drive/folders/1abc123...",
  createdAt: "2024-01-01"
}

const mockRevisions: Revision[] = [
  {
    id: "rev-1",
    version: "v1.0",
    uploadedBy: "Maria Rodriguez",
    uploadedById: "user-4",
    timestamp: new Date("2024-01-08T10:30:00"),
    type: "design",
    notes: "Initial brand concepts with 3 logo variations. Exploring different styles - minimalist, bold, and modern approaches.",
    fileUrl: "https://example.com/file1.pdf",
    fileType: "pdf",
    status: "approved",
    approvedBy: "Alex Chen",
    feedback: "Great start! Option 2 looks promising."
  },
  {
    id: "rev-2",
    version: "v1.1",
    uploadedBy: "Alex Chen",
    uploadedById: "user-3",
    timestamp: new Date("2024-01-09T14:15:00"),
    type: "review",
    notes: "Client feedback: Prefer option 2, but make the icon more prominent. They also want to see it in different color variations.",
    status: "approved"
  },
  {
    id: "rev-3",
    version: "v2.0",
    uploadedBy: "Maria Rodriguez",
    uploadedById: "user-4",
    timestamp: new Date("2024-01-10T11:45:00"),
    type: "design",
    notes: "Updated logo with larger icon, added color palette and typography guidelines. Included usage examples.",
    fileUrl: "https://example.com/file2.pdf",
    fileType: "pdf",
    status: "pending"
  },
  {
    id: "rev-4",
    version: "v2.1",
    uploadedBy: "Client",
    uploadedById: "client-1",
    timestamp: new Date("2024-01-11T09:20:00"),
    type: "client-feedback",
    notes: "Love the direction! Can we see it in navy blue instead of the current color? Also curious about how it looks on dark backgrounds.",
    status: "approved"
  }
]

const mockAssignmentHistory: AssignmentRecord[] = [
  {
    id: "assign-1",
    fromUser: "System",
    toUser: "Alex Chen",
    timestamp: new Date("2024-01-01T09:00:00"),
    type: "assignment",
    role: "Lead",
    notes: "Initial project assignment from client intake"
  },
  {
    id: "assign-2",
    fromUser: "Alex Chen",
    toUser: "Maria Rodriguez",
    timestamp: new Date("2024-01-02T16:45:00"),
    type: "transfer",
    role: "Designer",
    notes: "Transferring to designer for logo work"
  },
  {
    id: "assign-3",
    fromUser: "Maria Rodriguez",
    toUser: "Sarah Johnson",
    timestamp: new Date("2024-01-09T10:00:00"),
    type: "transfer",
    role: "QC",
    notes: "Ready for quality check"
  }
]

// Mock notifications
const mockNotifications: Notification[] = [
  {
    type: "assignment",
    message: "You have been assigned to project SP001 - TechCorp Solutions",
    timestamp: new Date("2024-01-02T16:45:00"),
    read: false,
    userId: "user-4"
  },
  {
    type: "revision",
    message: "Client has requested revisions for project SP001",
    timestamp: new Date("2024-01-04T11:20:00"), 
    read: true,
    userId: "user-4"
  }
]

type Project = Database['public']['Tables']['projects']['Row']

export function ProjectDetail() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [revisionNote, setRevisionNote] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentStage, setCurrentStage] = useState<ProjectStage>('design')
  const [revisions, setRevisions] = useState<Revision[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentRecord[]>([])
  const { currentUser, getStatusColor, users } = useWorkflow()
  const { toast } = useToast()

  useEffect(() => {
    if (projectId) {
      fetchProject()
      fetchRevisions()
      fetchWorkflowLog()
      fetchNotifications()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_code', projectId)
        .single()

      if (error) throw error
      setProject(data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load project details',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRevisions = async () => {
    try {
      const { data: project_data } = await supabase
        .from('projects')
        .select('id')
        .eq('project_code', projectId)
        .single()

      if (!project_data) return

      const { data, error } = await supabase
        .from('revisions')
        .select('*')
        .eq('project_id', project_data.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch users for name mapping
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')

      const userMap = new Map(usersData?.map(u => [u.id, u.name]) || [])

      const transformedRevisions: Revision[] = (data || []).map(rev => ({
        id: rev.id,
        version: `v${rev.version_no}`,
        uploadedBy: userMap.get(rev.uploaded_by || '') || 'Unknown',
        uploadedById: rev.uploaded_by || '',
        timestamp: new Date(rev.created_at || ''),
        type: 'design' as const,
        notes: rev.note || '',
        fileUrl: rev.file_url,
        fileType: 'pdf' as const,
        status: rev.status === 'Approved' ? 'approved' : rev.status === 'Rejected' ? 'rejected' : 'pending'
      }))

      setRevisions(transformedRevisions)
    } catch (error: any) {
      console.error('Error fetching revisions:', error)
    }
  }

  const fetchWorkflowLog = async () => {
    try {
      const { data: project_data } = await supabase
        .from('projects')
        .select('id')
        .eq('project_code', projectId)
        .single()

      if (!project_data) return

      const { data, error } = await supabase
        .from('project_workflow_log')
        .select('*')
        .eq('project_id', project_data.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch all users for name mapping
      const { data: usersData } = await supabase
        .from('users')
        .select('id, name')

      const userMap = new Map(usersData?.map(u => [u.id, u.name]) || [])

      const transformedSteps: WorkflowStep[] = (data || []).map(log => ({
        id: log.id,
        status: 'in-design' as WorkflowStatus,
        assignedTo: log.to_user_id || '',
        assignedBy: log.from_user_id || '',
        timestamp: new Date(log.created_at || ''),
        notes: log.notes || ''
      }))

      setWorkflowSteps(transformedSteps)

      const transformedAssignments: AssignmentRecord[] = (data || []).map(log => ({
        id: log.id,
        fromUser: userMap.get(log.from_user_id || '') || 'System',
        toUser: userMap.get(log.to_user_id || '') || 'Unknown',
        timestamp: new Date(log.created_at || ''),
        type: log.action.includes('transfer') ? 'transfer' : 'assignment',
        role: log.to_role || 'Designer',
        notes: log.notes || ''
      }))

      setAssignmentHistory(transformedAssignments)
    } catch (error: any) {
      console.error('Error fetching workflow log:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const transformedNotifications: Notification[] = (data || []).map(notif => ({
        type: notif.type as any,
        message: notif.message,
        timestamp: new Date(notif.created_at || ''),
        read: notif.read_flag || false,
        userId: notif.user_id || ''
      }))

      setNotifications(transformedNotifications)
    } catch (error: any) {
      console.error('Error fetching notifications:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading project details...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Project not found</div>
      </div>
    )
  }

  const handleStatusChange = async (newStatus: WorkflowStatus, assignedTo?: string, notes?: string) => {
    try {
      const statusMap: Record<WorkflowStatus, string> = {
        'intake': 'New',
        'assigned-to-cs': 'New',
        'assigned-to-design-head': 'Lead Review',
        'assigned-to-designer': 'In Progress',
        'in-design': 'In Progress',
        'design-complete': 'In Progress',
        'in-qc': 'QC Review',
        'qc-approved': 'QC Review',
        'qc-revision-needed': 'In Progress',
        'sent-to-client': 'Client Review',
        'client-approved': 'Client Review',
        'revision-requested': 'In Progress',
        'completed': 'Completed'
      }
      
      const updateData: any = { status: statusMap[newStatus] }
      
      // If assigning to someone, update the appropriate field
      if (assignedTo) {
        if (newStatus.includes('designer') || newStatus === 'in-design') {
          updateData.designer_id = assignedTo
        } else if (newStatus.includes('design-head') || newStatus === 'assigned-to-design-head') {
          updateData.lead_id = assignedTo
        }
      }
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('project_code', projectId)
      
      if (error) throw error
      
      // Log workflow change
      if (project) {
        await supabase
          .from('project_workflow_log')
          .insert({
            project_id: project.id,
            action: 'status_change',
            from_user_id: currentUser?.id,
            to_user_id: assignedTo,
            notes: notes || `Status changed to ${statusMap[newStatus]}`
          })
      }
      
      toast({
        title: 'Success',
        description: 'Project status updated'
      })
      
      fetchProject()
      fetchWorkflowLog()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive'
      })
    }
  }

  const handleCompleteProject = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'Completed' })
        .eq('project_code', projectId)
      
      if (error) throw error
      
      // Log workflow change
      if (project) {
        await supabase
          .from('project_workflow_log')
          .insert({
            project_id: project.id,
            action: 'completed',
            from_user_id: currentUser?.id,
            notes: 'Project marked as completed'
          })
      }
      
      toast({
        title: 'Success',
        description: 'Project marked as completed'
      })
      
      fetchProject()
      fetchWorkflowLog()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to complete project',
        variant: 'destructive'
      })
    }
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.message === notificationId ? { ...n, read: true } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleStageChange = (stage: ProjectStage) => {
    setCurrentStage(stage)
    toast({
      title: "Stage Updated",
      description: `Project moved to ${stage} stage`
    })
  }

  const handleAddRevision = (notes: string, file?: File) => {
    const newRevision: Revision = {
      id: `rev-${Date.now()}`,
      version: `v${revisions.length + 1}.0`,
      uploadedBy: currentUser?.name || 'Current User',
      uploadedById: currentUser?.id || 'user-current',
      timestamp: new Date(),
      type: 'design',
      notes,
      status: 'pending'
    }
    setRevisions([...revisions, newRevision])
    toast({
      title: "Revision Added",
      description: "New revision has been uploaded successfully"
    })
  }

  const handleApproveRevision = (revisionId: string, feedback: string) => {
    setRevisions(prev => prev.map(r => 
      r.id === revisionId 
        ? { ...r, status: 'approved' as const, feedback, approvedBy: currentUser?.name || 'User' }
        : r
    ))
    toast({
      title: "Revision Approved",
      description: "Revision has been approved"
    })
  }

  const handleRejectRevision = (revisionId: string, feedback: string) => {
    setRevisions(prev => prev.map(r => 
      r.id === revisionId 
        ? { ...r, status: 'rejected' as const, feedback, approvedBy: currentUser?.name || 'User' }
        : r
    ))
    toast({
      title: "Changes Requested",
      description: "Revision feedback has been sent"
    })
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }

  const formatWorkflowStatus = (status: WorkflowStatus) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-primary">{project.project_code}</h1>
            <Badge className={getStatusColor(project.status === 'New' ? 'intake' : 'in-design')}>
              {project.status}
            </Badge>
          </div>
          <p className="text-xl text-muted-foreground">{project.client_name}</p>
          <p className="text-sm text-muted-foreground">{project.creative_type}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Currently assigned to: <span className="font-medium">{getUserName(project.designer_id || '')}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          {project.status !== 'Completed' && (
            <Button 
              onClick={handleCompleteProject}
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Mark as Complete
            </Button>
          )}
          <StatusActions
            projectId={project.project_code}
            currentStatus={project.status === 'New' ? 'intake' : 'in-design'}
            currentAssignee={project.designer_id || ''}
            onStatusChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Project Stages */}
      <ProjectStages currentStage={currentStage} onStageClick={handleStageChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" aria-label="Project brief document icon" />
                Project Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{project.brief}</p>
              
              {project.drive_folder_url && (
                <div className="mt-4">
                  <a 
                    href={project.drive_folder_url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Drive Folder
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflow Timeline */}
          <WorkflowTimeline steps={workflowSteps} />

          {/* Assignment & Transfer History */}
          <AssignmentHistory assignments={assignmentHistory} />

          {/* Detailed Revision History */}
          <RevisionDetailView
            revisions={revisions}
            onAddRevision={handleAddRevision}
            onApprove={handleApproveRevision}
            onReject={handleRejectRevision}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Time Tracking */}
          <TimeTrackingPanel projectId={project.id} projectCode={project.project_code} />

          {/* Notifications */}
          <NotificationsPanel />

          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-label="Calendar icon" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-red-600 font-medium">
                    {new Date(project.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" aria-label="User icon" />
                <div>
                  <p className="text-sm font-medium">Assigned To</p>
                  <p className="text-sm text-muted-foreground">{getUserName(project.designer_id || '')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" aria-label="Message icon" />
                <div>
                  <p className="text-sm font-medium">Revisions</p>
                  <Badge variant={(project.revision_count || 0) > 2 ? "destructive" : "secondary"}>
                    {project.revision_count || 0}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{project.client_name}</p>
                  <p className="text-sm text-muted-foreground">{project.client_email}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                Upload New Version
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Request Revision
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                Send Preview Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}