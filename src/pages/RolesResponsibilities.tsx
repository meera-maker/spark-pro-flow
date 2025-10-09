import { useEffect, useState } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Target,
  TrendingUp,
  Clock
} from "lucide-react"

interface RoleData {
  role: string
  title: string
  description: string
  responsibilities: string[]
  permissions: Record<string, boolean>
  workflow_actions: string[]
}

interface WorkflowStats {
  role: string
  activeProjects: number
  completedThisWeek: number
  avgResponseTime: string
  pendingActions: number
}

const RolesResponsibilities = () => {
  const [roles, setRoles] = useState<RoleData[]>([])
  const [workflowStats, setWorkflowStats] = useState<WorkflowStats[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRolesAndStats()
  }, [])

  const fetchRolesAndStats = async () => {
    try {
      // Fetch role responsibilities
      const { data: rolesData, error: rolesError } = await supabase
        .from('role_responsibilities')
        .select('*')
        .order('role')

      if (rolesError) throw rolesError

      const transformedRoles: RoleData[] = (rolesData || []).map(role => ({
        role: role.role,
        title: role.title,
        description: role.description || '',
        responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities.map(String) : [],
        permissions: typeof role.permissions === 'object' && role.permissions !== null ? role.permissions as Record<string, boolean> : {},
        workflow_actions: Array.isArray(role.workflow_actions) ? role.workflow_actions.map(String) : []
      }))

      setRoles(transformedRoles)

      // Mock workflow stats (in production, calculate from actual data)
      const mockStats: WorkflowStats[] = [
        { role: 'Sr. CS', activeProjects: 12, completedThisWeek: 8, avgResponseTime: '2.5h', pendingActions: 3 },
        { role: 'CS', activeProjects: 24, completedThisWeek: 15, avgResponseTime: '1.8h', pendingActions: 7 },
        { role: 'Design Head', activeProjects: 18, completedThisWeek: 12, avgResponseTime: '3.2h', pendingActions: 5 },
        { role: 'Designer', activeProjects: 35, completedThisWeek: 22, avgResponseTime: '4.5h', pendingActions: 12 },
        { role: 'QC', activeProjects: 16, completedThisWeek: 19, avgResponseTime: '1.5h', pendingActions: 4 },
        { role: 'Client Serving', activeProjects: 14, completedThisWeek: 11, avgResponseTime: '2.1h', pendingActions: 6 },
        { role: 'Admin', activeProjects: 0, completedThisWeek: 0, avgResponseTime: 'N/A', pendingActions: 0 }
      ]
      setWorkflowStats(mockStats)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'Sr. CS': 'bg-purple-100 text-purple-800 border-purple-300',
      'CS': 'bg-blue-100 text-blue-800 border-blue-300',
      'Design Head': 'bg-indigo-100 text-indigo-800 border-indigo-300',
      'Designer': 'bg-pink-100 text-pink-800 border-pink-300',
      'QC': 'bg-green-100 text-green-800 border-green-300',
      'Client Serving': 'bg-orange-100 text-orange-800 border-orange-300',
      'Admin': 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <p>Loading roles and responsibilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles & Responsibilities</h1>
            <p className="text-muted-foreground mt-2">
              Complete workflow transparency across all team roles
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <Users className="h-4 w-4" aria-hidden="true" />
            {roles.length} Active Roles
          </Badge>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Workflow Overview</TabsTrigger>
            <TabsTrigger value="roles">Role Details</TabsTrigger>
            <TabsTrigger value="stats">Live Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" aria-label="Workflow icon" />
                  Project Workflow Chain
                </CardTitle>
                <CardDescription>
                  How projects flow through the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  {['Sr. CS', 'CS', 'Design Head', 'Designer', 'QC', 'Client Serving', 'Client'].map((role, index) => (
                    <div key={role} className="flex items-center gap-4">
                      <Badge variant="outline" className={getRoleColor(role)}>
                        {role}
                      </Badge>
                      {index < 6 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" aria-label="Total projects icon" />
                        Total Active Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {workflowStats.reduce((sum, stat) => sum + stat.activeProjects, 0)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" aria-label="Completed projects icon" />
                        Completed This Week
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {workflowStats.reduce((sum, stat) => sum + stat.completedThisWeek, 0)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-600" aria-label="Pending actions icon" />
                        Pending Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {workflowStats.reduce((sum, stat) => sum + stat.pendingActions, 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roles.map((role) => (
                <Card key={role.role} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" aria-label="Role icon" />
                          {role.title}
                        </CardTitle>
                        <Badge variant="outline" className={`mt-2 ${getRoleColor(role.role)}`}>
                          {role.role}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" aria-label="Responsibilities icon" />
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {role.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Workflow Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        {role.workflow_actions.map((action, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Role Performance</CardTitle>
                <CardDescription>
                  Real-time statistics for each role in the workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowStats.map((stat) => {
                    const roleData = roles.find(r => r.role === stat.role)
                    return (
                      <div key={stat.role} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={getRoleColor(stat.role)}>
                              {stat.role}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {roleData?.title}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Active Projects</p>
                            <p className="text-xl font-bold">{stat.activeProjects}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completed This Week</p>
                            <p className="text-xl font-bold text-green-600">{stat.completedThisWeek}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Response Time</p>
                            <p className="text-xl font-bold text-blue-600">{stat.avgResponseTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Pending Actions</p>
                            <p className="text-xl font-bold text-orange-600">{stat.pendingActions}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default RolesResponsibilities