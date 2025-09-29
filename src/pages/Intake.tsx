import { Navigation } from "@/components/ui/navigation"
import { ClientIntakeForm } from "@/components/client-intake-form"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

const Intake = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            ← Back to Home
          </Button>
        </Link>
        <ClientIntakeForm />
      </div>
    </div>
  )
}

export default Intake