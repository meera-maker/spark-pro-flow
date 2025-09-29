import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, X } from 'lucide-react'
import { Notification } from '@/types/workflow'

interface NotificationsPanelProps {
  notifications: Notification[]
  onMarkAsRead: (message: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationsPanel({ notifications, onMarkAsRead, onMarkAllAsRead }: NotificationsPanelProps) {
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return '👤'
      case 'revision':
        return '🔄'
      case 'approval':
        return '✅'
      case 'completion':
        return '🎉'
      default:
        return '📌'
    }
  }
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-800'
      case 'revision':
        return 'bg-orange-100 text-orange-800'
      case 'approval':
        return 'bg-green-100 text-green-800'
      case 'completion':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="gap-2"
            >
              <Check className="h-3 w-3" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No notifications</p>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${!notification.read ? 'bg-muted/50' : 'bg-background'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.timestamp.toLocaleDateString()} at {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.message)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
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