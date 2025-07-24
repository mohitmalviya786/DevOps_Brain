import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams within organizations
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User organization memberships
export const organizationMembers = pgTable("organization_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // admin, member, viewer
  createdAt: timestamp("created_at").defaultNow(),
});

// User team memberships
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  role: varchar("role", { length: 50 }).notNull().default("member"), // lead, member
  createdAt: timestamp("created_at").defaultNow(),
});

// Infrastructure projects
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  teamId: integer("team_id").references(() => teams.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  cloudProvider: varchar("cloud_provider", { length: 50 }).notNull().default("aws"), // aws, azure, gcp
  region: varchar("region", { length: 50 }).notNull().default("us-east-1"),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // draft, active, archived
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Infrastructure diagrams
export const infrastructureDiagrams = pgTable("infrastructure_diagrams", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  diagramData: jsonb("diagram_data").notNull(), // React Flow nodes and edges
  version: integer("version").notNull().default(1),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generated Terraform code
export const terraformConfigurations = pgTable("terraform_configurations", {
  id: serial("id").primaryKey(),
  diagramId: integer("diagram_id").references(() => infrastructureDiagrams.id),
  code: text("code").notNull(),
  variables: jsonb("variables"), // Terraform variables
  outputs: jsonb("outputs"), // Terraform outputs
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cost estimations
export const costEstimations = pgTable("cost_estimations", {
  id: serial("id").primaryKey(),
  diagramId: integer("diagram_id").references(() => infrastructureDiagrams.id),
  estimatedMonthlyCost: decimal("estimated_monthly_cost", { precision: 10, scale: 2 }),
  costBreakdown: jsonb("cost_breakdown"), // Detailed cost breakdown by resource
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Application deployments
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  framework: varchar("framework", { length: 50 }), // react, vue, node, python, etc.
  repositoryUrl: varchar("repository_url", { length: 500 }),
  deploymentType: varchar("deployment_type", { length: 50 }).notNull().default("container"), // vm, container, serverless
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, deployed, failed
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CI/CD pipelines
export const pipelines = pgTable("pipelines", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id),
  name: varchar("name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // github-actions, gitlab-ci, jenkins, etc.
  configuration: jsonb("configuration").notNull(), // Pipeline configuration YAML/JSON
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").references(() => organizations.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: varchar("resource_id", { length: 50 }),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  teams: many(teams),
  projects: many(projects),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [teams.organizationId],
    references: [organizations.id],
  }),
  members: many(teamMembers),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  diagrams: many(infrastructureDiagrams),
  applications: many(applications),
}));

export const infrastructureDiagramsRelations = relations(infrastructureDiagrams, ({ one, many }) => ({
  project: one(projects, {
    fields: [infrastructureDiagrams.projectId],
    references: [projects.id],
  }),
  terraformConfigurations: many(terraformConfigurations),
  costEstimations: many(costEstimations),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInfrastructureDiagramSchema = createInsertSchema(infrastructureDiagrams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTerraformConfigurationSchema = createInsertSchema(terraformConfigurations).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPipelineSchema = createInsertSchema(pipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Team = typeof teams.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InfrastructureDiagram = typeof infrastructureDiagrams.$inferSelect;
export type InsertInfrastructureDiagram = z.infer<typeof insertInfrastructureDiagramSchema>;
export type TerraformConfiguration = typeof terraformConfigurations.$inferSelect;
export type InsertTerraformConfiguration = z.infer<typeof insertTerraformConfigurationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type CostEstimation = typeof costEstimations.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
