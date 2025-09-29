import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    await signOut()
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully'
    })
    navigate('/login')
  }
  
  return (
    <nav className={cn("border-b bg-card", className)}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-blue" />
              <span className="text-xl font-bold text-primary">SparkPro Creative</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard">
                <Button variant="ghost" className={isActive('/dashboard') ? "text-blue" : "text-muted-foreground hover:text-blue"}>
                  Dashboard
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="ghost" className={isActive('/projects') ? "text-blue" : "text-muted-foreground hover:text-blue"}>
                  Projects
                </Button>
              </Link>
              <Link to="/clients">
                <Button variant="ghost" className={isActive('/clients') ? "text-blue" : "text-muted-foreground hover:text-blue"}>
                  Clients
                </Button>
              </Link>
              <Link to="/team">
                <Button variant="ghost" className={isActive('/team') ? "text-blue" : "text-muted-foreground hover:text-blue"}>
                  Management
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && profile && (
              <div className="hidden md:block text-sm text-muted-foreground">
                {profile.name} <span className="text-xs">({profile.role})</span>
              </div>
            )}
            {user ? (
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
