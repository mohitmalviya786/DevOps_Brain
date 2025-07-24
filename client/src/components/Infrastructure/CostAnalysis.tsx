import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CostEstimation } from "@/types/infrastructure";

interface CostAnalysisProps {
  costEstimation: CostEstimation | null;
  onOptimize?: () => void;
}

export default function CostAnalysis({ costEstimation, onOptimize }: CostAnalysisProps) {
  if (!costEstimation) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-slate-500">
            <i className="fas fa-dollar-sign text-3xl mb-2"></i>
            <p className="text-sm">Generate infrastructure to see cost analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const breakdown = costEstimation.costBreakdown as any[] || [];
  const totalCost = parseFloat(costEstimation.estimatedMonthlyCost);

  return (
    <div className="space-y-4">
      {/* Total Cost Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <i className="fas fa-chart-pie text-primary mr-2"></i>
            Monthly Cost Breakdown
            <Badge variant="secondary" className="ml-auto">
              ${totalCost.toFixed(2)}/month
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {breakdown.map((item, index) => {
              const percentage = (item.totalCost / totalCost) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium text-slate-900">
                        {item.resourceName}
                      </span>
                      <span className="text-xs text-slate-500 ml-2">
                        ({item.instanceType || item.resourceType})
                      </span>
                    </div>
                    <span className="text-sm font-semibold">
                      ${item.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
            Cost Optimization Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Reserved Instances
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Save up to 72% by committing to 1-year terms
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  -$284/year
                </Badge>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Right-size Instances
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Consider t3.small instead of t3.medium for dev workloads
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  -$179/year
                </Badge>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    S3 Intelligent Tiering
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                    Automatically move data to cost-effective tiers
                  </p>
                </div>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  -$67/year
                </Badge>
              </div>
            </div>
          </div>

          <Button 
            onClick={onOptimize}
            variant="outline" 
            className="w-full mt-4"
          >
            <i className="fas fa-magic mr-2"></i>
            Apply AI Optimizations
          </Button>
        </CardContent>
      </Card>

      {/* Cost Trends */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <i className="fas fa-chart-line text-blue-500 mr-2"></i>
            Cost Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Current Month:</span>
              <span className="font-semibold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">With Optimizations:</span>
              <span className="font-semibold text-green-600">
                ${(totalCost * 0.65).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Annual Savings:</span>
              <span className="font-semibold text-green-600">
                ${(totalCost * 12 * 0.35).toFixed(0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
