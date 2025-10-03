import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react"

export type ProjectStage = 'planning' | 'design' | 'review' | 'completed'

interface ProjectStagesProps {
  currentStage: ProjectStage
  onStageClick: (stage: ProjectStage) => void
}

const stages: { stage: ProjectStage; label: string; icon: typeof Circle }[] = [
  { stage: 'planning', label: 'Planning', icon: Clock },
  { stage: 'design', label: 'Design', icon: Circle },
  { stage: 'review', label: 'Review', icon: AlertTriangle },
  { stage: 'completed', label: 'Completed', icon: CheckCircle2 }
]

export function ProjectStages({ currentStage, onStageClick }: ProjectStagesProps) {
  const getStageColor = (stage: ProjectStage, isCurrent: boolean) => {
    if (isCurrent) {
      return 'bg-primary text-primary-foreground hover:bg-primary/90'
    }
    
    const stageIndex = stages.findIndex(s => s.stage === stage)
    const currentIndex = stages.findIndex(s => s.stage === currentStage)
    
    if (stageIndex < currentIndex) {
      return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100'
    }
    
    return 'bg-muted text-muted-foreground hover:bg-muted/80'
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {stages.map(({ stage, label, icon: Icon }, index) => {
            const isCurrent = stage === currentStage
            const stageIndex = stages.findIndex(s => s.stage === stage)
            const currentIndex = stages.findIndex(s => s.stage === currentStage)
            const isCompleted = stageIndex < currentIndex

            return (
              <button
                key={stage}
                onClick={() => onStageClick(stage)}
                className="relative group transition-all"
              >
                <div className={`flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer transition-all ${getStageColor(stage, isCurrent)}`}>
                  <Icon className={`h-6 w-6 ${isCompleted ? 'text-green-600 dark:text-green-400' : ''}`} />
                  <span className="text-sm font-medium">{label}</span>
                  {isCurrent && (
                    <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                      Current
                    </Badge>
                  )}
                </div>
                {index < stages.length - 1 && (
                  <div className="absolute top-1/2 right-0 w-4 h-0.5 bg-border transform translate-x-full -translate-y-1/2 hidden md:block" />
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
