import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

export async function generateTerraformFromDiagram(nodes: any[], edges: any[]): Promise<{
  code: string;
  variables: Record<string, any>;
  outputs: Record<string, any>;
}> {
  try {
    const prompt = `
You are an expert DevOps engineer specializing in Terraform and AWS infrastructure. 
Generate a complete, production-ready Terraform configuration based on the following infrastructure diagram.

Nodes (AWS Resources):
${JSON.stringify(nodes, null, 2)}

Edges (Connections):
${JSON.stringify(edges, null, 2)}

Requirements:
1. Generate valid Terraform code for AWS provider
2. Include proper resource dependencies based on connections
3. Use best practices for security, naming, and tagging
4. Include appropriate variables and outputs
5. Add comments explaining resource purposes
6. Follow AWS Well-Architected Framework principles

Please respond with a JSON object containing:
{
  "code": "complete terraform configuration as string",
  "variables": "terraform variables as object",
  "outputs": "terraform outputs as object"
}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert Terraform and AWS infrastructure engineer. Generate production-ready, secure, and well-documented Terraform code.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            code: { type: "string" },
            variables: { type: "object" },
            outputs: { type: "object" }
          },
          required: ["code", "variables", "outputs"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      code: result.code || "",
      variables: result.variables || {},
      outputs: result.outputs || {},
    };
  } catch (error) {
    console.error("Error generating Terraform code:", error);
    throw new Error("Failed to generate Terraform code with AI");
  }
}

export async function generateCIPipeline(framework: string, deploymentType: string, platform: string): Promise<{
  configuration: string;
  steps: string[];
}> {
  try {
    const prompt = `
Generate a CI/CD pipeline configuration for:
- Framework: ${framework}
- Deployment Type: ${deploymentType}
- Platform: ${platform}

Create a complete, production-ready pipeline configuration that includes:
1. Code checkout
2. Dependency installation
3. Testing (unit tests, linting)
4. Building/compilation
5. Security scanning
6. Deployment steps
7. Post-deployment verification

Respond with JSON containing:
{
  "configuration": "complete pipeline configuration as string",
  "steps": "array of pipeline step descriptions"
}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an expert DevOps engineer specializing in CI/CD pipelines. Generate production-ready pipeline configurations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            configuration: { type: "string" },
            steps: { 
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["configuration", "steps"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      configuration: result.configuration || "",
      steps: result.steps || [],
    };
  } catch (error) {
    console.error("Error generating CI/CD pipeline:", error);
    throw new Error("Failed to generate CI/CD pipeline with AI");
  }
}

export async function analyzeInfrastructureSecurity(nodes: any[]): Promise<{
  score: number;
  issues: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    resource: string;
    issue: string;
    recommendation: string;
  }>;
  compliant: boolean;
}> {
  try {
    const prompt = `
Analyze the security of this AWS infrastructure configuration:

${JSON.stringify(nodes, null, 2)}

Provide a comprehensive security analysis including:
1. Security score (0-100)
2. List of security issues with severity levels
3. Compliance status with security best practices
4. Specific recommendations for each issue

Respond with JSON:
{
  "score": number_between_0_and_100,
  "issues": [
    {
      "severity": "low|medium|high|critical",
      "resource": "resource name or type",
      "issue": "description of security issue",
      "recommendation": "specific remediation steps"
    }
  ],
  "compliant": boolean_indicating_overall_compliance
}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are a cybersecurity expert specializing in AWS infrastructure security analysis and compliance.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            score: { type: "number" },
            issues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
                  resource: { type: "string" },
                  issue: { type: "string" },
                  recommendation: { type: "string" }
                },
                required: ["severity", "resource", "issue", "recommendation"]
              }
            },
            compliant: { type: "boolean" }
          },
          required: ["score", "issues", "compliant"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      score: Math.min(100, Math.max(0, result.score || 0)),
      issues: result.issues || [],
      compliant: result.compliant || false,
    };
  } catch (error) {
    console.error("Error analyzing infrastructure security:", error);
    throw new Error("Failed to analyze infrastructure security with AI");
  }
}

export async function optimizeInfrastructure(nodes: any[]): Promise<{
  suggestions: Array<{
    type: 'cost' | 'performance' | 'security' | 'reliability';
    resource: string;
    current: string;
    suggested: string;
    impact: string;
    savings?: number;
  }>;
}> {
  try {
    const prompt = `
Analyze this AWS infrastructure and provide optimization suggestions:

${JSON.stringify(nodes, null, 2)}

Focus on:
1. Cost optimization opportunities
2. Performance improvements
3. Security enhancements
4. Reliability improvements

Respond with JSON:
{
  "suggestions": [
    {
      "type": "cost|performance|security|reliability",
      "resource": "resource name",
      "current": "current configuration",
      "suggested": "recommended configuration",
      "impact": "expected impact description",
      "savings": optional_cost_savings_in_usd
    }
  ]
}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: "You are an AWS solutions architect expert in infrastructure optimization.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["cost", "performance", "security", "reliability"] },
                  resource: { type: "string" },
                  current: { type: "string" },
                  suggested: { type: "string" },
                  impact: { type: "string" },
                  savings: { type: "number" }
                },
                required: ["type", "resource", "current", "suggested", "impact"]
              }
            }
          },
          required: ["suggestions"]
        }
      },
      contents: prompt
    });

    const result = JSON.parse(response.text || "{}");
    
    return {
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("Error optimizing infrastructure:", error);
    throw new Error("Failed to optimize infrastructure with AI");
  }
}