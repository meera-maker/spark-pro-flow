import { useState, useEffect } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { ProjectsDashboard } from '@/components/projects-dashboard'
import { NotificationsPanel } from '@/components/workflow/notifications-panel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWorkflow } from '@/hooks/useWorkflow'
import { supabase } from '@/integrations/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/integrations/supabase/types'
import { 
  Users, 
  ClipboardList, 
  Paintbrush2, 
  CheckCircle2, 
  Send,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

type Project = Database['public']['Tables']['projects']['Row']

const Workflow = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useWorkflow()

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
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Workflow analytics
  const getWorkflowStats = () => {
    const stats = {
      intake: projects.filter(p => p.status === 'New').length,
      inProgress: projects.filter(p => p.status === 'In Progress').length,
      qcReview: projects.filter(p => p.status === 'QC Review').length,
      clientReview: projects.filter(p => p.status === 'Client Review').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      overdue: projects.filter(p => new Date(p.deadline) < new Date() && p.status !== 'Completed').length
    }
    return stats
  }

  const stats = getWorkflowStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg">Loading workflow...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 space-y-8">
        {/* Workflow Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Workflow Management</h1>
          <p className="text-lg text-muted-foreground">
            Sr. CS → CS → Design Head → Design Team → QC → CS → Client
          </p>
        </div>

        {/* Workflow Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Intake</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.intake}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                </div>
                <Paintbrush2 className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">QC Review</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.qcReview}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Client Review</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.clientReview}</p>
                </div>
                <Send className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current User Info */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {currentUser.role}
                </Badge>
                <span className="text-muted-foreground">
                  {currentUser.name} ({currentUser.email})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Dashboard */}
          <div className="lg:col-span-2">
            <ProjectsDashboard />
          </div>

          {/* Notifications Panel */}
          <div className="lg:col-span-1">
            <NotificationsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Workflow