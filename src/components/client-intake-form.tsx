import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, UserPlus } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Database } from "@/integrations/supabase/types"
import { projectIntakeSchema } from "@/lib/validation-schemas"
import { z } from "zod"

type Client = Database['public']['Tables']['clients']['Row']
type User = Database['public']['Tables']['users']['Row']

export function ClientIntakeForm() {
  const [date, setDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creativeType, setCreativeType] = useState("")
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [showAddClient, setShowAddClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', phone: '' })
  const [isAddingClient, setIsAddingClient] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchClients()
    fetchUsers()
  }, [])

  const fetchClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) setClients(data)
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true })
    
    if (data) setUsers(data)
  }

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        title: "Error",
        description: "Client name and email are required",
        variant: "destructive"
      })
      return
    }

    setIsAddingClient(true)
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          name: newClient.name,
          email: newClient.email,
          company: newClient.company || null,
          phone: newClient.phone || null
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Client Added!",
        description: `${newClient.name} has been added successfully.`
      })

      await fetchClients()
      setSelectedClient(data.id)
      setNewClient({ name: '', email: '', company: '', phone: '' })
      setShowAddClient(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive"
      })
    } finally {
      setIsAddingClient(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      const client = clients.find(c => c.id === selectedClient)
      
      if (!client) {
        throw new Error("Please select a client")
      }

      if (!date) {
        throw new Error("Please select a deadline")
      }
      
      const projectData = {
        client_name: client.name,
        client_email: client.email,
        project_code: `PROJ-${Date.now()}`,
        creative_type: creativeType,
        brief: formData.get('brief') as string,
        deadline: date.toISOString(),
        drive_folder_url: (formData.get('drive-folder') as string) || '',
      }

      const validated = projectIntakeSchema.parse(projectData)
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          client_name: validated.client_name,
          client_email: validated.client_email,
          creative_type: validated.creative_type,
          deadline: validated.deadline,
          brief: validated.brief,
          drive_folder_url: validated.drive_folder_url || null,
          status: 'New',
          lead_id: user?.id || undefined,
          designer_id: assignedTo || null,
          project_code: validated.project_code
        }])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success!",
        description: "Project created successfully. Redirecting to dashboard..."
      })

      setTimeout(() => {
        navigate('/projects')
      }, 1500)
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create project",
          variant: "destructive"
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Start Your Creative Project</h1>
        <p className="text-xl text-muted-foreground">Tell us about your vision and we'll bring it to life</p>
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="gradient-primary text-white">
          <CardTitle className="text-2xl">Project Brief</CardTitle>
          <CardDescription className="text-white/80">
            Provide us with the details we need to create something amazing
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="client-select">Select Client *</Label>
                <div className="flex gap-2">
                  <Select required value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger className="border-2 focus:border-blue flex-1">
                      <SelectValue placeholder="Choose from existing clients" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name} ({client.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon" className="shrink-0">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                        <DialogDescription>
                          Create a new client to assign to this project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="client-name">Name *</Label>
                          <Input
                            id="client-name"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            placeholder="Client name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-email">Email *</Label>
                          <Input
                            id="client-email"
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            placeholder="client@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-company">Company</Label>
                          <Input
                            id="client-company"
                            value={newClient.company}
                            onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                            placeholder="Company name (optional)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="client-phone">Phone</Label>
                          <Input
                            id="client-phone"
                            value={newClient.phone}
                            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                            placeholder="Phone number (optional)"
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleAddClient} 
                          disabled={isAddingClient}
                          className="w-full"
                        >
                          {isAddingClient ? "Adding..." : "Add Client"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click <UserPlus className="inline h-3 w-3" /> to add a new client
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assign-to">Assign To</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="border-2 focus:border-blue">
                    <SelectValue placeholder="Assign to team member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((teamUser) => (
                      <SelectItem key={teamUser.id} value={teamUser.id}>
                        {teamUser.name} - {teamUser.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="creative-type">Creative Type *</Label>
                <Select required value={creativeType} onValueChange={setCreativeType}>
                  <SelectTrigger className="border-2 focus:border-blue">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Logo Design">Logo Design</SelectItem>
                    <SelectItem value="Brand Identity">Brand Identity</SelectItem>
                    <SelectItem value="Website Design">Website Design</SelectItem>
                    <SelectItem value="Print Design">Print Design</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                    <SelectItem value="Social Media Assets">Social Media Assets</SelectItem>
                    <SelectItem value="Video/Animation">Video/Animation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Project Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-2 focus:border-blue",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brief">Project Brief *</Label>
              <Textarea 
                id="brief"
                name="brief"
                placeholder="Describe your project, goals, target audience, style preferences, and any specific requirements..."
                className="min-h-32 border-2 focus:border-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-links">Reference Links</Label>
              <Textarea 
                id="reference-links"
                name="reference-links"
                placeholder="Share any inspiration links, competitor examples, or style references (one per line)"
                className="border-2 focus:border-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive-folder">Google Drive Folder (Optional)</Label>
              <Input 
                id="drive-folder"
                name="drive-folder"
                placeholder="https://drive.google.com/..." 
                className="border-2 focus:border-blue"
              />
              <p className="text-sm text-muted-foreground">
                Share any assets, brand guidelines, or existing materials
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full gradient-blue text-white hover:opacity-90 transition-opacity py-6 text-lg font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Submit Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
