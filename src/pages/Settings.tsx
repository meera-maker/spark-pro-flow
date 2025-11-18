import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Plus, Trash2, Settings as SettingsIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Category = {
  id: string
  name: string
  description?: string
}

type ResponsibilityTemplate = {
  id: string
  role: string
  responsibilities: string[]
}

type Client = {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
}

const Settings = () => {
  const { profile, hasRole } = useAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [responsibilities, setResponsibilities] = useState<ResponsibilityTemplate[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [newResponsibility, setNewResponsibility] = useState({ role: "", responsibilities: "" })
  const [newClient, setNewClient] = useState({ name: "", email: "", company: "", phone: "" })
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [responsibilityDialogOpen, setResponsibilityDialogOpen] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  // Check if user is admin
  const isAdmin = hasRole('Admin')

  useEffect(() => {
    if (isAdmin) {
      loadSettings()
      loadClients()
    }
  }, [isAdmin])

  const loadSettings = async () => {
    try {
      const { data: categoriesData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'project_categories')
        .maybeSingle()

      const { data: responsibilitiesData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'role_responsibilities')
        .maybeSingle()

      if (categoriesData?.value) {
        setCategories(categoriesData.value as Category[])
      }

      if (responsibilitiesData?.value) {
        setResponsibilities(responsibilitiesData.value as ResponsibilityTemplate[])
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive'
      })
    }
  }

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClients(data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load clients',
        variant: 'destructive'
      })
    }
  }

  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'project_categories',
          value: updatedCategories
        })

      if (error) throw error

      setCategories(updatedCategories)
      toast({
        title: 'Success',
        description: 'Categories updated successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save categories',
        variant: 'destructive'
      })
    }
  }

  const saveResponsibilities = async (updatedResponsibilities: ResponsibilityTemplate[]) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          key: 'role_responsibilities',
          value: updatedResponsibilities
        })

      if (error) throw error

      setResponsibilities(updatedResponsibilities)
      toast({
        title: 'Success',
        description: 'Responsibilities updated successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save responsibilities',
        variant: 'destructive'
      })
    }
  }

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive'
      })
      return
    }

    const updated = [
      ...categories,
      {
        id: crypto.randomUUID(),
        name: newCategory.name,
        description: newCategory.description
      }
    ]

    saveCategories(updated)
    setNewCategory({ name: "", description: "" })
    setCategoryDialogOpen(false)
  }

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id)
    saveCategories(updated)
  }

  const addResponsibility = () => {
    if (!newResponsibility.role.trim() || !newResponsibility.responsibilities.trim()) {
      toast({
        title: 'Error',
        description: 'Role and responsibilities are required',
        variant: 'destructive'
      })
      return
    }

    const updated = [
      ...responsibilities,
      {
        id: crypto.randomUUID(),
        role: newResponsibility.role,
        responsibilities: newResponsibility.responsibilities.split('\n').filter(r => r.trim())
      }
    ]

    saveResponsibilities(updated)
    setNewResponsibility({ role: "", responsibilities: "" })
    setResponsibilityDialogOpen(false)
  }

  const deleteResponsibility = (id: string) => {
    const updated = responsibilities.filter(r => r.id !== id)
    saveResponsibilities(updated)
  }

  const addClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: 'Error',
        description: 'Name and email are required',
        variant: 'destructive'
      })
      return
    }

    try {
      const { error } = await supabase
        .from('clients')
        .insert([{
          name: newClient.name,
          email: newClient.email,
          company: newClient.company || null,
          phone: newClient.phone || null
        }])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client added successfully'
      })
      
      setNewClient({ name: "", email: "", company: "", phone: "" })
      setClientDialogOpen(false)
      loadClients()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to add client',
        variant: 'destructive'
      })
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client deleted successfully'
      })
      
      loadClients()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete client',
        variant: 'destructive'
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You must be an admin to access settings.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground">Manage categories, roles, and responsibilities</p>
        </div>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Project Categories</TabsTrigger>
            <TabsTrigger value="responsibilities">Role Responsibilities</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Project Categories</CardTitle>
                    <CardDescription>Manage categories for project organization</CardDescription>
                  </div>
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="categoryName">Category Name</Label>
                          <Input
                            id="categoryName"
                            value={newCategory.name}
                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            placeholder="e.g., Social Media, Print Design"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDesc">Description</Label>
                          <Textarea
                            id="categoryDesc"
                            value={newCategory.description}
                            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                            placeholder="Optional description"
                          />
                        </div>
                        <Button onClick={addCategory} className="w-full">Add Category</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No categories added yet. Click "Add Category" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsibilities">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Role Responsibilities</CardTitle>
                    <CardDescription>Define responsibilities for each team role</CardDescription>
                  </div>
                  <Dialog open={responsibilityDialogOpen} onOpenChange={setResponsibilityDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Role Responsibilities</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="roleName">Role</Label>
                          <Select
                            value={newResponsibility.role}
                            onValueChange={(value) => setNewResponsibility({ ...newResponsibility, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Lead">Lead</SelectItem>
                              <SelectItem value="Designer">Designer</SelectItem>
                              <SelectItem value="Coordinator">Coordinator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                          <Textarea
                            id="responsibilities"
                            value={newResponsibility.responsibilities}
                            onChange={(e) => setNewResponsibility({ ...newResponsibility, responsibilities: e.target.value })}
                            placeholder="Enter each responsibility on a new line"
                            rows={6}
                          />
                        </div>
                        <Button onClick={addResponsibility} className="w-full">Add Template</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responsibilities.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{template.role}</CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResponsibility(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-1">
                          {template.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-muted-foreground">{resp}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                  {responsibilities.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No role templates added yet. Click "Add Role Template" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Management</CardTitle>
                    <CardDescription>Add and manage your clients</CardDescription>
                  </div>
                  <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Client
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="clientName">Client Name *</Label>
                          <Input
                            id="clientName"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientEmail">Email *</Label>
                          <Input
                            id="clientEmail"
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientCompany">Company</Label>
                          <Input
                            id="clientCompany"
                            value={newClient.company}
                            onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                            placeholder="Acme Corp"
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientPhone">Phone</Label>
                          <Input
                            id="clientPhone"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <Button onClick={addClient} className="w-full">Add Client</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell className="text-muted-foreground">{client.company || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">{client.phone || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {clients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No clients added yet. Click "Add Client" to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Settings
