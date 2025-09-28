import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

export function ClientIntakeForm() {
  const [date, setDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    alert("Project submitted! Our team will review and get back to you soon.")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Start Your Creative Project</h1>
        <p className="text-xl text-muted-foreground">Tell us about your vision and we'll bring it to life</p>
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader className="gradient-primary text-white">
          <CardTitle className="text-2xl">Project Brief</CardTitle>
          <CardDescription className="text-white/80">
            Provide us with the details we need to create something amazing
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand Name *</Label>
                <Input 
                  id="brand-name" 
                  placeholder="Enter your brand name" 
                  required 
                  className="border-2 focus:border-blue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-email">Contact Email *</Label>
                <Input 
                  id="client-email" 
                  type="email" 
                  placeholder="you@company.com" 
                  required 
                  className="border-2 focus:border-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="creative-type">Creative Type *</Label>
                <Select required>
                  <SelectTrigger className="border-2 focus:border-blue">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logo">Logo Design</SelectItem>
                    <SelectItem value="branding">Brand Identity</SelectItem>
                    <SelectItem value="website">Website Design</SelectItem>
                    <SelectItem value="print">Print Design</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="social">Social Media Assets</SelectItem>
                    <SelectItem value="video">Video/Animation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Project Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-2 focus:border-blue",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brief">Project Brief *</Label>
              <Textarea 
                id="brief"
                placeholder="Describe your project, goals, target audience, style preferences, and any specific requirements..."
                className="min-h-32 border-2 focus:border-blue"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference-links">Reference Links</Label>
              <Textarea 
                id="reference-links"
                placeholder="Share any inspiration links, competitor examples, or style references (one per line)"
                className="border-2 focus:border-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive-folder">Google Drive Folder (Optional)</Label>
              <Input 
                id="drive-folder" 
                placeholder="https://drive.google.com/..." 
                className="border-2 focus:border-blue"
              />
              <p className="text-sm text-muted-foreground">
                Share any assets, brand guidelines, or existing materials
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full gradient-blue text-white hover:opacity-90 transition-opacity py-6 text-lg font-semibold"
            >
              {isSubmitting ? "Submitting..." : "Submit Project"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}