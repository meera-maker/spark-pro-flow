import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink } from 'lucide-react'

export function SupabaseConnectionError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Supabase Connection Required</CardTitle>
          </div>
          <CardDescription>
            Your project needs to be connected to Supabase to use authentication and database features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">To connect Supabase:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click the green <strong>Supabase</strong> button in the top right</li>
              <li>Follow the connection setup process</li>
              <li>Refresh the page once connected</li>
            </ol>
          </div>
          
          <Button asChild className="w-full">
            <a 
              href="https://docs.lovable.dev/integrations/supabase" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Setup Guide
            </a>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}