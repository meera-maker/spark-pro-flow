import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Clock, User2 } from "lucide-react"

export interface AssignmentRecord {
  id: string
  fromUser: string
  toUser: string
  timestamp: Date
  type: 'assignment' | 'transfer'
  role: string
  notes?: string
}

interface AssignmentHistoryProps {
  assignments: AssignmentRecord[]
}

export function AssignmentHistory({ assignments }: AssignmentHistoryProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User2 className="h-5 w-5" />
          Assignment & Transfer History
        </CardTitle>
        <CardDescription>
          Track who has worked on this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {getInitials(assignment.fromUser)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{assignment.fromUser}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{assignment.toUser}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={assignment.type === 'transfer' ? 'secondary' : 'default'} className="text-xs">
                      {assignment.type === 'transfer' ? 'Transferred' : 'Assigned'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {assignment.role}
                    </Badge>
                  </div>
                  {assignment.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {assignment.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(assignment.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {assignments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No assignment history yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
