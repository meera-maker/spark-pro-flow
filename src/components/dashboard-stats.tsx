import { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  FolderKanban, 
  Building2, 
  Receipt,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type User = Database['public']['Tables']['users']['Row']
type Invoice = Database['public']['Tables']['invoices']['Row']

export function DashboardStats() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [projectsData, clientsData, usersData, invoicesData] = await Promise.all([
        supabase.from('projects').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('users').select('*'),
        supabase.from('invoices').select('*')
      ])

      if (projectsData.data) setProjects(projectsData.data)
      if (clientsData.data) setClients(clientsData.data)
      if (usersData.data) setUsers(usersData.data)
      if (invoicesData.data) setInvoices(invoicesData.data)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const activeProjects = projects.filter(p => 
    p.status === 'In Progress' || p.status === 'Lead Review' || p.status === 'Client Review'
  ).length

  const completedProjects = projects.filter(p => p.status === 'Approved').length
  const pendingInvoices = invoices.filter(i => i.status === 'draft' || i.status === 'sent').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name}
          </p>
        </div>
        <Link to="/intake">
          <Button>
            <FolderKanban className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/projects">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/projects">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/projects">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">Approved projects</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/clients">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{clients.length}</div>
              <p className="text-xs text-muted-foreground">Total clients</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/team">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{users.length}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">Total invoices</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total paid</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/team">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
          </Link>
          <Link to="/clients">
            <Button variant="outline" className="w-full justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Manage Clients
            </Button>
          </Link>
          <Link to="/projects">
            <Button variant="outline" className="w-full justify-start">
              <FolderKanban className="h-4 w-4 mr-2" />
              Manage Projects
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Projects</CardTitle>
            <Link to="/projects">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <Link 
                key={project.id} 
                to={`/projects/${project.project_code}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <div className="font-medium">{project.project_code}</div>
                  <div className="text-sm text-muted-foreground">{project.client_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{project.status}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No projects yet. Create your first project to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
