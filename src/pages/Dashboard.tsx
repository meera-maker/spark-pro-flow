import { Navigation } from "@/components/ui/navigation"
import { ProjectsDashboard } from "@/components/projects-dashboard"

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <ProjectsDashboard />
      </div>
    </div>
  )
}

export default Dashboard