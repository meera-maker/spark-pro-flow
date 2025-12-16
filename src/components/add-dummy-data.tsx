import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, FolderKanban, Receipt, FileStack } from "lucide-react"
import { useState } from "react"

export function AddDummyData({ onDataAdded }: { onDataAdded?: () => void }) {
  const { toast } = useToast()
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [loadingRevisions, setLoadingRevisions] = useState(false)

  const addDummyClients = async () => {
    setLoadingClients(true)
    try {
      const dummyClients = [
        { name: 'Victoria Hayes', email: 'victoria.h@quantum.com', company: 'Quantum Digital', phone: '+1-555-0201', address: '852 Tech Valley, San Jose, CA 95110', payment_terms: 'Net 30' },
        { name: 'Christopher Park', email: 'chris.park@zenspace.com', company: 'ZenSpace Studios', phone: '+1-555-0202', address: '963 Creative Blvd, Brooklyn, NY 11201', payment_terms: 'Net 15' },
        { name: 'Sophia Ramirez', email: 'sophia@elevate.co', company: 'Elevate Brands', phone: '+1-555-0203', address: '741 Commerce Dr, Atlanta, GA 30301', payment_terms: 'Net 30' },
        { name: 'Daniel Foster', email: 'dan.foster@lumina.com', company: 'Lumina Group', phone: '+1-555-0204', address: '159 Market St, Philadelphia, PA 19101', payment_terms: 'Net 45' },
        { name: 'Isabella Morgan', email: 'isabella@pulse.io', company: 'Pulse Media', phone: '+1-555-0205', address: '357 Innovation Way, Phoenix, AZ 85001', payment_terms: 'Net 30' },
        { name: 'Marcus Chen', email: 'marcus@techwave.io', company: 'TechWave Solutions', phone: '+1-555-0206', address: '428 Silicon Ave, Austin, TX 78701', payment_terms: 'Net 30' },
        { name: 'Olivia Thompson', email: 'olivia@brandcraft.com', company: 'BrandCraft Agency', phone: '+1-555-0207', address: '672 Design St, Portland, OR 97201', payment_terms: 'Net 15' },
        { name: 'James Rodriguez', email: 'james.r@nexusgroup.com', company: 'Nexus Group', phone: '+1-555-0208', address: '891 Business Park, Denver, CO 80201', payment_terms: 'Net 30' },
        { name: 'Emma Watson', email: 'emma@digitaledge.com', company: 'Digital Edge Marketing', phone: '+1-555-0209', address: '234 Marketing Plaza, Seattle, WA 98101', payment_terms: 'Net 45' },
        { name: 'Ryan Mitchell', email: 'ryan@creativehub.io', company: 'Creative Hub Studios', phone: '+1-555-0210', address: '567 Innovation Dr, Boston, MA 02101', payment_terms: 'Net 30' }
      ]

      const { data: insertedClients, error: clientError } = await supabase
        .from('clients')
        .insert(dummyClients)
        .select()

      if (clientError) throw clientError

      toast({
        title: 'Success',
        description: `Added ${insertedClients?.length || 0} new clients`
      })

      onDataAdded?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add clients',
        variant: 'destructive'
      })
    } finally {
      setLoadingClients(false)
    }
  }

  const addDummyProjects = async () => {
    setLoadingProjects(true)
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .limit(5)

      const leadUser = users?.find(u => u.role === 'Lead') || users?.[0]
      const designerUser = users?.find(u => u.role === 'Designer') || users?.[1] || users?.[0]

      const clientNames = [
        { name: 'Victoria Hayes', email: 'victoria.h@quantum.com' },
        { name: 'Christopher Park', email: 'chris.park@zenspace.com' },
        { name: 'Sophia Ramirez', email: 'sophia@elevate.co' },
        { name: 'Daniel Foster', email: 'dan.foster@lumina.com' },
        { name: 'Isabella Morgan', email: 'isabella@pulse.io' },
        { name: 'Marcus Chen', email: 'marcus@techwave.io' },
        { name: 'Olivia Thompson', email: 'olivia@brandcraft.com' },
        { name: 'James Rodriguez', email: 'james.r@nexusgroup.com' },
        { name: 'Emma Watson', email: 'emma@digitaledge.com' },
        { name: 'Ryan Mitchell', email: 'ryan@creativehub.io' }
      ]

      const creativeTypes = ['Logo Design', 'Brand Identity', 'Social Media Graphics', 'Website Design', 'Marketing Collateral', 'Packaging Design', 'Presentation Design', 'Infographic', 'App UI Design', 'Email Template']
      const statuses = ['New', 'In Progress', 'Lead Review', 'QC Review', 'Client Review', 'Completed', 'In Progress', 'New', 'In Progress', 'Lead Review']
      const briefs = [
        'Need a modern logo for our tech startup focusing on AI solutions. Should be minimalist and convey innovation.',
        'Complete brand identity for sustainable fashion company. Looking for eco-friendly, elegant aesthetic.',
        'Social media graphics for Q1 product launch campaign. Need templates for Instagram, Facebook, LinkedIn.',
        'Website redesign for e-commerce platform. Modern, mobile-first approach with focus on conversion.',
        'Marketing materials for upcoming trade show booth including banners, brochures, and product sheets.',
        'Product packaging for organic food line. Must include nutrition facts and sustainable material options.',
        'Investor pitch deck with compelling visuals. 15-20 slides covering market, product, financials.',
        'Infographic explaining complex financial data. Make it accessible for general audience.',
        'Mobile app UI for fitness tracking application. Clean, motivating design with dark mode support.',
        'Responsive email templates for newsletter campaign. Professional design matching brand guidelines.'
      ]

      const dummyProjects = clientNames.map((client, index) => {
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + (index * 2) + 3)
        
        return {
          project_code: `BOLT_2025${String(Math.floor(Math.random() * 9000) + 1000).toString()}`,
          client_name: client.name,
          client_email: client.email,
          creative_type: creativeTypes[index],
          brief: briefs[index],
          status: statuses[index],
          deadline: deadline.toISOString(),
          lead_id: leadUser?.id || null,
          designer_id: (index % 3 === 0 && designerUser) ? designerUser.id : null,
          revision_count: Math.floor(Math.random() * 4)
        }
      })

      const { error: projectError } = await supabase
        .from('projects')
        .insert(dummyProjects)

      if (projectError) throw projectError

      toast({
        title: 'Success',
        description: `Added ${dummyProjects.length} new projects`
      })

      onDataAdded?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add projects',
        variant: 'destructive'
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const addDummyInvoices = async () => {
    setLoadingInvoices(true)
    try {
      // Get existing clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name')
        .limit(10)

      if (!clients || clients.length === 0) {
        toast({
          title: 'No clients found',
          description: 'Please add clients first before creating invoices.',
          variant: 'destructive'
        })
        return
      }

      // Get existing projects (optional linking)
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .limit(10)

      const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
      const dummyInvoices = []

      for (let i = 0; i < 10; i++) {
        const client = clients[i % clients.length]
        const project = projects?.[i % (projects?.length || 1)]
        const issueDate = new Date()
        issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 30))
        const dueDate = new Date(issueDate)
        dueDate.setDate(dueDate.getDate() + 30)
        
        const subtotal = Math.floor(Math.random() * 5000) + 500
        const taxRate = 10
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        dummyInvoices.push({
          invoice_number: `INV-2025-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          client_id: client.id,
          project_id: project?.id || null,
          issue_date: issueDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          notes: `Invoice for ${client.name} - Service ${i + 1}`
        })
      }

      const { data: insertedInvoices, error: invoiceError } = await supabase
        .from('invoices')
        .insert(dummyInvoices)
        .select()

      if (invoiceError) throw invoiceError

      // Add invoice items for each invoice
      const invoiceItems = []
      for (const invoice of insertedInvoices || []) {
        const itemCount = Math.floor(Math.random() * 3) + 1
        for (let j = 0; j < itemCount; j++) {
          const rate = Math.floor(Math.random() * 200) + 50
          const quantity = Math.floor(Math.random() * 10) + 1
          invoiceItems.push({
            invoice_id: invoice.id,
            description: ['Design Services', 'Consultation', 'Revisions', 'Project Management', 'Asset Creation'][Math.floor(Math.random() * 5)],
            quantity,
            rate,
            amount: rate * quantity
          })
        }
      }

      if (invoiceItems.length > 0) {
        await supabase.from('invoice_items').insert(invoiceItems)
      }

      toast({
        title: 'Success',
        description: `Added ${insertedInvoices?.length || 0} new invoices`
      })

      onDataAdded?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add invoices',
        variant: 'destructive'
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

  const addDummyRevisions = async () => {
    setLoadingRevisions(true)
    try {
      // Get existing projects
      const { data: projects } = await supabase
        .from('projects')
        .select('id, project_code')
        .limit(10)

      if (!projects || projects.length === 0) {
        toast({
          title: 'No projects found',
          description: 'Please add projects first before creating revisions.',
          variant: 'destructive'
        })
        return
      }

      const statuses = ['Draft', 'Pending Review', 'Approved', 'Rejected']
      const notes = [
        'Initial design concept based on brief requirements.',
        'Updated color palette per client feedback.',
        'Revised typography and layout adjustments.',
        'Final version with all requested changes.',
        'Minor tweaks to spacing and alignment.',
        'Added alternative version for comparison.',
        'Incorporated brand guidelines update.',
        'High-resolution export for print.',
        'Web-optimized version with compressed assets.',
        'Client-approved final delivery.'
      ]

      const dummyRevisions = []
      
      for (let i = 0; i < 10; i++) {
        const project = projects[i % projects.length]
        const versionNo = Math.floor(Math.random() * 5) + 1
        
        dummyRevisions.push({
          project_id: project.id,
          version_no: versionNo,
          file_url: `https://example.com/files/${project.project_code}/v${versionNo}/design.pdf`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          note: notes[i]
        })
      }

      const { data: insertedRevisions, error: revisionError } = await supabase
        .from('revisions')
        .insert(dummyRevisions)
        .select()

      if (revisionError) throw revisionError

      toast({
        title: 'Success',
        description: `Added ${insertedRevisions?.length || 0} new revisions`
      })

      onDataAdded?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add revisions',
        variant: 'destructive'
      })
    } finally {
      setLoadingRevisions(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={addDummyClients} 
        disabled={loadingClients}
        variant="outline"
        size="sm"
      >
        <Users className="h-4 w-4 mr-2" />
        {loadingClients ? 'Adding...' : 'Add 10 Clients'}
      </Button>
      <Button 
        onClick={addDummyProjects} 
        disabled={loadingProjects}
        variant="outline"
        size="sm"
      >
        <FolderKanban className="h-4 w-4 mr-2" />
        {loadingProjects ? 'Adding...' : 'Add 10 Projects'}
      </Button>
      <Button 
        onClick={addDummyInvoices} 
        disabled={loadingInvoices}
        variant="outline"
        size="sm"
      >
        <Receipt className="h-4 w-4 mr-2" />
        {loadingInvoices ? 'Adding...' : 'Add 10 Invoices'}
      </Button>
      <Button 
        onClick={addDummyRevisions} 
        disabled={loadingRevisions}
        variant="outline"
        size="sm"
      >
        <FileStack className="h-4 w-4 mr-2" />
        {loadingRevisions ? 'Adding...' : 'Add 10 Revisions'}
      </Button>
    </div>
  )
}
