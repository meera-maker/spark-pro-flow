import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, WorkflowStatus } from '@/types/workflow'
import { useWorkflow } from '@/hooks/useWorkflow'
import { UserPlus } from 'lucide-react'

interface AssignmentDialogProps {
  projectId: string
  currentStatus: WorkflowStatus
  onAssign: (userId: string, notes?: string) => void
  children?: React.ReactNode
}

export function AssignmentDialog({ projectId, currentStatus, onAssign, children }: AssignmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [notes, setNotes] = useState('')
  const { getNextAssignees, currentUser, canAssign } = useWorkflow()
  
  const nextAssignees = getNextAssignees(currentStatus)
  
  // Handle case where currentUser is null (not loaded yet)
  if (!currentUser) {
    return null
  }
  
  const canUserAssign = canAssign(currentStatus, currentUser.role)
  
  const handleAssign = () => {
    if (selectedUser) {
      onAssign(selectedUser, notes)
      setOpen(false)
      setSelectedUser('')
      setNotes('')
    }
  }
  
  if (!canUserAssign || nextAssignees.length === 0) {
    return null
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Assign
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Project {projectId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="assignee">Assign to</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Select user to assign" />
              </SelectTrigger>
              <SelectContent>
                {nextAssignees.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || 'User'} ({user.userRole || 'Unknown Role'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or instructions..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedUser}>
              Assign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}