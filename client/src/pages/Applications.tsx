import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Layout/Sidebar";

export default function Applications() {
  const { toast } = useToast();
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Fetch organizations and projects
  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
    retry: false,
  });

  const firstOrgId = organizations?.[0]?.id;
  const { data: projects } = useQuery({
    queryKey: ["/api/organizations", firstOrgId, "projects"],
    enabled: !!firstOrgId,
  });

  const { data: applications } = useQuery({
    queryKey: ["/api/projects", selectedProject?.id, "applications"],
    enabled: !!selectedProject?.id,
  });

  const createAppMutation = useMutation({
    mutationFn: async (appData: any) => {
      const response = await apiRequest("POST", "/api/applications", appData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProject?.id, "applications"] });
      setShowCreateApp(false);
      toast({
        title: "Success",
        description: "Application created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create application.",
        variant: "destructive",
      });
    },
  });

  const handleCreateApp = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    
    createAppMutation.mutate({
      projectId: selectedProject?.id,
      name: formData.get('name'),
      description: formData.get('description'),
      framework: formData.get('framework'),
      repositoryUrl: formData.get('repositoryUrl'),
      buildCommand: formData.get('buildCommand'),
      startCommand: formData.get('startCommand'),
      status: 'pending',
    });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Applications</h1>
              <p className="text-gray-600">Deploy and manage your applications</p>
            </div>
            
            <Dialog open={showCreateApp} onOpenChange={setShowCreateApp}>
              <DialogTrigger asChild>
                <Button disabled={!selectedProject}>
                  <i className="fas fa-plus mr-2"></i>
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deploy New Application</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateApp} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Application Name</Label>
                    <Input id="name" name="name" placeholder="my-web-app" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Brief description" />
                  </div>
                  <div>
                    <Label htmlFor="framework">Framework</Label>
                    <Select name="framework" defaultValue="nodejs">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nodejs">Node.js</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="django">Django</SelectItem>
                        <SelectItem value="flask">Flask</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="repositoryUrl">Repository URL</Label>
                    <Input id="repositoryUrl" name="repositoryUrl" placeholder="https://github.com/user/repo" />
                  </div>
                  <div>
                    <Label htmlFor="buildCommand">Build Command</Label>
                    <Input id="buildCommand" name="buildCommand" placeholder="npm run build" />
                  </div>
                  <div>
                    <Label htmlFor="startCommand">Start Command</Label>
                    <Input id="startCommand" name="startCommand" placeholder="npm start" />
                  </div>
                  <Button type="submit" disabled={createAppMutation.isPending} className="w-full">
                    {createAppMutation.isPending ? 'Creating...' : 'Deploy Application'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Project Selector */}
          <div className="mb-6">
            <Label className="text-sm font-medium">Select Project:</Label>
            <Select
              value={selectedProject?.id?.toString()}
              onValueChange={(value) => {
                const project = projects?.find((p: any) => p.id.toString() === value);
                setSelectedProject(project);
              }}
            >
              <SelectTrigger className="w-64 mt-2">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project: any) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Applications Grid */}
          {applications?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app: any) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                      </div>
                      <Badge variant={app.status === 'running' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Framework:</span>
                        <span className="ml-2 text-sm">{app.framework}</span>
                      </div>
                      {app.repositoryUrl && (
                        <div>
                          <span className="text-sm font-medium">Repository:</span>
                          <a
                            href={app.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-sm text-blue-600 hover:underline"
                          >
                            View Code
                          </a>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline">
                          <i className="fas fa-play mr-1"></i>
                          Deploy
                        </Button>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-cog mr-1"></i>
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <i className="fas fa-rocket text-3xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">No applications found</p>
                  <p className="text-sm text-gray-400">
                    {selectedProject ? 'Deploy your first application' : 'Select a project to view applications'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}