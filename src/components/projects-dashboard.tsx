import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssignmentDialog } from "@/components/workflow/assignment-dialog"
import { useWorkflow } from "@/hooks/useWorkflow"
import { WorkflowStatus } from "@/types/workflow"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, Plus, Eye, Calendar, User, AlertCircle, Bell, Edit } from "lucide-react"
import { Database } from "@/integrations/supabase/types"
import { QuickAddProjectDialog } from "@/components/quick-add-project-dialog"

type Project = Database['public']['Tables']['projects']['Row']

export function ProjectsDashboard() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser, getStatusColor, users } = useWorkflow()
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle loading state
  if (!currentUser || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Map database status to workflow status
  const getWorkflowStatus = (project: Project): WorkflowStatus => {
    switch (project.status) {
      case 'New': return 'intake'
      case 'In Progress': return 'in-design'
      case 'Lead Review': return 'assigned-to-design-head'
      case 'QC Review': return 'in-qc'
      case 'Client Review': return 'sent-to-client'
      case 'Completed': return 'completed'
      default: return 'intake'
    }
  }

  const filteredProjects = projects.filter(project => {
    const workflowStatus = getWorkflowStatus(project)
    const matchesStatus = statusFilter === "all" || workflowStatus === statusFilter
    const matchesSearch = project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project_code?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getDeadlineUrgency = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return "overdue"
    if (diffDays <= 2) return "urgent" 
    if (diffDays <= 7) return "soon"
    return "normal"
  }

  const handleAssignment = async (projectId: string, userId: string, notes?: string) => {
    try {
      // Update project assignment in database
      const { error } = await supabase
        .from('projects')
        .update({ 
          designer_id: userId,
          status: 'In Progress' 
        })
        .eq('project_code', projectId)

      if (error) throw error

      // Create notification for assigned user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'assignment',
          title: 'New Project Assigned',
          message: `You have been assigned to project ${projectId}`,
          payload: { project_id: projectId, notes }
        })

      toast({
        title: 'Success',
        description: 'Project assigned successfully'
      })

      fetchProjects() // Refresh project list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to assign project',
        variant: 'destructive'
      })
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unassigned'
  }

  const formatWorkflowStatus = (status: WorkflowStatus) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Role-based dashboard view
  const getMyProjects = () => {
    return projects.filter(project => 
      project.designer_id === currentUser.id || 
      project.lead_id === currentUser.id ||
      project.coordinator_id === currentUser.id
    )
  }

  const getProjectsForMyRole = () => {
    switch (currentUser.role) {
      case 'Admin':
        return projects // Admins see all projects
      case 'Lead':
        return projects.filter(p => 
          p.status === 'New' || 
          p.status === 'Client Review' ||
          p.lead_id === currentUser.id
        )
      case 'Designer':
        return projects.filter(p => 
          p.designer_id === currentUser.id ||
          p.status === 'In Progress'
        )
      default:
        return projects
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Project Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {currentUser.name} ({currentUser.role})
        </p>
        </div>
        
        {(currentUser.role === 'Admin' || currentUser.role === 'Lead') && (
          <div className="flex gap-2">
            <QuickAddProjectDialog onProjectAdded={fetchProjects} />
            <Link to="/intake">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Full Intake Form
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Role-based Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Projects</p>
                <p className="text-2xl font-bold text-primary">{getMyProjects().length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Awaiting My Action</p>
                <p className="text-2xl font-bold text-primary">
                  {getProjectsForMyRole().length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-primary">{projects.length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Urgent Deadlines</p>
                <p className="text-2xl font-bold text-red-600">
                  {projects.filter(p => getDeadlineUrgency(p.deadline) === "urgent").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by workflow status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="intake">Intake</SelectItem>
                <SelectItem value="assigned-to-cs">Assigned to CS</SelectItem>
                <SelectItem value="assigned-to-design-head">Assigned to Design Head</SelectItem>
                <SelectItem value="assigned-to-designer">Assigned to Designer</SelectItem>
                <SelectItem value="in-design">In Design</SelectItem>
                <SelectItem value="design-complete">Design Complete</SelectItem>
                <SelectItem value="in-qc">In QC</SelectItem>
                <SelectItem value="qc-approved">QC Approved</SelectItem>
                <SelectItem value="sent-to-client">Sent to Client</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Client Email</TableHead>
                <TableHead>Creative Type</TableHead>
                <TableHead>Workflow Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Revisions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const urgency = getDeadlineUrgency(project.deadline)
                const workflowStatus = getWorkflowStatus(project)
                const assignedUser = project.designer_id || project.lead_id || project.coordinator_id
                return (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link 
                        to={`/projects/${project.project_code}`} 
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {project.project_code}
                      </Link>
                    </TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{project.client_email}</TableCell>
                    <TableCell>{project.creative_type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(workflowStatus)}>
                        {formatWorkflowStatus(workflowStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {getUserName(assignedUser || '')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={urgency === "urgent" ? "text-red-600 font-medium" : urgency === "soon" ? "text-orange-600" : ""}>
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        {urgency === "urgent" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.revision_count && project.revision_count > 2 ? "destructive" : "secondary"}>
                        {project.revision_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <AssignmentDialog
                          projectId={project.project_code}
                          currentStatus={workflowStatus}
                          onAssign={(userId, notes) => handleAssignment(project.project_code, userId, notes)}
                        />
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/projects/${project.project_code}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/projects/${project.project_code}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No projects found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}