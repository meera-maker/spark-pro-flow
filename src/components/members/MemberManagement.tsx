import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Plus, UserPlus } from 'lucide-react'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

type Profile = Database['public']['Tables']['profiles']['Row']

export function MemberManagement() {
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Profile | null>(null)
  const { profile } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'cs' as Profile['role'],
    department: ''
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch members",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingMember) {
        // Update existing member
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department
          })
          .eq('id', editingMember.id)

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Member updated successfully!"
        })
      } else {
        // Create new member
        const { error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: formData.password,
          user_metadata: {
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department
          }
        })

        if (error) throw error
        
        toast({
          title: "Success",
          description: "Member created successfully!"
        })
      }

      setDialogOpen(false)
      setEditingMember(null)
      resetForm()
      fetchMembers()
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

  const handleEdit = (member: Profile) => {
    setEditingMember(member)
    setFormData({
      email: member.email,
      password: '',
      full_name: member.full_name || '',
      role: member.role,
      department: member.department || ''
    })
    setDialogOpen(true)
  }

  const handleToggleActive = async (member: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !member.is_active })
        .eq('id', member.id)

      if (error) throw error
      fetchMembers()
      
      toast({
        title: "Success",
        description: `Member ${!member.is_active ? 'activated' : 'deactivated'} successfully!`
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'cs',
      department: ''
    })
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'admin': 'bg-purple-100 text-purple-800',
      'senior-cs': 'bg-blue-100 text-blue-800',
      'cs': 'bg-green-100 text-green-800',
      'design-head': 'bg-orange-100 text-orange-800',
      'designer': 'bg-yellow-100 text-yellow-800',
      'qc': 'bg-red-100 text-red-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const canManageMembers = profile?.role === 'admin' || profile?.role === 'senior-cs'

  if (!canManageMembers) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            You don't have permission to manage team members.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">Manage team members and their permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingMember(null) }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Edit Member' : 'Add New Member'}
              </DialogTitle>
              <DialogDescription>
                {editingMember 
                  ? 'Update member information and permissions'
                  : 'Create a new team member account'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMember && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Profile['role'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs">Customer Service</SelectItem>
                    <SelectItem value="senior-cs">Senior Customer Service</SelectItem>
                    <SelectItem value="design-head">Design Head</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="qc">Quality Control</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing...' : editingMember ? 'Update Member' : 'Create Member'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar_url || ''} />
                    <AvatarFallback>
                      {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{member.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    {member.department && (
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.role.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-${member.id}`} className="text-sm">
                      Active
                    </Label>
                    <Switch
                      id={`active-${member.id}`}
                      checked={member.is_active}
                      onCheckedChange={() => handleToggleActive(member)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(member)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}