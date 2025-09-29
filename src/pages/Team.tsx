import { Navigation } from "@/components/ui/navigation"
import { TeamManagement } from "@/components/management/team-management"
import { ClientManagement } from "@/components/management/client-management"
import { ProjectManagement } from "@/components/management/project-management"
import { InvoiceManagement } from "@/components/management/invoice-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FolderKanban, Building2, Receipt } from "lucide-react"

const Team = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Management</h1>
          <p className="text-muted-foreground">Manage your team, clients, projects, and billing</p>
        </div>
        
        <Tabs defaultValue="team" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="team">
              <Users className="h-4 w-4 mr-2" />
              Team
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Building2 className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Receipt className="h-4 w-4 mr-2" />
              Billing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="team">
            <TeamManagement />
          </TabsContent>
          
          <TabsContent value="clients">
            <ClientManagement />
          </TabsContent>
          
          <TabsContent value="projects">
            <ProjectManagement />
          </TabsContent>
          
          <TabsContent value="billing">
            <InvoiceManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Team
