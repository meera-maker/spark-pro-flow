import { Navigation } from "@/components/ui/navigation"
import { BillingDashboard } from "@/components/billing/BillingDashboard"

const Billing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <BillingDashboard />
      </div>
    </div>
  )
}

export default Billing