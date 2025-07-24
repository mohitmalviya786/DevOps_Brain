import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateTerraformCode } from "./services/terraformGenerator";
import { estimateCosts } from "./services/costEstimator";
import { 
  generateCIPipeline, 
  analyzeInfrastructureSecurity, 
  optimizeInfrastructure,
  detectFrameworkAndServer,
  generateContainerOrchestrationConfig,
  generateCICDIntegration,
  generateLoggingMonitoringConfig,
  generateSecurityIntegration,
  generateWorkflowManagementConfig,
  generateTestAndVerificationPlan
} from "./services/gemini";
import { 
  insertProjectSchema,
  insertInfrastructureDiagramSchema,
  insertApplicationSchema,
  insertPipelineSchema,
  insertTerraformConfigurationSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Organization routes
  app.get("/api/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const organizations = await storage.getUserOrganizations(userId);
      res.json(organizations);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.post("/api/organizations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgData = req.body;
      const organization = await storage.createOrganization(orgData, userId);
      res.json(organization);
    } catch (error) {
      console.error("Error creating organization:", error);
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  // Project routes
  app.get("/api/organizations/:orgId/projects", isAuthenticated, async (req, res) => {
    try {
      const organizationId = parseInt(req.params.orgId);
      const projects = await storage.getProjectsByOrganization(organizationId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({ 
        ...req.body, 
        createdBy: userId 
      });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Infrastructure diagram routes
  app.get("/api/projects/:projectId/diagrams", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const diagrams = await storage.getProjectDiagrams(projectId);
      res.json(diagrams);
    } catch (error) {
      console.error("Error fetching diagrams:", error);
      res.status(500).json({ message: "Failed to fetch diagrams" });
    }
  });

  app.post("/api/diagrams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const diagramData = insertInfrastructureDiagramSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const diagram = await storage.createInfrastructureDiagram(diagramData);
      res.json(diagram);
    } catch (error) {
      console.error("Error creating diagram:", error);
      res.status(500).json({ message: "Failed to create diagram" });
    }
  });

  app.get("/api/diagrams/:id", isAuthenticated, async (req, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      const diagram = await storage.getDiagram(diagramId);
      if (!diagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      res.json(diagram);
    } catch (error) {
      console.error("Error fetching diagram:", error);
      res.status(500).json({ message: "Failed to fetch diagram" });
    }
  });

  app.put("/api/diagrams/:id", isAuthenticated, async (req: any, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { diagramData } = req.body;
      
      const updated = await storage.updateDiagram(diagramId, diagramData, userId);
      res.json(updated);
    } catch (error) {
      console.error("Error updating diagram:", error);
      res.status(500).json({ message: "Failed to update diagram" });
    }
  });

  // Terraform generation routes
  app.post("/api/diagrams/:id/terraform", isAuthenticated, async (req: any, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const diagram = await storage.getDiagram(diagramId);
      if (!diagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      // Fetch the project to get the cloudProvider
      if (!diagram.projectId) {
        return res.status(404).json({ message: "Project ID not found for diagram" });
      }
      const project = await storage.getProject(diagram.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found for diagram" });
      }
      const cloudProvider = (project.cloudProvider as 'aws' | 'azure' | 'gcp') || 'aws';

      const terraformCode = await generateTerraformCode(diagram.diagramData, cloudProvider);
      
      const configData = insertTerraformConfigurationSchema.parse({
        diagramId,
        code: terraformCode.code,
        variables: terraformCode.variables,
        outputs: terraformCode.outputs,
        generatedBy: userId,
      });

      const savedConfig = await storage.saveTerraformConfiguration(configData);
      res.json(savedConfig);
    } catch (error) {
      console.error("Error generating Terraform:", error);
      res.status(500).json({ message: "Failed to generate Terraform code" });
    }
  });

  app.get("/api/diagrams/:id/terraform", isAuthenticated, async (req, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      const config = await storage.getTerraformConfiguration(diagramId);
      if (!config) {
        return res.status(404).json({ message: "Terraform configuration not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching Terraform configuration:", error);
      res.status(500).json({ message: "Failed to fetch Terraform configuration" });
    }
  });

  // Cost estimation routes
  app.post("/api/diagrams/:id/costs", isAuthenticated, async (req, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      
      const diagram = await storage.getDiagram(diagramId);
      if (!diagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      // Fetch the project to get the cloudProvider
      if (!diagram.projectId) {
        return res.status(404).json({ message: "Project ID not found for diagram" });
      }
      const project = await storage.getProject(diagram.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found for diagram" });
      }
      const cloudProvider = (project.cloudProvider as 'aws' | 'azure' | 'gcp') || 'aws';

      const costEstimation = await estimateCosts(diagram.diagramData, cloudProvider);
      
      const savedEstimation = await storage.saveCostEstimation({
        diagramId,
        estimatedMonthlyCost: costEstimation.totalMonthlyCost.toString(),
        costBreakdown: costEstimation.breakdown,
        currency: 'USD',
      });

      res.json(savedEstimation);
    } catch (error) {
      console.error("Error estimating costs:", error);
      res.status(500).json({ message: "Failed to estimate costs" });
    }
  });

  app.get("/api/diagrams/:id/costs", isAuthenticated, async (req, res) => {
    try {
      const diagramId = parseInt(req.params.id);
      const estimation = await storage.getCostEstimation(diagramId);
      if (!estimation) {
        return res.status(404).json({ message: "Cost estimation not found" });
      }
      res.json(estimation);
    } catch (error) {
      console.error("Error fetching cost estimation:", error);
      res.status(500).json({ message: "Failed to fetch cost estimation" });
    }
  });

  // Application routes
  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appData = insertApplicationSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const application = await storage.createApplication(appData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/projects/:projectId/applications", isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const applications = await storage.getProjectApplications(projectId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Pipeline routes
  app.post("/api/pipelines", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pipelineData = insertPipelineSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const pipeline = await storage.createPipeline(pipelineData);
      res.json(pipeline);
    } catch (error) {
      console.error("Error creating pipeline:", error);
      res.status(500).json({ message: "Failed to create pipeline" });
    }
  });

  // AI-powered features routes
  app.post("/api/ai/generate-pipeline", isAuthenticated, async (req, res) => {
    try {
      const { framework, deploymentType, platform } = req.body;
      const result = await generateCIPipeline(framework, deploymentType, platform);
      res.json(result);
    } catch (error) {
      console.error("Error generating CI/CD pipeline:", error);
      res.status(500).json({ message: "Failed to generate CI/CD pipeline" });
    }
  });

  app.post("/api/ai/analyze-security", isAuthenticated, async (req, res) => {
    try {
      const { nodes } = req.body;
      const result = await analyzeInfrastructureSecurity(nodes);
      res.json(result);
    } catch (error) {
      console.error("Error analyzing security:", error);
      res.status(500).json({ message: "Failed to analyze infrastructure security" });
    }
  });

  app.post("/api/ai/optimize-infrastructure", isAuthenticated, async (req, res) => {
    try {
      const { nodes, diagramId } = req.body;
      let cloudProvider: 'aws' | 'azure' | 'gcp' = 'aws';
      if (diagramId) {
        const diagram = await storage.getDiagram(diagramId);
        if (diagram && diagram.projectId) {
          const project = await storage.getProject(diagram.projectId);
          if (project) {
            cloudProvider = (project.cloudProvider as 'aws' | 'azure' | 'gcp') || 'aws';
          }
        }
      }
      const result = await optimizeInfrastructure(nodes, cloudProvider);
      res.json(result);
    } catch (error) {
      console.error("Error optimizing infrastructure:", error);
      res.status(500).json({ message: "Failed to optimize infrastructure" });
    }
  });

  // Universal application framework detection and deployment
  app.post("/api/applications/detect-framework", isAuthenticated, async (req, res) => {
    try {
      const { repositoryUrl, codeSample } = req.body;
      const result = await detectFrameworkAndServer({ repositoryUrl, codeSample });
      res.json(result);
    } catch (error) {
      console.error("Error detecting framework and server:", error);
      res.status(500).json({ message: "Failed to detect framework and server" });
    }
  });

  // Container orchestration config generation
  app.post("/api/applications/orchestration-config", isAuthenticated, async (req, res) => {
    try {
      const { framework, deploymentType, services, orchestration } = req.body;
      const result = await generateContainerOrchestrationConfig({ framework, deploymentType, services, orchestration });
      res.json(result);
    } catch (error) {
      console.error("Error generating container orchestration config:", error);
      res.status(500).json({ message: "Failed to generate container orchestration config" });
    }
  });

  // CI/CD integration and webhook management
  app.post("/api/applications/cicd-integration", isAuthenticated, async (req, res) => {
    try {
      const { platform, repositoryUrl } = req.body;
      const result = await generateCICDIntegration({ platform, repositoryUrl });
      res.json(result);
    } catch (error) {
      console.error("Error generating CI/CD integration:", error);
      res.status(500).json({ message: "Failed to generate CI/CD integration" });
    }
  });

  // Logging/monitoring integration config generation
  app.post("/api/logging-monitoring/config", isAuthenticated, async (req, res) => {
    try {
      const { solution, deploymentType, cloudProvider, services } = req.body;
      const result = await generateLoggingMonitoringConfig({ solution, deploymentType, cloudProvider, services });
      res.json(result);
    } catch (error) {
      console.error("Error generating logging/monitoring config:", error);
      res.status(500).json({ message: "Failed to generate logging/monitoring config" });
    }
  });

  // Enterprise security integration config generation
  app.post("/api/security/integration", isAuthenticated, async (req, res) => {
    try {
      const { securityFeature, applicationType, cloudProvider } = req.body;
      const result = await generateSecurityIntegration({ securityFeature, applicationType, cloudProvider });
      res.json(result);
    } catch (error) {
      console.error("Error generating security integration:", error);
      res.status(500).json({ message: "Failed to generate security integration" });
    }
  });

  // Advanced workflow management config generation
  app.post("/api/workflow-management/config", isAuthenticated, async (req, res) => {
    try {
      const { workflowFeature, cloudProvider, environments, databases } = req.body;
      const result = await generateWorkflowManagementConfig({ workflowFeature, cloudProvider, environments, databases });
      res.json(result);
    } catch (error) {
      console.error("Error generating workflow management config:", error);
      res.status(500).json({ message: "Failed to generate workflow management config" });
    }
  });

  // Test and verification plan generation
  app.post("/api/test-verification/plan", isAuthenticated, async (req, res) => {
    try {
      const { features, integrations } = req.body;
      const result = await generateTestAndVerificationPlan({ features, integrations });
      res.json(result);
    } catch (error) {
      console.error("Error generating test and verification plan:", error);
      res.status(500).json({ message: "Failed to generate test and verification plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
