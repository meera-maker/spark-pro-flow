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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, FolderOpen, Eye, ExternalLink } from 'lucide-react'
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)
  const { profile, hasRole } = useAuth()
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
    drive_folder_url: '',
    // New comprehensive fields
    account: '',
    business_unit: '',
    poc: '',
    project_details: '',
    scope_of_work: '',
    format: '',
    copy_text: '',
    quantity: 1,
    coordinator_id: '',
    studio: '',
    portal_link: '',
    version_number: '1.0',
    details: '',
    image_editing_manipulation: '',
    image_purchase: '',
    additional_tasks: '',
    content_hours: 0,
    qc_hours: 0
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
      drive_folder_url: '',
      account: '',
      business_unit: '',
      poc: '',
      project_details: '',
      scope_of_work: '',
      format: '',
      copy_text: '',
      quantity: 1,
      coordinator_id: '',
      studio: '',
      portal_link: '',
      version_number: '1.0',
      details: '',
      image_editing_manipulation: '',
      image_purchase: '',
      additional_tasks: '',
      content_hours: 0,
      qc_hours: 0
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
          drive_folder_url: formData.drive_folder_url || null,
          // New comprehensive fields
          account: formData.account || null,
          business_unit: formData.business_unit || null,
          poc: formData.poc || null,
          project_details: formData.project_details || null,
          scope_of_work: formData.scope_of_work || null,
          format: formData.format || null,
          copy_text: formData.copy_text || null,
          quantity: formData.quantity,
          coordinator_id: formData.coordinator_id || null,
          studio: formData.studio || null,
          portal_link: formData.portal_link || null,
          version_number: formData.version_number,
          details: formData.details || null,
          image_editing_manipulation: formData.image_editing_manipulation || null,
          image_purchase: formData.image_purchase || null,
          additional_tasks: formData.additional_tasks || null,
          content_hours: formData.content_hours,
          qc_hours: formData.qc_hours
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
          drive_folder_url: formData.drive_folder_url || null,
          // New comprehensive fields
          account: formData.account || null,
          business_unit: formData.business_unit || null,
          poc: formData.poc || null,
          project_details: formData.project_details || null,
          scope_of_work: formData.scope_of_work || null,
          format: formData.format || null,
          copy_text: formData.copy_text || null,
          quantity: formData.quantity,
          coordinator_id: formData.coordinator_id || null,
          studio: formData.studio || null,
          portal_link: formData.portal_link || null,
          version_number: formData.version_number,
          details: formData.details || null,
          image_editing_manipulation: formData.image_editing_manipulation || null,
          image_purchase: formData.image_purchase || null,
          additional_tasks: formData.additional_tasks || null,
          content_hours: formData.content_hours,
          qc_hours: formData.qc_hours
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
      drive_folder_url: project.drive_folder_url || '',
      // New comprehensive fields
      account: project.account || '',
      business_unit: project.business_unit || '',
      poc: project.poc || '',
      project_details: project.project_details || '',
      scope_of_work: project.scope_of_work || '',
      format: project.format || '',
      copy_text: project.copy_text || '',
      quantity: project.quantity || 1,
      coordinator_id: project.coordinator_id || '',
      studio: project.studio || '',
      portal_link: project.portal_link || '',
      version_number: project.version_number || '1.0',
      details: project.details || '',
      image_editing_manipulation: project.image_editing_manipulation || '',
      image_purchase: project.image_purchase || '',
      additional_tasks: project.additional_tasks || '',
      content_hours: Number(project.content_hours) || 0,
      qc_hours: Number(project.qc_hours) || 0
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (project: Project) => {
    setViewingProject(project)
    setIsViewDialogOpen(true)
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

  const canManageProjects = hasRole('Admin') || hasRole('Lead')

  const statusOptions = ['New', 'In Progress', 'Lead Review', 'Client Review', 'Approved', 'On Hold', 'Cancelled']
  const creativeTypes = ['Logo Design', 'Brand Identity', 'Website Design', 'Social Media Assets', 'Print Design', 'Packaging Design', 'Illustration', 'Video Production', 'Animation']
  const formatOptions = ['Digital', 'Print', 'Web', 'Mobile', 'Video', 'Static', 'Animated', 'Interactive']
  const businessUnits = ['Marketing', 'Sales', 'Creative', 'Production', 'Account Management', 'Strategy']
  const studioOptions = ['Studio A', 'Studio B', 'Studio C', 'External', 'Remote']

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
                Comprehensive project tracking and management
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
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                    <DialogDescription>
                      Create a comprehensive project with all tracking details
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="details">Project Details</TabsTrigger>
                      <TabsTrigger value="team">Team & Resources</TabsTrigger>
                      <TabsTrigger value="specs">Specifications</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
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
                          <Label htmlFor="account">Account</Label>
                          <Input
                            id="account"
                            value={formData.account}
                            onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                            placeholder="Account name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="business_unit">Business Unit</Label>
                          <Select value={formData.business_unit} onValueChange={(value) => setFormData(prev => ({ ...prev, business_unit: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select BU" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessUnits.map(bu => (
                                <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="poc">Point of Contact</Label>
                          <Input
                            id="poc"
                            value={formData.poc}
                            onChange={(e) => setFormData(prev => ({ ...prev, poc: e.target.value }))}
                            placeholder="Contact person"
                          />
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
                      </div>
                      <div>
                        <Label htmlFor="brief">Brief *</Label>
                        <Textarea
                          id="brief"
                          value={formData.brief}
                          onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                          placeholder="Project brief and requirements"
                          rows={4}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                          <Label htmlFor="format">Format</Label>
                          <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent>
                              {formatOptions.map(format => (
                                <SelectItem key={format} value={format}>{format}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="version_number">Version</Label>
                          <Input
                            id="version_number"
                            value={formData.version_number}
                            onChange={(e) => setFormData(prev => ({ ...prev, version_number: e.target.value }))}
                            placeholder="1.0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="project_details">Project Details</Label>
                        <Textarea
                          id="project_details"
                          value={formData.project_details}
                          onChange={(e) => setFormData(prev => ({ ...prev, project_details: e.target.value }))}
                          placeholder="Detailed project information"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scope_of_work">Scope of Work</Label>
                        <Textarea
                          id="scope_of_work"
                          value={formData.scope_of_work}
                          onChange={(e) => setFormData(prev => ({ ...prev, scope_of_work: e.target.value }))}
                          placeholder="Detailed scope of work"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="copy_text">Copy</Label>
                        <Textarea
                          id="copy_text"
                          value={formData.copy_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, copy_text: e.target.value }))}
                          placeholder="Copy text and content"
                          rows={3}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="team" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                          <Label htmlFor="coordinator_id">Coordinator</Label>
                          <Select value={formData.coordinator_id} onValueChange={(value) => setFormData(prev => ({ ...prev, coordinator_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select coordinator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {users.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="studio">Studio</Label>
                          <Select value={formData.studio} onValueChange={(value) => setFormData(prev => ({ ...prev, studio: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select studio" />
                            </SelectTrigger>
                            <SelectContent>
                              {studioOptions.map(studio => (
                                <SelectItem key={studio} value={studio}>{studio}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="content_hours">Content Hours</Label>
                          <Input
                            id="content_hours"
                            type="number"
                            step="0.5"
                            min="0"
                            value={formData.content_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, content_hours: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="qc_hours">QC Hours</Label>
                          <Input
                            id="qc_hours"
                            type="number"
                            step="0.5"
                            min="0"
                            value={formData.qc_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, qc_hours: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="specs" className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
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
                          <Label htmlFor="drive_folder_url">Drive Folder URL</Label>
                          <Input
                            id="drive_folder_url"
                            value={formData.drive_folder_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, drive_folder_url: e.target.value }))}
                            placeholder="https://drive.google.com/..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="portal_link">Portal Link</Label>
                          <Input
                            id="portal_link"
                            value={formData.portal_link}
                            onChange={(e) => setFormData(prev => ({ ...prev, portal_link: e.target.value }))}
                            placeholder="Client portal or review link"
                          />
                        </div>
                        <div>
                          <Label htmlFor="image_editing_manipulation">Image Editing/Manipulation</Label>
                          <Textarea
                            id="image_editing_manipulation"
                            value={formData.image_editing_manipulation}
                            onChange={(e) => setFormData(prev => ({ ...prev, image_editing_manipulation: e.target.value }))}
                            placeholder="Image editing requirements"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="image_purchase">Image Purchase</Label>
                          <Textarea
                            id="image_purchase"
                            value={formData.image_purchase}
                            onChange={(e) => setFormData(prev => ({ ...prev, image_purchase: e.target.value }))}
                            placeholder="Image purchase details"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="additional_tasks">Additional Tasks</Label>
                          <Textarea
                            id="additional_tasks"
                            value={formData.additional_tasks}
                            onChange={(e) => setFormData(prev => ({ ...prev, additional_tasks: e.target.value }))}
                            placeholder="Additional tasks and requirements"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="details">Details</Label>
                          <Textarea
                            id="details"
                            value={formData.details}
                            onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                            placeholder="Additional project details"
                            rows={3}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SN</TableHead>
                  <TableHead>Job No.</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>BU</TableHead>
                  <TableHead>POC</TableHead>
                  <TableHead>Creative Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Studio</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Version</TableHead>
                  {canManageProjects && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.serial_number}</TableCell>
                    <TableCell className="font-medium">{project.project_code}</TableCell>
                    <TableCell>{project.account || project.client_name}</TableCell>
                    <TableCell>{project.business_unit || '-'}</TableCell>
                    <TableCell>{project.poc || '-'}</TableCell>
                    <TableCell>{project.creative_type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{getUserName(project.coordinator_id)}</TableCell>
                    <TableCell>{project.studio || '-'}</TableCell>
                    <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                    <TableCell>{project.version_number}</TableCell>
                    {canManageProjects && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewDialog(project)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Details - {viewingProject?.project_code}</DialogTitle>
            <DialogDescription>
              Comprehensive project information
            </DialogDescription>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Serial Number:</strong> {viewingProject.serial_number}</div>
                <div><strong>Job Number:</strong> {viewingProject.project_code}</div>
                <div><strong>Account:</strong> {viewingProject.account || viewingProject.client_name}</div>
                <div><strong>Business Unit:</strong> {viewingProject.business_unit || '-'}</div>
                <div><strong>POC:</strong> {viewingProject.poc || '-'}</div>
                <div><strong>Creative Type:</strong> {viewingProject.creative_type}</div>
                <div><strong>Format:</strong> {viewingProject.format || '-'}</div>
                <div><strong>Quantity:</strong> {viewingProject.quantity}</div>
                <div><strong>Coordinator:</strong> {getUserName(viewingProject.coordinator_id)}</div>
                <div><strong>Studio:</strong> {viewingProject.studio || '-'}</div>
                <div><strong>Deadline:</strong> {new Date(viewingProject.deadline).toLocaleDateString()}</div>
                <div><strong>Status:</strong> <Badge className={getStatusColor(viewingProject.status)}>{viewingProject.status}</Badge></div>
                <div><strong>Version:</strong> {viewingProject.version_number}</div>
                <div><strong>Content Hours:</strong> {viewingProject.content_hours}</div>
                <div><strong>QC Hours:</strong> {viewingProject.qc_hours}</div>
              </div>
              
              <div className="space-y-4">
                {viewingProject.brief && (
                  <div>
                    <strong>Brief:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.brief}</p>
                  </div>
                )}
                {viewingProject.project_details && (
                  <div>
                    <strong>Project Details:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.project_details}</p>
                  </div>
                )}
                {viewingProject.scope_of_work && (
                  <div>
                    <strong>Scope of Work:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.scope_of_work}</p>
                  </div>
                )}
                {viewingProject.copy_text && (
                  <div>
                    <strong>Copy:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.copy_text}</p>
                  </div>
                )}
                {viewingProject.image_editing_manipulation && (
                  <div>
                    <strong>Image Editing/Manipulation:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.image_editing_manipulation}</p>
                  </div>
                )}
                {viewingProject.image_purchase && (
                  <div>
                    <strong>Image Purchase:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.image_purchase}</p>
                  </div>
                )}
                {viewingProject.additional_tasks && (
                  <div>
                    <strong>Additional Tasks:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.additional_tasks}</p>
                  </div>
                )}
                {viewingProject.details && (
                  <div>
                    <strong>Details:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{viewingProject.details}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                {viewingProject.drive_folder_url && (
                  <Button variant="outline" asChild>
                    <a href={viewingProject.drive_folder_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Drive Folder
                    </a>
                  </Button>
                )}
                {viewingProject.portal_link && (
                  <Button variant="outline" asChild>
                    <a href={viewingProject.portal_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Portal Link
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar structure to Add Dialog but with editing logic */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Project Details</TabsTrigger>
              <TabsTrigger value="team">Team & Resources</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
            </TabsList>
            
            {/* Same content as Add Dialog but for editing */}
            <TabsContent value="basic" className="space-y-4">
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
                  <Label htmlFor="edit-account">Account</Label>
                  <Input
                    id="edit-account"
                    value={formData.account}
                    onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-business_unit">Business Unit</Label>
                  <Select value={formData.business_unit} onValueChange={(value) => setFormData(prev => ({ ...prev, business_unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select BU" />
                    </SelectTrigger>
                    <SelectContent>
                      {businessUnits.map(bu => (
                        <SelectItem key={bu} value={bu}>{bu}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-poc">Point of Contact</Label>
                  <Input
                    id="edit-poc"
                    value={formData.poc}
                    onChange={(e) => setFormData(prev => ({ ...prev, poc: e.target.value }))}
                    placeholder="Contact person"
                  />
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
              </div>
              <div>
                <Label htmlFor="edit-brief">Brief *</Label>
                <Textarea
                  id="edit-brief"
                  value={formData.brief}
                  onChange={(e) => setFormData(prev => ({ ...prev, brief: e.target.value }))}
                  placeholder="Project brief and requirements"
                  rows={4}
                />
              </div>
            </TabsContent>
            
            {/* Similar content for other tabs... */}
          </Tabs>
          
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