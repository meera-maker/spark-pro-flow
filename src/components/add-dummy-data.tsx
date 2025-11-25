import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Database, Plus } from "lucide-react"
import { useState } from "react"

export function AddDummyData({ onDataAdded }: { onDataAdded?: () => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const addDummyData = async () => {
    setLoading(true)
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

      // Dummy clients data
      const dummyClients = [
        { name: 'Sarah Martinez', email: 'sarah.martinez@techcorp.com', company: 'TechCorp Solutions', phone: '+1-555-0101', address: '123 Tech Street, San Francisco, CA 94105', payment_terms: 'Net 30' },
        { name: 'James Wilson', email: 'james.wilson@innovate.com', company: 'Innovate Digital', phone: '+1-555-0102', address: '456 Innovation Ave, Austin, TX 78701', payment_terms: 'Net 15' },
        { name: 'Emily Chen', email: 'emily.chen@bluewave.com', company: 'BlueWave Marketing', phone: '+1-555-0103', address: '789 Ocean Blvd, Miami, FL 33139', payment_terms: 'Net 30' },
        { name: 'Michael Brown', email: 'michael.brown@zenith.com', company: 'Zenith Industries', phone: '+1-555-0104', address: '321 Mountain Rd, Denver, CO 80202', payment_terms: 'Net 45' },
        { name: 'Jessica Taylor', email: 'jessica.taylor@nexus.com', company: 'Nexus Ventures', phone: '+1-555-0105', address: '654 Business Park, Seattle, WA 98101', payment_terms: 'Net 30' },
        { name: 'David Lee', email: 'david.lee@primetech.com', company: 'PrimeTech Labs', phone: '+1-555-0106', address: '987 Research Dr, Boston, MA 02108', payment_terms: 'Net 15' },
        { name: 'Amanda Rodriguez', email: 'amanda.r@stellar.com', company: 'Stellar Brands', phone: '+1-555-0107', address: '147 Commerce St, Chicago, IL 60601', payment_terms: 'Net 30' },
        { name: 'Robert Kim', email: 'robert.kim@apex.com', company: 'Apex Media Group', phone: '+1-555-0108', address: '258 Creative Way, Los Angeles, CA 90001', payment_terms: 'Net 30' },
        { name: 'Lisa Anderson', email: 'lisa.anderson@fusion.com', company: 'Fusion Enterprises', phone: '+1-555-0109', address: '369 Corporate Ln, Dallas, TX 75201', payment_terms: 'Net 45' },
        { name: 'Thomas Garcia', email: 'thomas.garcia@vortex.com', company: 'Vortex Digital', phone: '+1-555-0110', address: '741 Tech Plaza, Portland, OR 97201', payment_terms: 'Net 30' }
      ]

      // Insert clients
      const { data: insertedClients, error: clientError } = await supabase
        .from('clients')
        .insert(dummyClients)
        .select()

      if (clientError) throw clientError

      if (!insertedClients || insertedClients.length === 0) {
        throw new Error('Failed to insert clients')
      }

      // Dummy projects using inserted clients
      const creativeTypes = ['Logo Design', 'Brand Identity', 'Social Media Graphics', 'Website Design', 'Marketing Collateral', 'Packaging Design', 'Presentation Design', 'Infographic', 'App UI Design', 'Email Template']
      const statuses = ['New', 'In Progress', 'Lead Review', 'QC Review', 'Client Review', 'Completed', 'In Progress', 'New', 'In Progress', 'Completed']
      const briefs = [
        'Need a modern logo for our tech startup focusing on AI solutions',
        'Complete brand identity for sustainable fashion company',
        'Social media graphics for product launch campaign',
        'Website redesign for e-commerce platform',
        'Marketing materials for trade show booth',
        'Product packaging for organic food line',
        'Investor pitch deck with compelling visuals',
        'Infographic explaining complex financial data',
        'Mobile app UI for fitness tracking application',
        'Responsive email templates for newsletter campaign'
      ]

      const dummyProjects = insertedClients.map((client, index) => {
        const deadline = new Date()
        deadline.setDate(deadline.getDate() + (index * 3) + 5)
        
        return {
          project_code: `BOLT_2025${String(index + 1).padStart(4, '0')}`,
          client_name: client.name,
          client_email: client.email,
          creative_type: creativeTypes[index],
          brief: briefs[index],
          status: statuses[index],
          deadline: deadline.toISOString(),
          lead_id: leadUser.id,
          designer_id: index % 2 === 0 ? designerUser.id : null,
          revision_count: Math.floor(Math.random() * 3)
        }
      })

      // Insert projects
      const { error: projectError } = await supabase
        .from('projects')
        .insert(dummyProjects)

      if (projectError) throw projectError

      toast({
        title: 'Success',
        description: `Added ${insertedClients.length} clients and ${dummyProjects.length} projects`
      })

      onDataAdded?.()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add dummy data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={addDummyData} 
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Database className="h-4 w-4 mr-2" />
      {loading ? 'Adding...' : 'Add Dummy Data'}
    </Button>
  )
}
