import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Building2 } from 'lucide-react'
import { Database } from '@/integrations/supabase/types'
import { clientSchema } from '@/lib/validation-schemas'
import { z } from 'zod'

type Client = Database['public']['Tables']['clients']['Row']

export function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const { profile, hasRole } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    billing_address: '',
    tax_id: '',
    payment_terms: 'Net 30'
  })

  useEffect(() => {
    fetchClients()

    // Set up real-time subscription for clients
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClients((current) => [payload.new as Client, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setClients((current) =>
              current.map((client) =>
                client.id === payload.new.id ? (payload.new as Client) : client
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setClients((current) =>
              current.filter((client) => client.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchClients = async () => {
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
        description: 'Failed to fetch clients',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      billing_address: '',
      tax_id: '',
      payment_terms: 'Net 30'
    })
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.email) return

    setLoading(true)
    try {
      // Validate input
      const validated = clientSchema.parse(formData)

      const { error } = await supabase
        .from('clients')
        .insert([{
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          company: validated.company || null,
          address: validated.address || null,
          billing_address: validated.billing_address || null,
          tax_id: validated.tax_id || null,
          payment_terms: validated.payment_terms || 'Net 30',
          created_by: profile?.id
        }])

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client added successfully'
      })
      
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!editingClient || !formData.name || !formData.email) return

    setLoading(true)
    try {
      // Validate input
      const validated = clientSchema.parse(formData)

      const { error } = await supabase
        .from('clients')
        .update({
          name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
          company: validated.company || null,
          address: validated.address || null,
          billing_address: validated.billing_address || null,
          tax_id: validated.tax_id || null,
          payment_terms: validated.payment_terms || 'Net 30'
        })
        .eq('id', editingClient.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client updated successfully'
      })
      
      setIsEditDialogOpen(false)
      setEditingClient(null)
      resetForm()
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive'
        })
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Client deleted successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const openEditDialog = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      billing_address: client.billing_address || '',
      tax_id: client.tax_id || '',
      payment_terms: client.payment_terms || 'Net 30'
    })
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Management
              </CardTitle>
              <CardDescription>
                Manage your clients and their information
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Client</DialogTitle>
                    <DialogDescription>
                      Add a new client to your database
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Client name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="client@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Full address"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billing-address">Billing Address</Label>
                      <Textarea
                        id="billing-address"
                        value={formData.billing_address}
                        onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                        placeholder="Billing address (if different)"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax-id">Tax ID</Label>
                      <Input
                        id="tax-id"
                        value={formData.tax_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                        placeholder="Tax/VAT ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment-terms">Payment Terms</Label>
                      <Input
                        id="payment-terms"
                        value={formData.payment_terms}
                        onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                        placeholder="e.g., Net 30"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Client'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.company || '-'}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>
                    {new Date(client.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(client)}
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
                              <AlertDialogTitle>Delete Client</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {client.name}? This will also delete all associated projects and invoices. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(client.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company name"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-billing-address">Billing Address</Label>
              <Textarea
                id="edit-billing-address"
                value={formData.billing_address}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_address: e.target.value }))}
                placeholder="Billing address (if different)"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-tax-id">Tax ID</Label>
              <Input
                id="edit-tax-id"
                value={formData.tax_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                placeholder="Tax/VAT ID"
              />
            </div>
            <div>
              <Label htmlFor="edit-payment-terms">Payment Terms</Label>
              <Input
                id="edit-payment-terms"
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="e.g., Net 30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}