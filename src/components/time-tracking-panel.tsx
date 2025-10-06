import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Clock, Play, Square, Save } from "lucide-react"
import { Database } from "@/integrations/supabase/types"

type Project = Database['public']['Tables']['projects']['Row']

interface TimeTrackingPanelProps {
  projectId: string
  projectCode: string
}

export function TimeTrackingPanel({ projectId, projectCode }: TimeTrackingPanelProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('project_code', projectCode)
        .maybeSingle()

      if (error) throw error
      if (data) {
        setProject(data)
        setStartTime(data.design_start_time ? new Date(data.design_start_time) : null)
        setEndTime(data.design_end_time ? new Date(data.design_end_time) : null)
        setNotes(data.designer_notes || "")
        setIsTracking(!!data.design_start_time && !data.design_end_time)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load time tracking data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartTracking = async () => {
    const now = new Date()
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          design_start_time: now.toISOString(),
          status: 'In Progress'
        })
        .eq('project_code', projectCode)

      if (error) throw error

      setStartTime(now)
      setIsTracking(true)
      toast({
        title: "Timer Started",
        description: "Design time tracking has begun"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start tracking",
        variant: "destructive"
      })
    }
  }

  const handleStopTracking = async () => {
    const now = new Date()
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          design_end_time: now.toISOString(),
          designer_notes: notes
        })
        .eq('project_code', projectCode)

      if (error) throw error

      setEndTime(now)
      setIsTracking(false)
      toast({
        title: "Timer Stopped",
        description: "Design time has been recorded"
      })
      
      fetchProject() // Refresh to get calculated hours
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to stop tracking",
        variant: "destructive"
      })
    }
  }

  const handleSaveNotes = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          designer_notes: notes
        })
        .eq('project_code', projectCode)

      if (error) throw error

      toast({
        title: "Saved",
        description: "Designer notes updated"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      })
    }
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Not started"
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatHours = (hours: number | null) => {
    if (!hours) return "0.0"
    return hours.toFixed(2)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Design Time Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Start Time</Label>
            <div className="text-sm font-medium">{formatDateTime(startTime)}</div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">End Time</Label>
            <div className="text-sm font-medium">{formatDateTime(endTime)}</div>
          </div>
        </div>

        {/* Total Hours */}
        <div className="p-4 bg-primary/5 rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Total Design Hours</div>
          <div className="text-3xl font-bold text-primary">
            {formatHours(project?.total_design_hours || 0)} hrs
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2">
          {!isTracking ? (
            <Button 
              onClick={handleStartTracking} 
              className="flex-1"
              disabled={!!endTime}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          ) : (
            <Button 
              onClick={handleStopTracking} 
              className="flex-1"
              variant="destructive"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Timer
            </Button>
          )}
        </div>

        {/* Designer Notes */}
        <div className="space-y-2">
          <Label htmlFor="designer-notes">Designer Notes</Label>
          <Textarea
            id="designer-notes"
            placeholder="Add notes about your design work, challenges, decisions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSaveNotes} variant="outline" size="sm" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Notes
          </Button>
        </div>

        {/* Info */}
        {isTracking && (
          <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            ⏱️ Timer is running. Stop the timer when you complete your design work.
          </div>
        )}
      </CardContent>
    </Card>
  )
}