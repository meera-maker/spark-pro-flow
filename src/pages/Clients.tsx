import { Navigation } from "@/components/ui/navigation"
import { ClientManagement } from "@/components/management/client-management"

const Clients = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <ClientManagement />
      </div>
    </div>
  )
}

export default Clients