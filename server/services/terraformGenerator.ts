import { generateTerraformFromDiagram } from "./gemini";

export async function generateTerraformCode(diagramData: any, cloudProvider: 'aws' | 'azure' | 'gcp'): Promise<{
  code: string;
  variables: Record<string, any>;
  outputs: Record<string, any>;
}> {
  const nodes = diagramData.nodes || [];
  const edges = diagramData.edges || [];

  // Use AI to generate Terraform code
  const aiResult = await generateTerraformFromDiagram(nodes, edges, cloudProvider);

  // Add standard variables and outputs if not present
  let standardVariables: Record<string, any> = {};
  let standardOutputs: Record<string, any> = {};
  switch (cloudProvider) {
    case 'aws':
      standardVariables = {
        region: {
          description: "AWS region",
          type: "string",
          default: "us-east-1"
        },
        environment: {
          description: "Environment name",
          type: "string",
          default: "production"
        },
        project_name: {
          description: "Project name for resource naming",
          type: "string"
        },
        ...aiResult.variables
      };
      standardOutputs = {
        vpc_id: {
          description: "VPC ID",
          value: "${aws_vpc.main.id}"
        },
        ...aiResult.outputs
      };
      break;
    case 'azure':
      standardVariables = {
        location: {
          description: "Azure region",
          type: "string",
          default: "eastus"
        },
        environment: {
          description: "Environment name",
          type: "string",
          default: "production"
        },
        project_name: {
          description: "Project name for resource naming",
          type: "string"
        },
        ...aiResult.variables
      };
      standardOutputs = {
        resource_group_id: {
          description: "Resource Group ID",
          value: "${azurerm_resource_group.main.id}"
        },
        ...aiResult.outputs
      };
      break;
    case 'gcp':
      standardVariables = {
        region: {
          description: "GCP region",
          type: "string",
          default: "us-central1"
        },
        environment: {
          description: "Environment name",
          type: "string",
          default: "production"
        },
        project_name: {
          description: "Project name for resource naming",
          type: "string"
        },
        ...aiResult.variables
      };
      standardOutputs = {
        network_id: {
          description: "VPC Network ID",
          value: "${google_compute_network.main.id}"
        },
        ...aiResult.outputs
      };
      break;
  }

  return {
    code: aiResult.code,
    variables: standardVariables,
    outputs: standardOutputs,
  };
}

export function validateTerraformSyntax(code: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic syntax validation
  try {
    // Check for basic Terraform structure
    if (!code.includes('terraform {') && !code.includes('provider ')) {
      errors.push('Missing Terraform configuration block or provider');
    }

    // Check for resource blocks
    if (!code.includes('resource "')) {
      warnings.push('No resources defined in configuration');
    }

    // Check for common syntax issues
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      // Check for unclosed braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      
      // Check for missing quotes in resource names
      if (line.includes('resource ') && !line.match(/resource\s+"[^"]+"\s+"[^"]+"/)) {
        if (line.trim() !== 'resource') {
          errors.push(`Line ${index + 1}: Invalid resource syntax`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Syntax validation failed: ${error}`],
      warnings,
    };
  }
}

export function extractResourcesFromCode(code: string): Array<{
  type: string;
  name: string;
  properties: Record<string, any>;
}> {
  const resources: Array<{
    type: string;
    name: string;
    properties: Record<string, any>;
  }> = [];

  try {
    // Basic regex to extract resource blocks
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*{([^}]*)}/g;
    let match;

    while ((match = resourceRegex.exec(code)) !== null) {
      const resourceType = match[1];
      const resourceName = match[2];
      const resourceBody = match[3];

      // Extract basic properties (this is a simplified parser)
      const properties: Record<string, any> = {};
      const propertyLines = resourceBody.split('\n');
      
      propertyLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const propMatch = trimmed.match(/(\w+)\s*=\s*(.+)/);
          if (propMatch) {
            properties[propMatch[1]] = propMatch[2].replace(/"/g, '');
          }
        }
      });

      resources.push({
        type: resourceType,
        name: resourceName,
        properties,
      });
    }
  } catch (error) {
    console.error('Error parsing Terraform code:', error);
  }

  return resources;
}
