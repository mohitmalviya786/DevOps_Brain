export interface InfrastructureNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    name?: string;
    instanceType?: string;
    instanceClass?: string;
    storageGB?: number;
    storageClass?: string;
    quantity?: number;
    properties?: Record<string, any>;
  };
}

export interface InfrastructureEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    label?: string;
  };
}

export interface DiagramData {
  nodes: InfrastructureNode[];
  edges: InfrastructureEdge[];
}

export interface AWSResource {
  type: string;
  icon: string;
  label: string;
  category: 'compute' | 'storage' | 'network' | 'database' | 'security';
  color: string;
  defaultProps: Record<string, any>;
}

export const AWS_RESOURCES: AWSResource[] = [
  {
    type: 'ec2',
    icon: 'fas fa-server',
    label: 'EC2',
    category: 'compute',
    color: 'text-orange-500',
    defaultProps: {
      instanceType: 't3.micro',
      ami: 'ami-0abcdef1234567890',
    },
  },
  {
    type: 'lambda',
    icon: 'fas fa-bolt',
    label: 'Lambda',
    category: 'compute',
    color: 'text-orange-500',
    defaultProps: {
      runtime: 'nodejs18.x',
      timeout: 30,
    },
  },
  {
    type: 's3',
    icon: 'fas fa-hdd',
    label: 'S3',
    category: 'storage',
    color: 'text-green-500',
    defaultProps: {
      storageClass: 'STANDARD',
      versioning: false,
    },
  },
  {
    type: 'rds',
    icon: 'fas fa-database',
    label: 'RDS',
    category: 'database',
    color: 'text-blue-500',
    defaultProps: {
      instanceClass: 'db.t3.micro',
      engine: 'mysql',
      engineVersion: '8.0',
    },
  },
  {
    type: 'vpc',
    icon: 'fas fa-network-wired',
    label: 'VPC',
    category: 'network',
    color: 'text-purple-500',
    defaultProps: {
      cidrBlock: '10.0.0.0/16',
    },
  },
  {
    type: 'alb',
    icon: 'fas fa-balance-scale',
    label: 'ALB',
    category: 'network',
    color: 'text-purple-500',
    defaultProps: {
      loadBalancerType: 'application',
    },
  },
  {
    type: 'nat_gateway',
    icon: 'fas fa-route',
    label: 'NAT Gateway',
    category: 'network',
    color: 'text-purple-500',
    defaultProps: {},
  },
  {
    type: 'internet_gateway',
    icon: 'fas fa-globe',
    label: 'Internet Gateway',
    category: 'network',
    color: 'text-purple-500',
    defaultProps: {},
  },
];

export interface TerraformConfig {
  id: number;
  diagramId: number;
  code: string;
  variables: Record<string, any>;
  outputs: Record<string, any>;
}

export interface CostEstimation {
  id: number;
  diagramId: number;
  estimatedMonthlyCost: string;
  costBreakdown: any;
  currency: string;
  calculatedAt: string;
}
