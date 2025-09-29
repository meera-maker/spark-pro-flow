import { Navigation } from "@/components/ui/navigation"
import { MemberManagement } from "@/components/members/MemberManagement"

const Members = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <MemberManagement />
      </div>
    </div>
  )
}

export default Members