import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useInfrastructureStore } from "@/stores/infrastructureStore";
import { AWS_RESOURCES, InfrastructureNode } from "@/types/infrastructure";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  onGenerateTerraform: () => void;
  onValidateConfiguration: () => void;
  isGenerating?: boolean;
}

export default function PropertiesPanel({ 
  onGenerateTerraform, 
  onValidateConfiguration,
  isGenerating = false
}: PropertiesPanelProps) {
  const { selectedNode, updateNode } = useInfrastructureStore();
  const [tags, setTags] = useState<Array<{ key: string; value: string }>>([
    { key: 'Environment', value: 'production' },
    { key: 'ManagedBy', value: 'CloudOps-AI' },
  ]);

  const resource = selectedNode ? AWS_RESOURCES.find(r => r.type === selectedNode.type) : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (selectedNode) {
      updateNode(selectedNode.id, {
        data: {
          ...selectedNode.data,
          [property]: value,
        },
      });
    }
  };

  const addTag = () => {
    setTags([...tags, { key: '', value: '' }]);
  };

  const updateTag = (index: number, field: 'key' | 'value', value: string) => {
    const updatedTags = [...tags];
    updatedTags[index][field] = value;
    setTags(updatedTags);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const renderNodeProperties = () => {
    if (!selectedNode || !resource) {
      return (
        <div className="flex items-center justify-center h-32 text-slate-500">
          <div className="text-center">
            <i className="fas fa-mouse-pointer text-2xl mb-2"></i>
            <p className="text-sm">Select a resource to configure properties</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Basic Properties */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <i className={cn(resource.icon, resource.color, "mr-2")}></i>
            {resource.label} Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                Resource Name
              </Label>
              <Input
                id="name"
                value={selectedNode.data.name || ''}
                onChange={(e) => handlePropertyChange('name', e.target.value)}
                placeholder={`${resource.label.toLowerCase()}-instance`}
                className="mt-1"
              />
            </div>

            {/* EC2 Specific Properties */}
            {selectedNode.type === 'ec2' && (
              <>
                <div>
                  <Label htmlFor="instanceType" className="text-xs font-medium text-slate-700">
                    Instance Type
                  </Label>
                  <Select
                    value={selectedNode.data.instanceType || 't3.micro'}
                    onValueChange={(value) => handlePropertyChange('instanceType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t3.nano">t3.nano</SelectItem>
                      <SelectItem value="t3.micro">t3.micro</SelectItem>
                      <SelectItem value="t3.small">t3.small</SelectItem>
                      <SelectItem value="t3.medium">t3.medium</SelectItem>
                      <SelectItem value="t3.large">t3.large</SelectItem>
                      <SelectItem value="m5.large">m5.large</SelectItem>
                      <SelectItem value="m5.xlarge">m5.xlarge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ami" className="text-xs font-medium text-slate-700">
                    AMI ID
                  </Label>
                  <Input
                    id="ami"
                    value={selectedNode.data.ami || 'ami-0abcdef1234567890'}
                    onChange={(e) => handlePropertyChange('ami', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="keyPair" className="text-xs font-medium text-slate-700">
                    Key Pair
                  </Label>
                  <Select
                    value={selectedNode.data.keyPair || 'my-keypair'}
                    onValueChange={(value) => handlePropertyChange('keyPair', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my-keypair">my-keypair</SelectItem>
                      <SelectItem value="production-key">production-key</SelectItem>
                      <SelectItem value="development-key">development-key</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* RDS Specific Properties */}
            {selectedNode.type === 'rds' && (
              <>
                <div>
                  <Label htmlFor="instanceClass" className="text-xs font-medium text-slate-700">
                    Instance Class
                  </Label>
                  <Select
                    value={selectedNode.data.instanceClass || 'db.t3.micro'}
                    onValueChange={(value) => handlePropertyChange('instanceClass', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="db.t3.micro">db.t3.micro</SelectItem>
                      <SelectItem value="db.t3.small">db.t3.small</SelectItem>
                      <SelectItem value="db.t3.medium">db.t3.medium</SelectItem>
                      <SelectItem value="db.m5.large">db.m5.large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="engine" className="text-xs font-medium text-slate-700">
                    Database Engine
                  </Label>
                  <Select
                    value={selectedNode.data.engine || 'mysql'}
                    onValueChange={(value) => handlePropertyChange('engine', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgres">PostgreSQL</SelectItem>
                      <SelectItem value="mariadb">MariaDB</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* S3 Specific Properties */}
            {selectedNode.type === 's3' && (
              <>
                <div>
                  <Label htmlFor="storageClass" className="text-xs font-medium text-slate-700">
                    Storage Class
                  </Label>
                  <Select
                    value={selectedNode.data.storageClass || 'STANDARD'}
                    onValueChange={(value) => handlePropertyChange('storageClass', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="STANDARD_IA">Standard-IA</SelectItem>
                      <SelectItem value="GLACIER">Glacier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="versioning"
                    checked={selectedNode.data.versioning || false}
                    onCheckedChange={(checked) => handlePropertyChange('versioning', checked)}
                  />
                  <Label htmlFor="versioning" className="text-xs font-medium text-slate-700">
                    Enable Versioning
                  </Label>
                </div>
              </>
            )}

            {/* VPC Specific Properties */}
            {selectedNode.type === 'vpc' && (
              <div>
                <Label htmlFor="cidrBlock" className="text-xs font-medium text-slate-700">
                  CIDR Block
                </Label>
                <Input
                  id="cidrBlock"
                  value={selectedNode.data.cidrBlock || '10.0.0.0/16'}
                  onChange={(e) => handlePropertyChange('cidrBlock', e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div>
          <Label className="text-xs font-medium text-slate-700 mb-2 block">
            Tags
          </Label>
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder="Key"
                  value={tag.key}
                  onChange={(e) => updateTag(index, 'key', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Input
                  placeholder="Value"
                  value={tag.value}
                  onChange={(e) => updateTag(index, 'value', e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(index)}
                  className="px-2"
                >
                  <i className="fas fa-times text-xs"></i>
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={addTag}
              className="text-xs text-primary hover:text-primary"
            >
              + Add Tag
            </Button>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
            <i className="fas fa-magic text-primary mr-2"></i>
            AI Suggestions
          </h4>
          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <i className="fas fa-lightbulb text-blue-500 mt-0.5 text-sm"></i>
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Cost Optimization</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    Consider using t3.nano for development workloads to reduce costs by 67%.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mt-1 p-0 h-auto"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <i className="fas fa-shield-alt text-amber-500 mt-0.5 text-sm"></i>
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Security</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Enable detailed monitoring and add backup tags for compliance.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 mt-1 p-0 h-auto"
                  >
                    Apply Suggestion
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-80 h-full flex flex-col">
      <Tabs defaultValue="properties" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="flex-1 overflow-y-auto">
          <div className="p-4">
            {renderNodeProperties()}
          </div>
        </TabsContent>
        
        <TabsContent value="code" className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="bg-slate-900 rounded-lg p-4">
              <pre className="text-green-400 text-xs font-mono">
                {selectedNode ? `resource "aws_${selectedNode.type}" "${selectedNode.data.name || 'resource'}" {
  # Configuration will be generated
  # based on your selections
}` : '# Select a resource to view code'}
              </pre>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="cost" className="flex-1 overflow-y-auto">
          <div className="p-4">
            {selectedNode ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">💰 Estimated Cost</h4>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <div className="flex justify-between">
                    <span>{resource?.label}:</span>
                    <span>$12.50/month</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a resource to view cost estimation</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="border-t p-4 space-y-2">
        <Button 
          onClick={onGenerateTerraform}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-magic mr-2"></i>
              Generate Terraform
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={onValidateConfiguration}
          className="w-full"
        >
          <i className="fas fa-check-circle mr-2"></i>
          Validate Configuration
        </Button>
      </div>
    </Card>
  );
}
