import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DollarSign, Clock, FileText, Plus } from 'lucide-react'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

type Project = Database['public']['Tables']['projects']['Row'] & {
  clients: Database['public']['Tables']['clients']['Row'] | null
}

type TimeEntry = Database['public']['Tables']['time_entries']['Row'] & {
  profiles: { full_name: string | null } | null
}

export function BillingDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const { profile } = useAuth()
  const { toast } = useToast()

  const [timeEntryForm, setTimeEntryForm] = useState({
    project_id: '',
    description: '',
    hours: 0,
    hourly_rate: 0,
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchProjects()
    fetchTimeEntries()
  }, [])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive"
      })
    }
  }

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('date', { ascending: false })
        .limit(50)

      if (error) throw error
      setTimeEntries(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTimeEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    try {
      const { error } = await supabase
        .from('time_entries')
        .insert({
          ...timeEntryForm,
          user_id: profile.id
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Time entry added successfully!"
      })

      setDialogOpen(false)
      setTimeEntryForm({
        project_id: '',
        description: '',
        hours: 0,
        hourly_rate: 0,
        date: new Date().toISOString().split('T')[0]
      })
      fetchTimeEntries()
      fetchProjects()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const totalRevenue = projects.reduce((sum, project) => sum + project.billing_amount, 0)
  const totalHours = projects.reduce((sum, project) => sum + project.actual_hours, 0)
  const averageRate = totalHours > 0 ? totalRevenue / totalHours : 0

  const filteredTimeEntries = selectedProject 
    ? timeEntries.filter(entry => entry.project_id === selectedProject)
    : timeEntries

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Billing Dashboard</h2>
          <p className="text-muted-foreground">Track time and billing for all projects</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
              <DialogDescription>
                Log time spent on a project for billing
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddTimeEntry} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <select
                  id="project"
                  className="w-full p-2 border rounded-md"
                  value={timeEntryForm.project_id}
                  onChange={(e) => setTimeEntryForm({ ...timeEntryForm, project_id: e.target.value })}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - {project.clients?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={timeEntryForm.description}
                  onChange={(e) => setTimeEntryForm({ ...timeEntryForm, description: e.target.value })}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    min="0"
                    value={timeEntryForm.hours}
                    onChange={(e) => setTimeEntryForm({ ...timeEntryForm, hours: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={timeEntryForm.hourly_rate}
                    onChange={(e) => setTimeEntryForm({ ...timeEntryForm, hourly_rate: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={timeEntryForm.date}
                  onChange={(e) => setTimeEntryForm({ ...timeEntryForm, date: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Add Time Entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRate.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.current_status !== 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Billing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Projects Billing</CardTitle>
          <CardDescription>
            Overview of billing for all projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Estimated Hours</TableHead>
                <TableHead>Actual Hours</TableHead>
                <TableHead>Billing Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.clients?.name || 'No Client'}</TableCell>
                  <TableCell>{project.estimated_hours || 0}</TableCell>
                  <TableCell>{project.actual_hours.toFixed(1)}</TableCell>
                  <TableCell>${project.billing_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={project.current_status === 'completed' ? 'default' : 'secondary'}>
                      {project.current_status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProject(selectedProject === project.id ? '' : project.id)}
                    >
                      {selectedProject === project.id ? 'Hide' : 'View'} Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>
            {selectedProject ? 'Showing entries for selected project' : 'Showing all recent time entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTimeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {projects.find(p => p.id === entry.project_id)?.title || 'Unknown Project'}
                  </TableCell>
                  <TableCell>{entry.profiles?.full_name || 'Unknown User'}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.hours}</TableCell>
                  <TableCell>${entry.hourly_rate?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>${((entry.hourly_rate || 0) * entry.hours).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}