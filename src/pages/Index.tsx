import { useState } from "react"
import { Navigation } from "@/components/ui/navigation"
import { ClientIntakeForm } from "@/components/client-intake-form"
import { ProjectsDashboard } from "@/components/projects-dashboard"
import { ProjectDetail } from "@/components/project-detail"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type View = "home" | "intake" | "dashboard" | "project-detail"

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("home")

  if (currentView === "intake") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("home")}
            className="mb-4"
          >
            ← Back to Home
          </Button>
          <ClientIntakeForm />
        </div>
      </div>
    )
  }

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("home")}
            className="m-4"
          >
            ← Back to Home
          </Button>
          <ProjectsDashboard />
        </div>
      </div>
    )
  }

  if (currentView === "project-detail") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView("dashboard")}
            className="m-4"
          >
            ← Back to Dashboard
          </Button>
          <ProjectDetail />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
              Creative Project Management
              <span className="block gradient-orange bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Streamline your agency workflow from client intake to project delivery. 
              Manage deadlines, revisions, and team collaboration in one beautiful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="gradient-orange text-white hover:opacity-90 px-8 py-4 text-lg"
                onClick={() => setCurrentView("intake")}
              >
                Start New Project
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg border-2 hover:border-orange hover:text-orange"
                onClick={() => setCurrentView("dashboard")}
              >
                View Dashboard
              </Button>
            </div>

            <Badge variant="outline" className="text-orange border-orange/30 bg-orange/5">
              ⚡ Connect Supabase for full functionality - authentication, database, notifications
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Complete workflow management for creative agencies</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    📝
                  </div>
                  Client Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Streamlined forms for clients to submit project details, references, and assets automatically.</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    📊
                  </div>
                  Project Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Comprehensive overview of all projects with status tracking, deadline monitoring, and team assignments.</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    🔄
                  </div>
                  Revision Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Complete version history with notes, file uploads, and approval workflows for seamless collaboration.</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    👥
                  </div>
                  Team Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Role-based access for admins, leads, designers, and clients with appropriate permissions.</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    📧
                  </div>
                  Smart Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Automated email alerts for project updates, deadline reminders, and client approvals.</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    🔗
                  </div>
                  Client Previews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Secure preview pages for client review with simple approve/revision request buttons.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Links */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-8">Explore the Platform</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setCurrentView("intake")}
              className="border-2 hover:border-orange hover:text-orange"
            >
              📝 Try Client Intake Form
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setCurrentView("dashboard")}
              className="border-2 hover:border-orange hover:text-orange"
            >
              📊 View Project Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setCurrentView("project-detail")}
              className="border-2 hover:border-orange hover:text-orange"
            >
              🔍 See Project Details
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
