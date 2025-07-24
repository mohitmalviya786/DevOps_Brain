import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { TerraformConfig } from "@/types/infrastructure";

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  terraformConfig: TerraformConfig | null;
  onDeploy?: () => void;
  onSaveToRepo?: () => void;
  onDownload?: () => void;
}

export default function CodeModal({
  isOpen,
  onClose,
  terraformConfig,
  onDeploy,
  onSaveToRepo,
  onDownload,
}: CodeModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("code");

  const mockSecurityAnalysis = {
    score: 85,
    issues: [
      {
        severity: 'medium' as const,
        resource: 'RDS Instance',
        issue: 'Database password should use AWS Secrets Manager',
        recommendation: 'Replace hardcoded password with Secrets Manager reference'
      },
      {
        severity: 'low' as const,
        resource: 'S3 Bucket',
        issue: 'Bucket versioning not enabled',
        recommendation: 'Enable versioning for better data protection'
      }
    ],
    bestPractices: [
      'Resource tags are consistent',
      'Using latest provider version',
      'Security groups follow least privilege'
    ]
  };

  const mockCostEstimation = {
    totalMonthlyCost: 47.85,
    breakdown: [
      { service: 'EC2 t3.micro', cost: 8.76 },
      { service: 'RDS db.t3.micro', cost: 12.41 },
      { service: 'S3 Storage', cost: 2.30 },
      { service: 'Load Balancer', cost: 16.20 },
      { service: 'NAT Gateway', cost: 8.18 }
    ]
  };

  const handleAction = (action: string) => {
    toast({
      title: "Action Initiated",
      description: `${action} process has been started.`,
    });
  };

  if (!terraformConfig) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-code text-primary"></i>
              </div>
              <div>
                <DialogTitle>Generated Terraform Code</DialogTitle>
                <p className="text-sm text-slate-500">AI-optimized infrastructure as code</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 bg-slate-900 rounded-l-lg overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="bg-slate-800 px-4 py-2">
                <TabsList className="bg-slate-700">
                  <TabsTrigger value="code" className="data-[state=active]:bg-slate-600">
                    main.tf
                  </TabsTrigger>
                  <TabsTrigger value="variables" className="data-[state=active]:bg-slate-600">
                    variables.tf
                  </TabsTrigger>
                  <TabsTrigger value="outputs" className="data-[state=active]:bg-slate-600">
                    outputs.tf
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="code" className="flex-1 overflow-auto p-4 mt-0">
                <pre className="text-green-400 text-sm font-mono leading-relaxed">
                  <code>{terraformConfig.code}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="variables" className="flex-1 overflow-auto p-4 mt-0">
                <pre className="text-green-400 text-sm font-mono leading-relaxed">
                  <code>{JSON.stringify(terraformConfig.variables, null, 2)}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="outputs" className="flex-1 overflow-auto p-4 mt-0">
                <pre className="text-green-400 text-sm font-mono leading-relaxed">
                  <code>{JSON.stringify(terraformConfig.outputs, null, 2)}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </div>

          {/* Analysis Panel */}
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900">Code Analysis</h4>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Cost Estimation */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-800 flex items-center">
                    <i className="fas fa-dollar-sign mr-2"></i>
                    Estimated Monthly Cost
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockCostEstimation.breakdown.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.service}:</span>
                      <span className="font-medium">${item.cost}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${mockCostEstimation.totalMonthlyCost}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Analysis */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-800 flex items-center">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Security Review
                    <Badge variant="secondary" className="ml-2">
                      {mockSecurityAnalysis.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSecurityAnalysis.issues.map((issue, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-start space-x-2">
                        <i className={`fas ${
                          issue.severity === 'high' ? 'fa-exclamation-circle text-red-500' :
                          issue.severity === 'medium' ? 'fa-exclamation-triangle text-amber-500' :
                          'fa-info-circle text-blue-500'
                        } mt-0.5`}></i>
                        <div>
                          <p className="font-medium text-slate-700">{issue.resource}</p>
                          <p className="text-slate-600">{issue.issue}</p>
                          <p className="text-xs text-slate-500 mt-1">{issue.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-800 flex items-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockSecurityAnalysis.bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <i className="fas fa-check text-green-500"></i>
                      <span className="text-slate-600">{practice}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="border-t p-4 space-y-2">
              <Button 
                onClick={onDeploy}
                className="w-full"
              >
                <i className="fas fa-rocket mr-2"></i>
                Deploy Infrastructure
              </Button>
              <Button 
                variant="outline"
                onClick={onSaveToRepo}
                className="w-full"
              >
                <i className="fas fa-code-branch mr-2"></i>
                Save to Repository
              </Button>
              <Button 
                variant="ghost"
                onClick={onDownload}
                className="w-full"
              >
                <i className="fas fa-download mr-2"></i>
                Download ZIP
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
