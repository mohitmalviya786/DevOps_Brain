import {
  users,
  organizations,
  teams,
  projects,
  infrastructureDiagrams,
  terraformConfigurations,
  applications,
  pipelines,
  costEstimations,
  auditLogs,
  organizationMembers,
  teamMembers,
  type User,
  type UpsertUser,
  type Organization,
  type InsertOrganization,
  type Project,
  type InsertProject,
  type InfrastructureDiagram,
  type InsertInfrastructureDiagram,
  type TerraformConfiguration,
  type InsertTerraformConfiguration,
  type Application,
  type InsertApplication,
  type Pipeline,
  type InsertPipeline,
  type CostEstimation,
  type AuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  createOrganization(org: InsertOrganization, userId: string): Promise<Organization>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  getOrganization(id: number): Promise<Organization | undefined>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjectsByOrganization(organizationId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, updates: Partial<InsertProject>): Promise<Project>;
  
  // Infrastructure diagram operations
  createInfrastructureDiagram(diagram: InsertInfrastructureDiagram): Promise<InfrastructureDiagram>;
  getProjectDiagrams(projectId: number): Promise<InfrastructureDiagram[]>;
  getDiagram(id: number): Promise<InfrastructureDiagram | undefined>;
  updateDiagram(id: number, diagramData: any, userId: string): Promise<InfrastructureDiagram>;
  
  // Terraform operations
  saveTerraformConfiguration(config: InsertTerraformConfiguration): Promise<TerraformConfiguration>;
  getTerraformConfiguration(diagramId: number): Promise<TerraformConfiguration | undefined>;
  
  // Application operations
  createApplication(app: InsertApplication): Promise<Application>;
  getProjectApplications(projectId: number): Promise<Application[]>;
  
  // Pipeline operations
  createPipeline(pipeline: InsertPipeline): Promise<Pipeline>;
  getApplicationPipelines(applicationId: number): Promise<Pipeline[]>;
  
  // Cost estimation operations
  saveCostEstimation(estimation: Omit<CostEstimation, 'id' | 'calculatedAt'>): Promise<CostEstimation>;
  getCostEstimation(diagramId: number): Promise<CostEstimation | undefined>;
  
  // Audit log operations
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization operations
  async createOrganization(org: InsertOrganization, userId: string): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(org)
      .returning();
    
    // Add the creator as an admin
    await db.insert(organizationMembers).values({
      userId,
      organizationId: organization.id,
      role: 'admin',
    });
    
    return organization;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const result = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        description: organizations.description,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
      })
      .from(organizations)
      .innerJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
      .where(eq(organizationMembers.userId, userId));
    
    return result;
  }

  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProjectsByOrganization(organizationId: number): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.organizationId, organizationId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: number, updates: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  // Infrastructure diagram operations
  async createInfrastructureDiagram(diagram: InsertInfrastructureDiagram): Promise<InfrastructureDiagram> {
    const [newDiagram] = await db
      .insert(infrastructureDiagrams)
      .values(diagram)
      .returning();
    return newDiagram;
  }

  async getProjectDiagrams(projectId: number): Promise<InfrastructureDiagram[]> {
    return await db
      .select()
      .from(infrastructureDiagrams)
      .where(eq(infrastructureDiagrams.projectId, projectId))
      .orderBy(desc(infrastructureDiagrams.updatedAt));
  }

  async getDiagram(id: number): Promise<InfrastructureDiagram | undefined> {
    const [diagram] = await db
      .select()
      .from(infrastructureDiagrams)
      .where(eq(infrastructureDiagrams.id, id));
    return diagram;
  }

  async updateDiagram(id: number, diagramData: any, userId: string): Promise<InfrastructureDiagram> {
    const [updated] = await db
      .update(infrastructureDiagrams)
      .set({ 
        diagramData,
        updatedAt: new Date(),
        version: db.$sql`version + 1`
      })
      .where(eq(infrastructureDiagrams.id, id))
      .returning();
    return updated;
  }

  // Terraform operations
  async saveTerraformConfiguration(config: InsertTerraformConfiguration): Promise<TerraformConfiguration> {
    const [saved] = await db
      .insert(terraformConfigurations)
      .values(config)
      .returning();
    return saved;
  }

  async getTerraformConfiguration(diagramId: number): Promise<TerraformConfiguration | undefined> {
    const [config] = await db
      .select()
      .from(terraformConfigurations)
      .where(eq(terraformConfigurations.diagramId, diagramId))
      .orderBy(desc(terraformConfigurations.createdAt))
      .limit(1);
    return config;
  }

  // Application operations
  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db
      .insert(applications)
      .values(app)
      .returning();
    return newApp;
  }

  async getProjectApplications(projectId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.projectId, projectId))
      .orderBy(desc(applications.updatedAt));
  }

  // Pipeline operations
  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const [newPipeline] = await db
      .insert(pipelines)
      .values(pipeline)
      .returning();
    return newPipeline;
  }

  async getApplicationPipelines(applicationId: number): Promise<Pipeline[]> {
    return await db
      .select()
      .from(pipelines)
      .where(eq(pipelines.applicationId, applicationId))
      .orderBy(desc(pipelines.updatedAt));
  }

  // Cost estimation operations
  async saveCostEstimation(estimation: Omit<CostEstimation, 'id' | 'calculatedAt'>): Promise<CostEstimation> {
    const [saved] = await db
      .insert(costEstimations)
      .values(estimation)
      .returning();
    return saved;
  }

  async getCostEstimation(diagramId: number): Promise<CostEstimation | undefined> {
    const [estimation] = await db
      .select()
      .from(costEstimations)
      .where(eq(costEstimations.diagramId, diagramId))
      .orderBy(desc(costEstimations.calculatedAt))
      .limit(1);
    return estimation;
  }

  // Audit log operations
  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [newLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return newLog;
  }
}

export const storage = new DatabaseStorage();
