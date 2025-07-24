import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Layout/Sidebar";

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  });

  // Fetch organizations
  const { data: organizations } = useQuery({
    queryKey: ["/api/organizations"],
    enabled: isAuthenticated,
  });

  // Get the first organization's projects for dashboard stats
  const firstOrgId = organizations?.[0]?.id;
  const { data: projects } = useQuery({
    queryKey: ["/api/organizations", firstOrgId, "projects"],
    enabled: !!firstOrgId,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-slate-400 mb-4"></i>
            <p className="text-slate-500 dark:text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-2">
              Welcome to CloudOps AI
            </h1>
            <p className="text-slate-500 dark:text-muted-foreground">
              Enterprise-grade AI-powered DevOps platform for infrastructure management
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                      Total Projects
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                      {projects?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-project-diagram text-blue-600 dark:text-blue-300"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                      Organizations
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">
                      {organizations?.length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-building text-green-600 dark:text-green-300"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                      AI Features
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-foreground">Ready</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-brain text-yellow-600 dark:text-yellow-300"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">
                      Status
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">Active</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check-circle text-purple-600 dark:text-purple-300"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={`/infrastructure/${projects?.[0]?.id || 1}`}>
                  <Button variant="outline" className="h-auto p-4 w-full justify-start">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-diagram-project text-blue-600 dark:text-blue-300"></i>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Design Infrastructure</h3>
                      <p className="text-sm text-muted-foreground">
                        Create and manage cloud infrastructure
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/applications">
                  <Button variant="outline" className="h-auto p-4 w-full justify-start">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-rocket text-green-600 dark:text-green-300"></i>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">Deploy Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Deploy and manage applications
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/monitoring">
                  <Button variant="outline" className="h-auto p-4 w-full justify-start">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
                      <i className="fas fa-chart-line text-purple-600 dark:text-purple-300"></i>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">View Monitoring</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor infrastructure health
                      </p>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          {projects && projects.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 5).map((project: any) => (
                    <Link key={project.id} href={`/infrastructure/${project.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <i className="fas fa-project-diagram text-primary text-sm"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">{project.name}</h4>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {project.cloudProvider?.toUpperCase() || 'AWS'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {project.region || 'us-east-1'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}