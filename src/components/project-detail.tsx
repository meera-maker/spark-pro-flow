import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ProjectStatusBadge } from "./project-status-badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Calendar, 
  User, 
  FileText, 
  Upload, 
  Send, 
  UserPlus, 
  MessageCircle,
  ExternalLink,
  Clock,
  Download
} from "lucide-react"

// Mock project data
const mockProject = {
  id: "SP001",
  client: "TechCorp Solutions", 
  clientEmail: "sarah@techcorp.com",
  creativeType: "Brand Identity",
  deadline: "2024-01-15",
  lead: "Alex Chen",
  designer: "Maria Rodriguez",
  status: "In Progress" as const,
  revisionCount: 2,
  brief: "We need a complete brand identity for our new fintech startup. The brand should convey trust, innovation, and accessibility. We're targeting young professionals aged 25-40 who are tech-savvy but want simplified financial tools. The aesthetic should be modern, clean, and professional while remaining approachable.",
  referenceLinks: [
    "https://stripe.com/brand",
    "https://monzo.com/press/brand-guidelines",
    "https://revolut.com/brand"
  ],
  driveFolderUrl: "https://drive.google.com/drive/folders/1abc123...",
  createdAt: "2024-01-01"
}

const mockRevisions = [
  {
    id: 1,
    version: "v1.0",
    uploadedBy: "Maria Rodriguez",
    note: "Initial brand concepts with 3 logo variations",
    fileUrl: "https://example.com/file1.pdf",
    timestamp: "2024-01-08 10:30 AM",
    type: "Designer Upload"
  },
  {
    id: 2,
    version: "v1.1", 
    uploadedBy: "Alex Chen",
    note: "Client feedback: Prefer option 2, but make the icon more prominent",
    fileUrl: null,
    timestamp: "2024-01-09 2:15 PM", 
    type: "Lead Review"
  },
  {
    id: 3,
    version: "v2.0",
    uploadedBy: "Maria Rodriguez", 
    note: "Updated logo with larger icon, added color palette and typography",
    fileUrl: "https://example.com/file2.pdf",
    timestamp: "2024-01-10 11:45 AM",
    type: "Designer Upload"
  }
]

export function ProjectDetail() {
  const [revisionNote, setRevisionNote] = useState("")

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-primary">{mockProject.id}</h1>
            <ProjectStatusBadge status={mockProject.status} />
          </div>
          <p className="text-xl text-muted-foreground">{mockProject.client}</p>
          <p className="text-sm text-muted-foreground">{mockProject.creativeType}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Designer
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Submit Draft
          </Button>
          <Button className="gradient-blue text-white">
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Brief
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{mockProject.brief}</p>
              
              {mockProject.referenceLinks.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Reference Links:</h4>
                  <div className="space-y-1">
                    {mockProject.referenceLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {mockProject.driveFolderUrl && (
                <div className="mt-4">
                  <a 
                    href={mockProject.driveFolderUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Google Drive Assets
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Revision History */}
          <Card>
            <CardHeader>
              <CardTitle>Revision History</CardTitle>
              <CardDescription>Track all project updates and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRevisions.map((revision, index) => (
                  <div key={revision.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant={revision.type === "Designer Upload" ? "default" : "secondary"}>
                          {revision.version}
                        </Badge>
                        <span className="text-sm font-medium">{revision.uploadedBy}</span>
                        <Badge variant="outline" className="text-xs">
                          {revision.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {revision.timestamp}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{revision.note}</p>
                    
                    {revision.fileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-2" />
                        Download File
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add New Revision */}
              <Separator className="my-6" />
              <div className="space-y-3">
                <h4 className="font-medium">Add Revision Note</h4>
                <Textarea 
                  placeholder="Add notes for this revision..."
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deadline</p>
                  <p className="text-sm text-red-600 font-medium">
                    {new Date(mockProject.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Project Lead</p>
                  <p className="text-sm text-muted-foreground">{mockProject.lead}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Designer</p>
                  <p className="text-sm text-muted-foreground">{mockProject.designer}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Revisions</p>
                  <Badge variant={mockProject.revisionCount > 2 ? "destructive" : "secondary"}>
                    {mockProject.revisionCount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mockProject.client}</p>
                  <p className="text-sm text-muted-foreground">{mockProject.clientEmail}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Version
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageCircle className="h-4 w-4 mr-2" />
                Request Revision
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="h-4 w-4 mr-2" />
                Send Preview Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}