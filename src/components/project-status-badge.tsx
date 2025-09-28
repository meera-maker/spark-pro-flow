import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type ProjectStatus = 
  | "New" 
  | "In Progress" 
  | "Lead Review" 
  | "Client Review" 
  | "Revision" 
  | "Approved" 
  | "Completed"

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig = {
  "New": { 
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300", 
    icon: "🆕" 
  },
  "In Progress": { 
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300", 
    icon: "⚡" 
  },
  "Lead Review": { 
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300", 
    icon: "👁️" 
  },
  "Client Review": { 
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300", 
    icon: "📋" 
  },
  "Revision": { 
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300", 
    icon: "🔄" 
  },
  "Approved": { 
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300", 
    icon: "✅" 
  },
  "Completed": { 
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300", 
    icon: "🎉" 
  }
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, "gap-1", className)}
    >
      <span className="text-xs">{config.icon}</span>
      {status}
    </Badge>
  )
}