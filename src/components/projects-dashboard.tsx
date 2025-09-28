import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ProjectStatusBadge } from "./project-status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Plus, Eye, Calendar, User, AlertCircle } from "lucide-react"

// Mock data - in real app this would come from Supabase
const mockProjects = [
  {
    id: "SP001",
    client: "TechCorp Solutions",
    clientEmail: "sarah@techcorp.com",
    creativeType: "Brand Identity",
    deadline: "2024-01-15",
    lead: "Alex Chen",
    designer: "Maria Rodriguez",
    status: "In Progress" as const,
    revisionCount: 2,
    createdAt: "2024-01-01"
  },
  {
    id: "SP002", 
    client: "Green Earth Co.",
    clientEmail: "mike@greenearth.com",
    creativeType: "Website Design",
    deadline: "2024-01-20",
    lead: "Sam Wilson",
    designer: "Unassigned",
    status: "Lead Review" as const,
    revisionCount: 0,
    createdAt: "2024-01-05"
  },
  {
    id: "SP003",
    client: "Urban Cafe",
    clientEmail: "lisa@urbancafe.com", 
    creativeType: "Logo Design",
    deadline: "2024-01-12",
    lead: "Alex Chen",
    designer: "David Kim",
    status: "Client Review" as const,
    revisionCount: 1,
    createdAt: "2023-12-28"
  },
  {
    id: "SP004",
    client: "Fitness Pro",
    clientEmail: "james@fitnesspro.com",
    creativeType: "Social Media Assets", 
    deadline: "2024-01-18",
    lead: "Sam Wilson",
    designer: "Maria Rodriguez",
    status: "Approved" as const,
    revisionCount: 3,
    createdAt: "2024-01-03"
  }
]

export function ProjectsDashboard() {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProjects = mockProjects.filter(project => {
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
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

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Project Dashboard</h1>
          <p className="text-muted-foreground">Manage all creative projects in one place</p>
        </div>
        
        <Button className="gradient-blue text-white hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold text-primary">{mockProjects.length}</p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-primary">
                  {mockProjects.filter(p => p.status === "In Progress").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <User className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-primary">
                  {mockProjects.filter(p => p.status === "Client Review" || p.status === "Lead Review").length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
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
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Lead Review">Lead Review</SelectItem>
                <SelectItem value="Client Review">Client Review</SelectItem>
                <SelectItem value="Revision">Revision</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
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
                <TableHead>Deadline</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revisions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => {
                const urgency = getDeadlineUrgency(project.deadline)
                return (
                  <TableRow key={project.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-primary">{project.id}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell>{project.creativeType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={urgency === "urgent" ? "text-red-600 font-medium" : urgency === "soon" ? "text-orange-600" : ""}>
                          {new Date(project.deadline).toLocaleDateString()}
                        </span>
                        {urgency === "urgent" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    </TableCell>
                    <TableCell>{project.lead}</TableCell>
                    <TableCell>
                      {project.designer === "Unassigned" ? (
                        <Badge variant="outline" className="text-blue border-blue">
                          Unassigned
                        </Badge>
                      ) : (
                        project.designer
                      )}
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.revisionCount > 2 ? "destructive" : "secondary"}>
                        {project.revisionCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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