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
import { Plus, Edit, Trash2, FileText, Eye } from 'lucide-react'
import { Database } from '@/integrations/supabase/types'

type Invoice = Database['public']['Tables']['invoices']['Row']
type InvoiceItem = Database['public']['Tables']['invoice_items']['Row']
type Client = Database['public']['Tables']['clients']['Row']
type Project = Database['public']['Tables']['projects']['Row']

interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<InvoiceWithItems[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceWithItems | null>(null)
  const [loading, setLoading] = useState(false)
  const { profile, hasRole } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: '0',
    notes: '',
    items: [{ description: '', quantity: 1, rate: 0 }]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    await Promise.all([
      fetchInvoices(),
      fetchClients(),
      fetchProjects()
    ])
  }

  const fetchInvoices = async () => {
    try {
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (invoiceError) throw invoiceError

      const invoicesWithItems = await Promise.all(
        (invoiceData || []).map(async (invoice) => {
          const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id)

          if (itemsError) throw itemsError

          return {
            ...invoice,
            items: items || []
          }
        })
      )

      setInvoices(invoicesWithItems)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch invoices',
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

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error: any) {
      console.error('Error fetching projects:', error)
    }
  }

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
    const taxRate = parseFloat(formData.tax_rate) / 100
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const resetForm = () => {
    setFormData({
      client_id: '',
      project_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      tax_rate: '0',
      notes: '',
      items: [{ description: '', quantity: 1, rate: 0 }]
    })
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
    }))
  }

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const handleAdd = async () => {
    if (!formData.client_id || !formData.due_date || formData.items.length === 0) return

    setLoading(true)
    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      // Generate invoice number
      const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
        .rpc('generate_invoice_number')

      if (invoiceNumberError) throw invoiceNumberError

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: invoiceNumberData,
          client_id: formData.client_id,
          project_id: formData.project_id || null,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          subtotal,
          tax_rate: parseFloat(formData.tax_rate),
          tax_amount: taxAmount,
          total,
          notes: formData.notes || null,
          created_by: profile?.id
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice items
      const invoiceItems = formData.items.map(item => ({
        invoice_id: invoiceData.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems)

      if (itemsError) throw itemsError

      toast({
        title: 'Success',
        description: `Invoice ${invoiceNumberData} created successfully`
      })
      
      setIsAddDialogOpen(false)
      resetForm()
      fetchInvoices()
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

  const handleDelete = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Invoice deleted successfully'
      })
      fetchInvoices()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const canManageInvoices = hasRole('Admin') || hasRole('Lead')

  const statusOptions = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Management
              </CardTitle>
              <CardDescription>
                Create and manage invoices for your clients
              </CardDescription>
            </div>
            {canManageInvoices && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Invoice</DialogTitle>
                    <DialogDescription>
                      Create a new invoice for your client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="client_id">Client *</Label>
                        <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="project_id">Project (Optional)</Label>
                        <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No Project</SelectItem>
                            {projects.map(project => (
                              <SelectItem key={project.id} value={project.id}>{project.project_code} - {project.client_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="issue_date">Issue Date</Label>
                        <Input
                          id="issue_date"
                          type="date"
                          value={formData.issue_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="due_date">Due Date *</Label>
                        <Input
                          id="due_date"
                          type="date"
                          value={formData.due_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                        <Input
                          id="tax_rate"
                          type="number"
                          step="0.01"
                          value={formData.tax_rate}
                          onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Invoice Items</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-5">
                              <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Rate"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={(item.quantity * item.rate).toFixed(2)}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                            <div className="col-span-1">
                              {formData.items.length > 1 && (
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional notes or payment terms"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        {(() => {
                          const { subtotal, taxAmount, total } = calculateTotals()
                          return (
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>${subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax ({formData.tax_rate}%):</span>
                                <span>${taxAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>${total.toFixed(2)}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAdd} disabled={loading}>
                      {loading ? 'Creating...' : 'Create Invoice'}
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{getClientName(invoice.client_id)}</TableCell>
                  <TableCell>{new Date(invoice.issue_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>${parseFloat(invoice.total.toString()).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setViewingInvoice(invoice)
                          setIsViewDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canManageInvoices && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(invoice.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Invoice Number</Label>
                  <p>{viewingInvoice.invoice_number}</p>
                </div>
                <div>
                  <Label className="font-medium">Client</Label>
                  <p>{getClientName(viewingInvoice.client_id)}</p>
                </div>
                <div>
                  <Label className="font-medium">Issue Date</Label>
                  <p>{new Date(viewingInvoice.issue_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Due Date</Label>
                  <p>{new Date(viewingInvoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Items</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingInvoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${parseFloat(item.rate.toString()).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(item.amount.toString()).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${parseFloat(viewingInvoice.subtotal.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({viewingInvoice.tax_rate}%):</span>
                  <span>${parseFloat(viewingInvoice.tax_amount.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${parseFloat(viewingInvoice.total.toString()).toFixed(2)}</span>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div>
                  <Label className="font-medium">Notes</Label>
                  <p className="text-sm text-gray-600">{viewingInvoice.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}