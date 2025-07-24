import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/Layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedOrganization, setSelectedOrganization] = useState<any>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  // Fetch organizations
  const { data: organizations, isLoading: loadingOrgs } = useQuery({
    queryKey: ["/api/organizations"],
    retry: false,
  });

  // Fetch projects for selected organization
  const { data: projects } = useQuery({
    queryKey: ["/api/organizations", selectedOrganization?.id, "projects"],
    enabled: !!selectedOrganization?.id,
    retry: false,
  });

  // Auto-select first organization
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0]);
    }
  }, [organizations, selectedOrganization]);

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (orgData: any) => {
      const response = await apiRequest("POST", "/api/organizations", orgData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      setShowCreateOrg(false);
      toast({
        title: "Success",
        description: "Organization created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const response = await apiRequest("POST", "/api/projects", projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", selectedOrganization?.id, "projects"] });
      setShowCreateProject(false);
      toast({
        title: "Success",
        description: "Project created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrg = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    
    createOrgMutation.mutate({
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
    });
  };

  const handleCreateProject = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    
    createProjectMutation.mutate({
      organizationId: selectedOrganization?.id,
      name: formData.get('name'),
      description: formData.get('description'),
      cloudProvider: formData.get('cloudProvider'),
      region: formData.get('region'),
      status: 'draft',
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-foreground">Dashboard</h1>
              <p className="text-sm text-slate-500 dark:text-muted-foreground">
                Welcome back, {user?.firstName || 'DevOps Engineer'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <i className="fas fa-building mr-2"></i>
                    New Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Organization</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateOrg} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Organization Name</Label>
                      <Input id="name" name="name" placeholder="Acme Corp" required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input id="slug" name="slug" placeholder="acme-corp" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" placeholder="Brief description of your organization" />
                    </div>
                    <Button type="submit" disabled={createOrgMutation.isPending} className="w-full">
                      {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                <DialogTrigger asChild>
                  <Button disabled={!selectedOrganization}>
                    <i className="fas fa-plus mr-2"></i>
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input id="project-name" name="name" placeholder="Web Application Infrastructure" required />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea id="project-description" name="description" placeholder="Brief description of your project" />
                    </div>
                    <div>
                      <Label htmlFor="cloudProvider">Cloud Provider</Label>
                      <Select name="cloudProvider" defaultValue="aws">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                          <SelectItem value="azure">Microsoft Azure</SelectItem>
                          <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Select name="region" defaultValue="us-east-1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                          <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={createProjectMutation.isPending} className="w-full">
                      {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {loadingOrgs ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-3xl text-slate-400 mb-4"></i>
                <p className="text-slate-500 dark:text-muted-foreground">Loading organizations...</p>
              </div>
            </div>
          ) : !organizations || organizations.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-building text-4xl text-slate-300 dark:text-slate-600 mb-4"></i>
                <h3 className="text-lg font-medium text-slate-900 dark:text-foreground mb-2">No Organizations Found</h3>
                <p className="text-slate-500 dark:text-muted-foreground mb-4">
                  Create your first organization to get started with CloudOps AI.
                </p>
                <Button onClick={() => setShowCreateOrg(true)}>
                  <i className="fas fa-plus mr-2"></i>
                  Create Organization
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Organization Selector */}
              <div className="flex items-center space-x-4">
                <Label className="text-sm font-medium">Organization:</Label>
                <Select
                  value={selectedOrganization?.id?.toString()}
                  onValueChange={(value) => {
                    const org = organizations.find((o: any) => o.id.toString() === value);
                    setSelectedOrganization(org);
                  }}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org: any) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <i className="fas fa-folder text-slate-400"></i>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {projects?.filter((p: any) => p.status === 'active').length || 0} active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cloud Providers</CardTitle>
                    <i className="fas fa-cloud text-slate-400"></i>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Set(projects?.map((p: any) => p.cloudProvider)).size || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AWS, Azure, GCP
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Deployments</CardTitle>
                    <i className="fas fa-rocket text-slate-400"></i>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      +3 this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                    <i className="fas fa-dollar-sign text-slate-400"></i>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$1,247</div>
                    <p className="text-xs text-muted-foreground">
                      -12% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Grid */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-foreground">
                    Infrastructure Projects
                  </h2>
                  {selectedOrganization && (
                    <Button onClick={() => setShowCreateProject(true)}>
                      <i className="fas fa-plus mr-2"></i>
                      New Project
                    </Button>
                  )}
                </div>

                {!projects || projects.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <i className="fas fa-folder-open text-3xl text-slate-300 dark:text-slate-600 mb-2"></i>
                        <p className="text-slate-500 dark:text-muted-foreground">No projects found</p>
                        <p className="text-sm text-slate-400 dark:text-muted-foreground">
                          Create your first project to start building infrastructure
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project: any) => (
                      <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{project.name}</CardTitle>
                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-muted-foreground line-clamp-2">
                            {project.description || 'No description provided'}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 dark:text-muted-foreground">Cloud Provider:</span>
                              <Badge variant="outline" className="capitalize">
                                {project.cloudProvider}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 dark:text-muted-foreground">Region:</span>
                              <span className="font-medium">{project.region}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-500 dark:text-muted-foreground">Created:</span>
                              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <Separator className="my-4" />
                          
                          <div className="flex space-x-2">
                            <Link href={`/infrastructure/${project.id}`}>
                              <Button size="sm" className="flex-1">
                                <i className="fas fa-diagram-project mr-2"></i>
                                Design
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <i className="fas fa-cog"></i>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-history mr-2 text-slate-400"></i>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects && projects.length > 0 ? (
                      projects.slice(0, 5).map((project: any) => (
                        <div key={project.id} className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                            <i className="fas fa-plus text-blue-600 dark:text-blue-400 text-xs"></i>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-foreground">
                              Created project "{project.name}"
                            </p>
                            <p className="text-xs text-slate-500 dark:text-muted-foreground">
                              {new Date(project.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {project.cloudProvider}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-clock text-2xl text-slate-300 dark:text-slate-600 mb-2"></i>
                        <p className="text-slate-500 dark:text-muted-foreground">No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
