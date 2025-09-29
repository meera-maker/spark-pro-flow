import { useState } from "react"
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
import { Search, Filter, Plus, Eye, Calendar, User, AlertCircle } from "lucide-react"

// Mock data with workflow integration
const mockProjects = [
  {
    id: "SP001",
    client: "TechCorp Solutions",
    clientEmail: "sarah@techcorp.com",
    creativeType: "Brand Identity",
    deadline: "2024-01-15",
    status: "In Progress" as const,
    workflowStatus: "in-design" as WorkflowStatus,
    currentAssignee: "user-4",
    revisionCount: 2,
    createdAt: "2024-01-01"
  },
  {
    id: "SP002", 
    client: "Green Earth Co.",
    clientEmail: "mike@greenearth.com",
    creativeType: "Website Design",
    deadline: "2024-01-20",
    status: "Lead Review" as const,
    workflowStatus: "assigned-to-design-head" as WorkflowStatus,
    currentAssignee: "user-3",
    revisionCount: 0,
    createdAt: "2024-01-05"
  },
  {
    id: "SP003",
    client: "Urban Cafe",
    clientEmail: "lisa@urbancafe.com", 
    creativeType: "Logo Design",
    deadline: "2024-01-12",
    status: "Client Review" as const,
    workflowStatus: "sent-to-client" as WorkflowStatus,
    currentAssignee: "user-2",
    revisionCount: 1,
    createdAt: "2023-12-28"
  },
  {
    id: "SP004",
    client: "Fitness Pro",
    clientEmail: "james@fitnesspro.com",
    creativeType: "Social Media Assets", 
    deadline: "2024-01-18",
    status: "Approved" as const,
    workflowStatus: "completed" as WorkflowStatus,
    currentAssignee: "user-2",
    revisionCount: 3,
    createdAt: "2024-01-03"
  },
  {
    id: "SP005",
    client: "StartupXYZ",
    clientEmail: "contact@startupxyz.com",
    creativeType: "Logo Design",
    deadline: "2024-01-25",
    status: "New" as const,
    workflowStatus: "intake" as WorkflowStatus,
    currentAssignee: "",
    revisionCount: 0,
    createdAt: "2024-01-08"
  }
]

export function ProjectsDashboard() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { currentUser, getStatusColor, users } = useWorkflow()

  const filteredProjects = mockProjects.filter(project => {
    const matchesStatus = statusFilter === "all" || project.workflowStatus === statusFilter
    const matchesSearch = project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.id.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAssignment = (projectId: string, userId: string, notes?: string) => {
    // In a real app, this would make an API call
    console.log(`Assigning project ${projectId} to user ${userId}`, notes)
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.full_name || 'Unassigned'
  }

  const formatWorkflowStatus = (status: WorkflowStatus) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Role-based dashboard view
  const getMyProjects = () => {
    return mockProjects.filter(project => project.currentAssignee === currentUser.id)
  }

  const getProjectsForMyRole = () => {
    switch (currentUser.role) {
      case 'senior-cs':
        return mockProjects.filter(p => p.workflowStatus === 'intake')
      case 'cs':
        return mockProjects.filter(p => 
          p.workflowStatus === 'assigned-to-cs' || 
          p.workflowStatus === 'sent-to-client' ||
          p.workflowStatus === 'qc-approved'
        )
      case 'design-head':
        return mockProjects.filter(p => p.workflowStatus === 'assigned-to-design-head')
      case 'designer':
        return mockProjects.filter(p => 
          p.workflowStatus === 'assigned-to-designer' || 
          p.workflowStatus === 'in-design' ||
          p.workflowStatus === 'qc-revision-needed'
        )
      case 'qc':
        return mockProjects.filter(p => 
          p.workflowStatus === 'design-complete' || 
          p.workflowStatus === 'in-qc'
        )
      default:
        return mockProjects
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Project Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {currentUser.name} ({currentUser.role.replace('-', ' ')})
          </p>
        </div>
        
        {(currentUser.role === 'senior-cs' || currentUser.role === 'admin') && (
          <Button className="gradient-blue text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
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
                <p className="text-2xl font-bold text-primary">{mockProjects.length}</p>
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
                  {mockProjects.filter(p => getDeadlineUrgency(p.deadline) === "urgent").length}
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
                return (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link 
                        to={`/projects/${project.id}`} 
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {project.id}
                      </Link>
                    </TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>{project.creativeType}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.workflowStatus)}>
                        {formatWorkflowStatus(project.workflowStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {getUserName(project.currentAssignee)}
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
                      <Badge variant={project.revisionCount > 2 ? "destructive" : "secondary"}>
                        {project.revisionCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <AssignmentDialog
                          projectId={project.id}
                          currentStatus={project.workflowStatus}
                          onAssign={(userId, notes) => handleAssignment(project.id, userId, notes)}
                        />
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/projects/${project.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}