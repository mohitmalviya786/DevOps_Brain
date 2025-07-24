// AWS pricing data (simplified - in production, use AWS Pricing API)
const AWS_PRICING = {
  'aws_instance': {
    't3.nano': { hourly: 0.0052, monthly: 3.74 },
    't3.micro': { hourly: 0.0104, monthly: 7.49 },
    't3.small': { hourly: 0.0208, monthly: 14.98 },
    't3.medium': { hourly: 0.0416, monthly: 29.95 },
    't3.large': { hourly: 0.0832, monthly: 59.90 },
    't3.xlarge': { hourly: 0.1664, monthly: 119.81 },
    'm5.large': { hourly: 0.096, monthly: 69.12 },
    'm5.xlarge': { hourly: 0.192, monthly: 138.24 },
    'c5.large': { hourly: 0.085, monthly: 61.20 },
    'c5.xlarge': { hourly: 0.17, monthly: 122.40 },
  },
  'aws_db_instance': {
    'db.t3.micro': { hourly: 0.017, monthly: 12.41 },
    'db.t3.small': { hourly: 0.034, monthly: 24.82 },
    'db.t3.medium': { hourly: 0.068, monthly: 49.64 },
    'db.m5.large': { hourly: 0.18, monthly: 129.60 },
    'db.m5.xlarge': { hourly: 0.36, monthly: 259.20 },
  },
  'aws_s3_bucket': {
    'standard': { per_gb_monthly: 0.023 },
    'ia': { per_gb_monthly: 0.0125 },
    'glacier': { per_gb_monthly: 0.004 },
  },
  'aws_lb': {
    'application': { hourly: 0.0225, monthly: 16.20 },
    'network': { hourly: 0.0225, monthly: 16.20 },
  },
  'aws_nat_gateway': {
    'standard': { hourly: 0.045, monthly: 32.40 },
  },
  'aws_vpc_endpoint': {
    'gateway': { hourly: 0.01, monthly: 7.20 },
    'interface': { hourly: 0.01, monthly: 7.20 },
  },
};

export interface CostBreakdown {
  resourceType: string;
  resourceName: string;
  instanceType?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  period: 'hourly' | 'monthly';
}

export interface CostEstimation {
  totalMonthlyCost: number;
  totalHourlyCost: number;
  breakdown: CostBreakdown[];
  currency: string;
  lastUpdated: Date;
}

export async function estimateCosts(diagramData: any): Promise<CostEstimation> {
  const nodes = diagramData.nodes || [];
  const breakdown: CostBreakdown[] = [];
  let totalMonthlyCost = 0;
  let totalHourlyCost = 0;

  for (const node of nodes) {
    const costItem = estimateNodeCost(node);
    if (costItem) {
      breakdown.push(costItem);
      totalMonthlyCost += costItem.totalCost;
      totalHourlyCost += costItem.period === 'monthly' ? costItem.totalCost / 730 : costItem.totalCost;
    }
  }

  return {
    totalMonthlyCost,
    totalHourlyCost,
    breakdown,
    currency: 'USD',
    lastUpdated: new Date(),
  };
}

function estimateNodeCost(node: any): CostBreakdown | null {
  const nodeType = node.type;
  const nodeData = node.data || {};
  
  try {
    switch (nodeType) {
      case 'ec2':
      case 'aws_instance': {
        const instanceType = nodeData.instanceType || 't3.micro';
        const quantity = nodeData.quantity || 1;
        const pricing = AWS_PRICING.aws_instance[instanceType as keyof typeof AWS_PRICING.aws_instance];
        
        if (pricing) {
          return {
            resourceType: 'EC2 Instance',
            resourceName: nodeData.name || node.id,
            instanceType,
            quantity,
            unitCost: pricing.monthly,
            totalCost: pricing.monthly * quantity,
            period: 'monthly',
          };
        }
        break;
      }

      case 'rds':
      case 'aws_db_instance': {
        const instanceType = nodeData.instanceClass || 'db.t3.micro';
        const quantity = nodeData.quantity || 1;
        const pricing = AWS_PRICING.aws_db_instance[instanceType as keyof typeof AWS_PRICING.aws_db_instance];
        
        if (pricing) {
          return {
            resourceType: 'RDS Instance',
            resourceName: nodeData.name || node.id,
            instanceType,
            quantity,
            unitCost: pricing.monthly,
            totalCost: pricing.monthly * quantity,
            period: 'monthly',
          };
        }
        break;
      }

      case 's3':
      case 'aws_s3_bucket': {
        const storageGB = nodeData.storageGB || 100; // Default 100GB
        const storageClass = nodeData.storageClass || 'standard';
        const pricing = AWS_PRICING.aws_s3_bucket[storageClass as keyof typeof AWS_PRICING.aws_s3_bucket];
        
        if (pricing) {
          return {
            resourceType: 'S3 Storage',
            resourceName: nodeData.name || node.id,
            instanceType: `${storageGB}GB ${storageClass}`,
            quantity: storageGB,
            unitCost: pricing.per_gb_monthly,
            totalCost: pricing.per_gb_monthly * storageGB,
            period: 'monthly',
          };
        }
        break;
      }

      case 'alb':
      case 'aws_lb': {
        const lbType = nodeData.loadBalancerType || 'application';
        const quantity = nodeData.quantity || 1;
        const pricing = AWS_PRICING.aws_lb[lbType as keyof typeof AWS_PRICING.aws_lb];
        
        if (pricing) {
          return {
            resourceType: 'Load Balancer',
            resourceName: nodeData.name || node.id,
            instanceType: lbType,
            quantity,
            unitCost: pricing.monthly,
            totalCost: pricing.monthly * quantity,
            period: 'monthly',
          };
        }
        break;
      }

      case 'nat_gateway':
      case 'aws_nat_gateway': {
        const quantity = nodeData.quantity || 1;
        const pricing = AWS_PRICING.aws_nat_gateway.standard;
        
        return {
          resourceType: 'NAT Gateway',
          resourceName: nodeData.name || node.id,
          quantity,
          unitCost: pricing.monthly,
          totalCost: pricing.monthly * quantity,
          period: 'monthly',
        };
      }

      case 'vpc_endpoint':
      case 'aws_vpc_endpoint': {
        const endpointType = nodeData.endpointType || 'gateway';
        const quantity = nodeData.quantity || 1;
        const pricing = AWS_PRICING.aws_vpc_endpoint[endpointType as keyof typeof AWS_PRICING.aws_vpc_endpoint];
        
        if (pricing) {
          return {
            resourceType: 'VPC Endpoint',
            resourceName: nodeData.name || node.id,
            instanceType: endpointType,
            quantity,
            unitCost: pricing.monthly,
            totalCost: pricing.monthly * quantity,
            period: 'monthly',
          };
        }
        break;
      }

      // Free resources
      case 'vpc':
      case 'aws_vpc':
      case 'subnet':
      case 'aws_subnet':
      case 'internet_gateway':
      case 'aws_internet_gateway':
      case 'route_table':
      case 'aws_route_table':
      case 'security_group':
      case 'aws_security_group': {
        return {
          resourceType: getResourceDisplayName(nodeType),
          resourceName: nodeData.name || node.id,
          quantity: 1,
          unitCost: 0,
          totalCost: 0,
          period: 'monthly',
        };
      }

      default: {
        // Unknown resource type - try to estimate based on common patterns
        console.warn(`Unknown resource type for cost estimation: ${nodeType}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error estimating cost for node ${node.id}:`, error);
    return null;
  }

  return null;
}

function getResourceDisplayName(resourceType: string): string {
  const typeMap: Record<string, string> = {
    'vpc': 'VPC',
    'aws_vpc': 'VPC',
    'subnet': 'Subnet',
    'aws_subnet': 'Subnet',
    'internet_gateway': 'Internet Gateway',
    'aws_internet_gateway': 'Internet Gateway',
    'route_table': 'Route Table',
    'aws_route_table': 'Route Table',
    'security_group': 'Security Group',
    'aws_security_group': 'Security Group',
  };

  return typeMap[resourceType] || resourceType;
}

export function optimizeCosts(breakdown: CostBreakdown[]): Array<{
  resourceName: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
  recommendation: string;
}> {
  const optimizations: Array<{
    resourceName: string;
    currentCost: number;
    optimizedCost: number;
    savings: number;
    recommendation: string;
  }> = [];

  breakdown.forEach(item => {
    if (item.resourceType === 'EC2 Instance') {
      // Suggest smaller instance types for development/staging
      if (item.instanceType && ['t3.large', 't3.xlarge', 'm5.large', 'm5.xlarge'].includes(item.instanceType)) {
        const optimizedType = 't3.small';
        const optimizedCost = AWS_PRICING.aws_instance[optimizedType]?.monthly || 0;
        const savings = item.totalCost - (optimizedCost * item.quantity);
        
        if (savings > 0) {
          optimizations.push({
            resourceName: item.resourceName,
            currentCost: item.totalCost,
            optimizedCost: optimizedCost * item.quantity,
            savings,
            recommendation: `Consider using ${optimizedType} instead of ${item.instanceType} for non-production workloads`,
          });
        }
      }
    }

    if (item.resourceType === 'RDS Instance') {
      // Suggest smaller RDS instances for development
      if (item.instanceType && ['db.m5.large', 'db.m5.xlarge'].includes(item.instanceType)) {
        const optimizedType = 'db.t3.small';
        const optimizedCost = AWS_PRICING.aws_db_instance[optimizedType]?.monthly || 0;
        const savings = item.totalCost - (optimizedCost * item.quantity);
        
        if (savings > 0) {
          optimizations.push({
            resourceName: item.resourceName,
            currentCost: item.totalCost,
            optimizedCost: optimizedCost * item.quantity,
            savings,
            recommendation: `Consider using ${optimizedType} instead of ${item.instanceType} for development/testing`,
          });
        }
      }
    }
  });

  return optimizations;
}
