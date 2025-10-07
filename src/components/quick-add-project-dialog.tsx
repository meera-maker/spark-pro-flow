import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Database } from "@/integrations/supabase/types"

type Client = Database['public']['Tables']['clients']['Row']
type User = Database['public']['Tables']['users']['Row']

export function QuickAddProjectDialog({ onProjectAdded }: { onProjectAdded?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [creativeType, setCreativeType] = useState("")
  const [deadline, setDeadline] = useState<Date>(addDays(new Date(), 7))
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (open) {
      fetchClients()
      fetchUsers()
    }
  }, [open])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const client = clients.find(c => c.id === selectedClient)
      if (!client) {
        throw new Error("Please select a client")
      }

      const { error } = await supabase
        .from('projects')
        .insert([{
          client_name: client.name,
          client_email: client.email,
          creative_type: creativeType,
          deadline: deadline.toISOString(),
          brief: `Project for ${client.name}`,
          status: 'New',
          lead_id: user?.id,
          designer_id: assignedTo || null,
          project_code: `PROJ-${Date.now()}`
        }])

      if (error) throw error

      toast({
        title: "Success!",
        description: "Project created successfully"
      })

      // Reset form
      setSelectedClient("")
      setAssignedTo("")
      setCreativeType("")
      setDeadline(addDays(new Date(), 7))
      setOpen(false)
      
      onProjectAdded?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const addTestProject = async () => {
    const testProjects = [
      { name: "TechCorp", email: "contact@techcorp.com", type: "Logo Design" },
      { name: "StartupXYZ", email: "hello@startupxyz.com", type: "Brand Identity" },
      { name: "EcoGreen", email: "info@ecogreen.com", type: "Website Design" },
    ]

    const randomProject = testProjects[Math.floor(Math.random() * testProjects.length)]
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('projects')
        .insert([{
          client_name: randomProject.name,
          client_email: randomProject.email,
          creative_type: randomProject.type,
          deadline: addDays(new Date(), Math.floor(Math.random() * 14) + 1).toISOString(),
          brief: `Test project for ${randomProject.name} - ${randomProject.type}`,
          status: 'New',
          lead_id: user?.id,
          project_code: `TEST-${Date.now()}`
        }])

      if (error) throw error

      toast({
        title: "Test Project Added!",
        description: `${randomProject.name} project created`
      })

      onProjectAdded?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create test project",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Quick Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Add Project</DialogTitle>
          <DialogDescription>
            Quickly create a new project. For detailed projects, use the full intake form.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-client">Select Client *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} required>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name} ({client.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              No clients? Add them in Team → Clients tab
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-assign">Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
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

          <div className="space-y-2">
            <Label htmlFor="quick-creative-type">Creative Type *</Label>
            <Select value={creativeType} onValueChange={setCreativeType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Logo Design">Logo Design</SelectItem>
                <SelectItem value="Brand Identity">Brand Identity</SelectItem>
                <SelectItem value="Website Design">Website Design</SelectItem>
                <SelectItem value="Print Design">Print Design</SelectItem>
                <SelectItem value="Social Media Assets">Social Media Assets</SelectItem>
                <SelectItem value="Video/Animation">Video/Animation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Deadline *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => date && setDeadline(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Project"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addTestProject}
              disabled={loading}
            >
              Add Test Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}