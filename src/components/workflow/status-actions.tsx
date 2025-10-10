import { Button } from '@/components/ui/button'
import { useWorkflow } from '@/hooks/useWorkflow'
import { WorkflowStatus } from '@/types/workflow'
import { AssignmentDialog } from './assignment-dialog'
import { CheckCircle, XCircle, Send, ArrowRight } from 'lucide-react'

interface StatusActionsProps {
  projectId: string
  currentStatus: WorkflowStatus
  currentAssignee: string
  onStatusChange: (newStatus: WorkflowStatus, assignedTo?: string, notes?: string) => void
}

export function StatusActions({ projectId, currentStatus, currentAssignee, onStatusChange }: StatusActionsProps) {
  const { currentUser } = useWorkflow()
  
  const isCurrentAssignee = currentUser?.id === currentAssignee
  const isQC = currentUser?.role === 'QC'
  const isDesigner = currentUser?.role === 'Designer'
  const isLead = currentUser?.role === 'Lead'
  
  const handleAssignment = (userId: string, notes?: string) => {
    let newStatus: WorkflowStatus
    
    switch (currentStatus) {
      case 'intake':
        newStatus = 'assigned-to-cs'
        break
      case 'assigned-to-cs':
        newStatus = 'assigned-to-design-head'
        break
      case 'assigned-to-design-head':
        newStatus = 'assigned-to-designer'
        break
      case 'assigned-to-designer':
        newStatus = 'in-design'
        break
      case 'qc-revision-needed':
        newStatus = 'in-design'
        break
      default:
        newStatus = currentStatus
    }
    
    onStatusChange(newStatus, userId, notes)
  }
  
  const handleStatusUpdate = (newStatus: WorkflowStatus, notes?: string) => {
    onStatusChange(newStatus, currentAssignee, notes)
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {/* Assignment actions */}
      <AssignmentDialog
        projectId={projectId}
        currentStatus={currentStatus}
        onAssign={handleAssignment}
      />
      
      {/* Designer actions */}
      {isDesigner && isCurrentAssignee && currentStatus === 'in-design' && (
        <Button 
          onClick={() => handleStatusUpdate('design-complete')}
          className="gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Mark Complete
        </Button>
      )}
      
      {/* QC actions */}
      {isQC && isCurrentAssignee && currentStatus === 'design-complete' && (
        <>
          <Button 
            onClick={() => handleStatusUpdate('qc-approved')}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button 
            variant="destructive"
            onClick={() => handleStatusUpdate('qc-revision-needed')}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Request Revision
          </Button>
        </>
      )}
      
      {/* Lead actions */}
      {isLead && isCurrentAssignee && currentStatus === 'qc-approved' && (
        <Button 
          onClick={() => handleStatusUpdate('sent-to-client')}
          className="gap-2"
        >
          <Send className="h-4 w-4" />
          Send to Client
        </Button>
      )}
      
      {isLead && isCurrentAssignee && currentStatus === 'sent-to-client' && (
        <>
          <Button 
            onClick={() => handleStatusUpdate('client-approved')}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Client Approved
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleStatusUpdate('revision-requested')}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Client Requested Revision
          </Button>
        </>
      )}
      
      {(isLead || isCurrentAssignee) && currentStatus === 'client-approved' && (
        <Button 
          onClick={() => handleStatusUpdate('completed')}
          className="gap-2"
          variant="default"
        >
          <CheckCircle className="h-4 w-4" />
          Mark as Completed
        </Button>
      )}
    </div>
  )
}