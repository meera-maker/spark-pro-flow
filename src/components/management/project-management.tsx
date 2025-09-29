import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'
import { Database } from '@/integrations/supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type User = Database['public']['Tables']['users']['Row']

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const { profile } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    brief: '',
    creative_type: '',
    deadline: '',
    status: 'New',
    lead_id: '',
    designer_id: '',
    drive_folder_url: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchProjects(),
      fetchClients(),
      fetchUsers()
    ])
  }

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
        description: 'Failed to fetch projects',
        variant: 'destructive'
      })
    }
  }

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name')

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      console.error('Error fetching clients:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')

      if (error) throw error
      setUsers(data || [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_email: '',
      brief: '',
      creative_type: '',
      deadline: '',
      status: 'New',
      lead_id: '',
      designer_id: '',
      drive_folder_url: ''
    })
  }

  const handleAdd = async () => {
    if (!formData.client_name || !formData.client_email || !formData.brief || !formData.deadline) return

    setLoading(true)
    try {
      // Generate project code first
      const { data: projectCode, error: codeError } = await supabase
        .rpc('generate_project_code')
      
      if (codeError) throw codeError

      const { error } = await supabase
        .from('projects')
        .insert([{
          project_code: projectCode,
          client_name: formData.client_name,
          client_email: formData.client_email,
          brief: formData.brief,
          creative_type: formData.creative_type,
          deadline: formData.deadline,
          status: formData.status,
          lead_id: formData.lead_id || null,
          designer_id: formData.designer_id || null,
          drive_folder_url: formData.drive_folder_url || null
        }])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Project added successfully'
      })
      
      setIsAddDialogOpen(false)
      resetForm()
      fetchProjects()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingProject || !formData.client_name || !formData.client_email || !formData.brief || !formData.deadline) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          client_name: formData.client_name,
          client_email: formData.client_email,
          brief: formData.brief,
          creative_type: formData.creative_type,
          deadline: formData.deadline,
          status: formData.status,
          lead_id: formData.lead_id || null,
          designer_id: formData.designer_id || null,
          drive_folder_url: formData.drive_folder_url || null
        })
        .eq('id', editingProject.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Project updated successfully'
      })
      
      setIsEditDialogOpen(false)
      setEditingProject(null)
      resetForm()
      fetchProjects()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      })
      fetchProjects()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (project: Project) => {
    setEditingProject(project)
    setFormData({
      client_name: project.client_name,
      client_email: project.client_email,
      brief: project.brief,
      creative_type: project.creative_type,
      deadline: project.deadline.split('T')[0], // Format for date input
      status: project.status,
      lead_id: project.lead_id || '',
      designer_id: project.designer_id || '',
      drive_folder_url: project.drive_folder_url || ''
    })
    setIsEditDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-gray-100 text-gray-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'Lead Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Client Review':
        return 'bg-purple-100 text-purple-800'
      case 'Approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUserName = (userId: string | null) => {
    if (!userId) return 'Unassigned'
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown'
  }

  const canManageProjects = profile?.role === 'Admin' || profile?.role === 'Lead'

  const statusOptions = ['New', 'In Progress', 'Lead Review', 'Client Review', 'Approved', 'On Hold', 'Cancelled']
  const creativeTypes = ['Logo Design', 'Brand Identity', 'Website Design', 'Social Media Assets', 'Print Design', 'Packaging Design']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Project Management
              </CardTitle>
              <CardDescription>
                Manage your projects and assignments
              </CardDescription>
            </div>
            {canManageProjects && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                    <DialogDescription>
                      Create a new project
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_name">Client Name *</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                        placeholder="Client name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_email">Client Email *</Label>
                      <Input
                        id="client_email"
                        type="email"
                        value={formData.client_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="creative_type">Creative Type</Label>
                      <Select value={formData.creative_type} onValueChange={(value) => setFormData(prev => ({ ...prev, creative_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {creativeTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="deadline">Deadline *</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lead_id">Lead</Label>
                      <Select value={formData.lead_id} onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lead" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {users.filter(u => u.role === 'Lead' || u.role === 'Admin').map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="designer_id">Designer</Label>
                      <Select value={formData.designer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, designer_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select designer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Unassigned</SelectItem>
                          {users.filter(u => u.role === 'Designer').map(user => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="drive_folder_url">Drive Folder URL</Label>
                      <Input
                        id="drive_folder_url"
                        value={formData.drive_folder_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, drive_folder_url: e.target.value }))}
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="brief">Brief *</Label>
                      <Textarea
                        id="brief"
                        value={formData.brief}
                        onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                        placeholder="Project description and requirements"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Project'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Code</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead>Deadline</TableHead>
                {canManageProjects && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.project_code}</TableCell>
                  <TableCell>{project.client_name}</TableCell>
                  <TableCell>{project.creative_type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{getUserName(project.lead_id)}</TableCell>
                  <TableCell>{getUserName(project.designer_id)}</TableCell>
                  <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                  {canManageProjects && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete project {project.project_code}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(project.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-client_name">Client Name *</Label>
              <Input
                id="edit-client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="edit-client_email">Client Email *</Label>
              <Input
                id="edit-client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-creative_type">Creative Type</Label>
              <Select value={formData.creative_type} onValueChange={(value) => setFormData(prev => ({ ...prev, creative_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {creativeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-deadline">Deadline *</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-lead_id">Lead</Label>
              <Select value={formData.lead_id} onValueChange={(value) => setFormData(prev => ({ ...prev, lead_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.filter(u => u.role === 'Lead' || u.role === 'Admin').map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-designer_id">Designer</Label>
              <Select value={formData.designer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, designer_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select designer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {users.filter(u => u.role === 'Designer').map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-drive_folder_url">Drive Folder URL</Label>
              <Input
                id="edit-drive_folder_url"
                value={formData.drive_folder_url}
                onChange={(e) => setFormData(prev => ({ ...prev, drive_folder_url: e.target.value }))}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-brief">Brief *</Label>
              <Textarea
                id="edit-brief"
                value={formData.brief}
                onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                placeholder="Project description and requirements"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}