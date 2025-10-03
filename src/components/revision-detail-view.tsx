import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Download, 
  Upload, 
  MessageCircle, 
  Clock, 
  FileText,
  Image as ImageIcon,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from "lucide-react"

export interface Revision {
  id: string
  version: string
  uploadedBy: string
  uploadedById: string
  timestamp: Date
  type: 'design' | 'review' | 'client-feedback' | 'final'
  notes: string
  fileUrl?: string
  fileType?: 'pdf' | 'image' | 'video'
  status: 'pending' | 'approved' | 'rejected' | 'archived'
  approvedBy?: string
  feedback?: string
}

interface RevisionDetailViewProps {
  revisions: Revision[]
  onAddRevision: (notes: string, file?: File) => void
  onApprove: (revisionId: string, notes: string) => void
  onReject: (revisionId: string, notes: string) => void
}

export function RevisionDetailView({ 
  revisions, 
  onAddRevision,
  onApprove,
  onReject
}: RevisionDetailViewProps) {
  const [newRevisionNote, setNewRevisionNote] = useState("")
  const [feedbackNote, setFeedbackNote] = useState("")
  const [selectedRevision, setSelectedRevision] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getStatusColor = (status: Revision['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const getTypeIcon = (type: Revision['type']) => {
    switch (type) {
      case 'design':
        return <FileText className="h-4 w-4" />
      case 'review':
        return <Eye className="h-4 w-4" />
      case 'client-feedback':
        return <MessageCircle className="h-4 w-4" />
      case 'final':
        return <ThumbsUp className="h-4 w-4" />
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Detailed Revision History
        </CardTitle>
        <CardDescription>
          Complete timeline of all project iterations and feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revisions Timeline */}
          <div className="space-y-4">
            {revisions.map((revision, index) => (
              <div
                key={revision.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedRevision(
                  selectedRevision === revision.id ? null : revision.id
                )}
              >
                {/* Revision Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(revision.uploadedBy)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{revision.version}</Badge>
                        <span className="font-medium text-sm">{revision.uploadedBy}</span>
                        <Badge variant="outline" className="text-xs">
                          {getTypeIcon(revision.type)}
                          <span className="ml-1 capitalize">{revision.type.replace('-', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(revision.timestamp)}
                      </div>
                    </div>
                  </div>

                  <Badge className={getStatusColor(revision.status)}>
                    {revision.status}
                  </Badge>
                </div>

                {/* Revision Content */}
                <p className="text-sm text-muted-foreground mb-3 pl-13">
                  {revision.notes}
                </p>

                {/* File Actions */}
                {revision.fileUrl && (
                  <div className="flex gap-2 pl-13">
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={revision.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Open
                      </a>
                    </Button>
                  </div>
                )}

                {/* Feedback Section (Expandable) */}
                {selectedRevision === revision.id && revision.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t space-y-3 pl-13">
                    <Textarea
                      placeholder="Add feedback or approval notes..."
                      value={feedbackNote}
                      onChange={(e) => setFeedbackNote(e.target.value)}
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          onApprove(revision.id, feedbackNote)
                          setFeedbackNote("")
                          setSelectedRevision(null)
                        }}
                      >
                        <ThumbsUp className="h-3 w-3 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          onReject(revision.id, feedbackNote)
                          setFeedbackNote("")
                          setSelectedRevision(null)
                        }}
                      >
                        <ThumbsDown className="h-3 w-3 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Existing Feedback */}
                {revision.feedback && (
                  <div className="mt-3 pt-3 border-t pl-13">
                    <p className="text-xs font-medium mb-1">
                      {revision.status === 'approved' ? 'Approved by' : 'Feedback from'} {revision.approvedBy}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      "{revision.feedback}"
                    </p>
                  </div>
                )}
              </div>
            ))}

            {revisions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No revisions uploaded yet
              </div>
            )}
          </div>

          {/* Add New Revision */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Upload New Revision</h4>
            <Textarea
              placeholder="Add notes for this revision..."
              value={newRevisionNote}
              onChange={(e) => setNewRevisionNote(e.target.value)}
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (newRevisionNote.trim()) {
                    onAddRevision(newRevisionNote)
                    setNewRevisionNote("")
                  }
                }}
                disabled={!newRevisionNote.trim()}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Submit Revision
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
