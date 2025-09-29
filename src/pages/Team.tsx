import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Mail, Phone, User, Users, Briefcase } from "lucide-react"

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@sparkpro.com",
      role: "Lead Designer",
      status: "Active",
      activeProjects: 5,
      avatar: "SJ",
      department: "Design"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@sparkpro.com", 
      role: "Senior Designer",
      status: "Active",
      activeProjects: 3,
      avatar: "MC",
      department: "Design"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily@sparkpro.com",
      role: "Project Lead",
      status: "Active", 
      activeProjects: 8,
      avatar: "ER",
      department: "Management"
    },
    {
      id: 4,
      name: "David Kim",
      email: "david@sparkpro.com",
      role: "Junior Designer",
      status: "Active",
      activeProjects: 2,
      avatar: "DK",
      department: "Design"
    },
    {
      id: 5,
      name: "Alex Morgan",
      email: "alex@sparkpro.com",
      role: "Creative Director",
      status: "Active",
      activeProjects: 12,
      avatar: "AM",
      department: "Leadership"
    }
  ]

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('Director')) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (role.includes('Lead')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (role.includes('Senior')) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Team</h1>
              <p className="text-muted-foreground">Manage your creative team and workload distribution</p>
            </div>
            <div className="flex gap-2">
              <Button className="gradient-blue text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search team members..." 
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Design</Button>
                  <Button variant="outline" size="sm">Management</Button>
                  <Button variant="outline" size="sm">Leadership</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow animate-fade-in">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {member.email}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {member.department}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{member.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">Active Projects</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Projects
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Team</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Designers</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {teamMembers.filter(m => m.department === 'Design').length}
                </div>
                <p className="text-xs text-muted-foreground">Creative team</p>
              </CardContent>
            </Card>
            
            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {teamMembers.reduce((sum, member) => sum + member.activeProjects, 0)}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Workload</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(teamMembers.reduce((sum, member) => sum + member.activeProjects, 0) / teamMembers.length)}
                </div>
                <p className="text-xs text-muted-foreground">Projects per person</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team