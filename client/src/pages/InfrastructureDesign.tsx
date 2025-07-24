import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Layout/Sidebar";
import InfrastructureDesigner from "@/components/Infrastructure/InfrastructureDesigner";

export default function InfrastructureDesign() {
  const { projectId } = useParams<{ projectId: string }>();
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

  // Fetch project details to validate access
  const { data: project, isLoading: projectLoading, error } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId && isAuthenticated,
    retry: false,
  });

  if (isLoading || projectLoading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-slate-400 mb-4"></i>
            <p className="text-slate-500 dark:text-muted-foreground">Loading infrastructure designer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground mb-2">
              Project Not Found
            </h2>
            <p className="text-slate-500 dark:text-muted-foreground mb-4">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <InfrastructureDesigner 
          projectId={parseInt(projectId!)} 
        />
      </div>
    </div>
  );
}
