import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Navigation } from "@/components/ui/navigation"
import { ProjectsDashboard } from "@/components/projects-dashboard"
import { ProjectDetail } from "@/components/project-detail"
import { Button } from "@/components/ui/button"

const Projects = () => {
  const { projectId } = useParams()

  if (projectId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-8">
          <Link to="/projects">
            <Button variant="ghost" className="mb-4">
              ← Back to Projects
            </Button>
          </Link>
          <ProjectDetail />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <ProjectsDashboard />
      </div>
    </div>
  )
}

export default Projects