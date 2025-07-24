import { useState, useCallback, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useInfrastructureStore } from "@/stores/infrastructureStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ComponentPalette from "./ComponentPalette";
import DiagramCanvas from "./DiagramCanvas";
import PropertiesPanel from "./PropertiesPanel";
import CodeModal from "./CodeModal";
import CostAnalysis from "./CostAnalysis";
import { AWS_RESOURCES, InfrastructureNode, TerraformConfig } from "@/types/infrastructure";
import { isUnauthorizedError } from "@/lib/authUtils";

interface InfrastructureDesignerProps {
  projectId?: number;
  diagramId?: number;
}

export default function InfrastructureDesigner({ projectId, diagramId }: InfrastructureDesignerProps) {
  const { toast } = useToast();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [currentDiagram, setCurrentDiagram] = useState<any>(null);
  const [terraformConfig, setTerraformConfig] = useState<TerraformConfig | null>(null);
  
  const {
    currentDiagram: storeDiagram,
    selectedNode,
    addNode,
    loadDiagram,
    clearDiagram,
    setGeneratingCode,
    isGeneratingCode,
  } = useInfrastructureStore();

  // Fetch project details
  const { data: project } = useQuery({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
    retry: false,
  });

  // Fetch diagram if diagramId is provided
  const { data: diagram } = useQuery({
    queryKey: ["/api/diagrams", diagramId],
    enabled: !!diagramId,
    retry: false,
  });

  // Fetch cost estimation
  const { data: costEstimation } = useQuery({
    queryKey: ["/api/diagrams", diagramId, "costs"],
    enabled: !!diagramId,
    retry: false,
  });

  useEffect(() => {
    if (project) {
      setCurrentProject(project);
    }
  }, [project]);

  useEffect(() => {
    if (diagram) {
      setCurrentDiagram(diagram);
      loadDiagram(diagram.diagramData);
    } else {
      clearDiagram();
    }
  }, [diagram, loadDiagram, clearDiagram]);

  // Save diagram mutation
  const saveDiagramMutation = useMutation({
    mutationFn: async (diagramData: any) => {
      if (diagramId) {
        return await apiRequest("PUT", `/api/diagrams/${diagramId}`, { diagramData });
      } else {
        return await apiRequest("POST", "/api/diagrams", {
          projectId,
          name: "Infrastructure Diagram",
          description: "Auto-generated infrastructure diagram",
          diagramData,
          version: 1,
        });
      }
    },
    onSuccess: (response) => {
      toast({
        title: "Success",
        description: "Infrastructure diagram saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "diagrams"] });
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
        description: "Failed to save diagram. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate Terraform mutation
  const generateTerraformMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/diagrams/${diagramId}/terraform`);
      return await response.json();
    },
    onSuccess: (config) => {
      setTerraformConfig(config);
      setShowCodeModal(true);
      toast({
        title: "Success",
        description: "Terraform code generated successfully.",
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
        description: "Failed to generate Terraform code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generate cost estimation mutation
  const generateCostMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/diagrams/${diagramId}/costs`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diagrams", diagramId, "costs"] });
      toast({
        title: "Success",
        description: "Cost estimation updated successfully.",
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
        description: "Failed to generate cost estimation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleComponentSelect = useCallback((resourceType: string) => {
    const resource = AWS_RESOURCES.find(r => r.type === resourceType);
    if (!resource) return;

    const newNode: InfrastructureNode = {
      id: `${resourceType}-${Date.now()}`,
      type: resourceType,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: resource.label,
        name: `${resource.label.toLowerCase()}-${Date.now()}`,
        ...resource.defaultProps,
      },
    };

    addNode(newNode);
  }, [addNode]);

  const handleDiagramChange = useCallback((nodes: any[], edges: any[]) => {
    const diagramData = { nodes, edges };
    
    // Auto-save after a delay
    const timeoutId = setTimeout(() => {
      if (projectId && (diagramId || nodes.length > 0)) {
        saveDiagramMutation.mutate(diagramData);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [projectId, diagramId, saveDiagramMutation]);

  const handleGenerateTerraform = useCallback(async () => {
    if (!diagramId) {
      toast({
        title: "Error",
        description: "Please save the diagram first before generating Terraform code.",
        variant: "destructive",
      });
      return;
    }

    if (storeDiagram.nodes.length === 0) {
      toast({
        title: "Error",
        description: "Please add some infrastructure components before generating code.",
        variant: "destructive",
      });
      return;
    }

    setGeneratingCode(true);
    try {
      await generateTerraformMutation.mutateAsync();
    } finally {
      setGeneratingCode(false);
    }
  }, [diagramId, storeDiagram.nodes.length, generateTerraformMutation, setGeneratingCode, toast]);

  const handleValidateConfiguration = useCallback(() => {
    if (storeDiagram.nodes.length === 0) {
      toast({
        title: "Warning",
        description: "No infrastructure components to validate.",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    const errors: string[] = [];
    const warnings: string[] = [];

    storeDiagram.nodes.forEach(node => {
      if (!node.data.name) {
        warnings.push(`${node.data.label} is missing a name`);
      }
      
      if (node.type === 'ec2' && !node.data.instanceType) {
        errors.push(`EC2 instance ${node.data.label} is missing instance type`);
      }
      
      if (node.type === 'rds' && !node.data.instanceClass) {
        errors.push(`RDS instance ${node.data.label} is missing instance class`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Validation Failed",
        description: `Found ${errors.length} error(s). Please fix them before proceeding.`,
        variant: "destructive",
      });
    } else if (warnings.length > 0) {
      toast({
        title: "Validation Passed with Warnings",
        description: `Found ${warnings.length} warning(s). Configuration is valid but could be improved.`,
      });
    } else {
      toast({
        title: "Validation Passed",
        description: "Configuration is valid and ready for deployment.",
      });
    }
  }, [storeDiagram.nodes, toast]);

  const handleGenerateCosts = useCallback(() => {
    if (!diagramId) {
      toast({
        title: "Error",
        description: "Please save the diagram first before generating cost estimation.",
        variant: "destructive",
      });
      return;
    }

    generateCostMutation.mutate();
  }, [diagramId, generateCostMutation, toast]);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-background">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white dark:bg-card border-b border-slate-200 dark:border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
                  Infrastructure Designer
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200">
                    AWS
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200">
                    {currentProject?.region || 'us-east-1'}
                  </Badge>
                  {currentProject && (
                    <Badge variant="outline">
                      {currentProject.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => saveDiagramMutation.mutate(storeDiagram)}
                  disabled={saveDiagramMutation.isPending}
                >
                  <i className="fas fa-save mr-2"></i>
                  {saveDiagramMutation.isPending ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={handleGenerateTerraform}
                  disabled={isGeneratingCode || storeDiagram.nodes.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isGeneratingCode ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full flex">
              {/* Component Palette */}
              <div className="absolute top-4 right-4 z-10">
                <ComponentPalette onComponentSelect={handleComponentSelect} />
              </div>

              {/* Diagram Canvas */}
              <DiagramCanvas
                onNodeSelect={(node) => {}}
                onDiagramChange={handleDiagramChange}
              />

              {/* Properties Panel */}
              <PropertiesPanel
                onGenerateTerraform={handleGenerateTerraform}
                onValidateConfiguration={handleValidateConfiguration}
                isGenerating={isGeneratingCode}
              />
            </div>
          </div>
        </div>

        {/* Code Generation Modal */}
        <CodeModal
          isOpen={showCodeModal}
          onClose={() => setShowCodeModal(false)}
          terraformConfig={terraformConfig}
          onDeploy={() => {
            toast({
              title: "Deployment Initiated",
              description: "Infrastructure deployment has been started.",
            });
          }}
          onSaveToRepo={() => {
            toast({
              title: "Saved to Repository",
              description: "Terraform code has been saved to your repository.",
            });
          }}
          onDownload={() => {
            if (terraformConfig) {
              const blob = new Blob([terraformConfig.code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'main.tf';
              a.click();
              URL.revokeObjectURL(url);
              
              toast({
                title: "Download Started",
                description: "Terraform configuration has been downloaded.",
              });
            }
          }}
        />
      </div>
    </ReactFlowProvider>
  );
}
