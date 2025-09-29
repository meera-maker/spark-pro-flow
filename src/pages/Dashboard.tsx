import { Navigation } from "@/components/ui/navigation"
import { DashboardStats } from "@/components/dashboard-stats"

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <DashboardStats />
      </div>
    </div>
  )
}

export default Dashboard