import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Users, FolderKanban } from "lucide-react"
import { useState } from "react"

export function AddDummyData({ onDataAdded }: { onDataAdded?: () => void }) {
  const { toast } = useToast()
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(false)

  const addDummyClients = async () => {
    setLoadingClients(true)
    try {
      // 10 diverse clients
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
      // Get existing users for assignment
      const { data: users } = await supabase
        .from('users')
        .select('id, role')
        .limit(5)

      if (!users || users.length === 0) {
        throw new Error('No users found. Please create users first.')
      }

      const leadUser = users.find(u => u.role === 'Lead') || users[0]
      const designerUser = users.find(u => u.role === 'Designer') || users[1] || users[0]

      // Get existing clients to assign projects to
      const { data: clients } = await supabase
        .from('clients')
        .select('name, email')
        .limit(10)

      if (!clients || clients.length === 0) {
        throw new Error('No clients found. Please add clients first.')
      }

      // Dummy projects using existing clients
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

      const dummyProjects = clients.slice(0, 10).map((client, index) => {
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
          lead_id: leadUser.id,
          designer_id: index % 3 === 0 ? designerUser.id : null,
          revision_count: Math.floor(Math.random() * 4)
        }
      })

      // Insert projects
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

  return (
    <div className="flex gap-2">
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
    </div>
  )
}
