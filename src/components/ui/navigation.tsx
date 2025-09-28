import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  return (
    <nav className={cn("border-b bg-card", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-orange" />
              <span className="text-xl font-bold text-primary">SparkPro Creative</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-primary hover:text-orange">
                Dashboard
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-orange">
                Projects
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-orange">
                Clients
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-orange">
                Team
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-orange/10 text-orange border-orange/20">
              Connect Supabase for Full Features
            </Badge>
            <Button variant="outline">Sign In</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}