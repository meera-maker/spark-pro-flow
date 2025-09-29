import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkflowStep } from '@/types/workflow'
import { useWorkflow } from '@/hooks/useWorkflow'
import { Clock, User, MessageSquare } from 'lucide-react'

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
}

export function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  const { users, getStatusColor } = useWorkflow()
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user?.name || 'Unknown User'
  }
  
  const formatStatus = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Workflow Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.length === 0 ? (
            <p className="text-muted-foreground">No workflow steps yet.</p>
          ) : (
            steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getStatusColor(step.status)}>
                      {formatStatus(step.status)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {step.timestamp.toLocaleDateString()} at {step.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3" />
                    <span>Assigned to: <strong>{getUserName(step.assignedTo)}</strong></span>
                    <span className="text-muted-foreground">by {getUserName(step.assignedBy)}</span>
                  </div>
                  {step.notes && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{step.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}