# Enterprise AI-Powered DevOps Platform

## Overview

This is a comprehensive enterprise-grade AI-powered DevOps SaaS platform built for infrastructure management and application deployment. The platform provides drag-and-drop infrastructure design, AI-powered Terraform generation, cost estimation, and enterprise security features.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 24, 2025 - Migration to Replit Environment Complete**
- ✓ Migrated from Replit Agent to standard Replit environment
- ✓ Configured PostgreSQL database with all required tables
- ✓ Fixed session authentication with secure fallback configuration
- ✓ Resolved all TypeScript compilation errors
- ✓ Application successfully running on port 5000
- ✓ All API endpoints functional and properly authenticated
- ✓ Fixed infrastructure design page layout with proper 3-panel design
- ✓ Resolved React Flow sizing warnings and auto-save issues
- ✓ All navigation routes working correctly

## System Architecture

### Monorepo Structure
The application follows a full-stack monorepo architecture with clear separation between client, server, and shared code:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared types, schemas, and utilities
- `migrations/` - Database migration files

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for bundling
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS with Shadcn/UI components
- **State Management**: Zustand for client state
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: Replit Auth with OpenID Connect

## Key Components

### Frontend Architecture
- **Component-based design** using React with TypeScript
- **Modern UI library** with Shadcn/UI and Radix UI primitives
- **Responsive design** with Tailwind CSS
- **State management** using Zustand stores
- **Real-time updates** capability with Socket.IO integration ready
- **Interactive diagrams** using React Flow for infrastructure design

### Backend Architecture
- **RESTful API** built with Express.js
- **Type-safe database operations** using Drizzle ORM
- **Authentication middleware** for route protection
- **AI integration** with OpenAI for Terraform code generation
- **Cost estimation service** for cloud resource pricing
- **Session management** with PostgreSQL session store

### Database Design
- **User management** with Replit Auth integration
- **Organizational hierarchy** supporting teams, departments, and projects
- **Infrastructure diagrams** with JSON storage for diagram data
- **Terraform configurations** with versioning support
- **Cost estimations** and audit logging
- **Role-based access control** with membership tables

## Data Flow

### Infrastructure Design Workflow
1. User creates/opens project in organization
2. Drag-and-drop interface for AWS resource placement
3. Real-time diagram updates stored in Zustand state
4. Properties panel for resource configuration
5. AI-powered Terraform code generation via OpenAI
6. Cost estimation calculation using AWS pricing data
7. Code validation and security analysis
8. Save to database or export for deployment

### Authentication Flow
1. Replit OpenID Connect integration
2. Session-based authentication with PostgreSQL storage
3. User profile creation/updates in database
4. Organization membership and role assignment
5. Route-level authorization checks

### API Architecture
- RESTful endpoints following `/api/{resource}` pattern
- Authentication middleware on protected routes
- Error handling with consistent JSON responses
- Request/response logging for debugging

## External Dependencies

### AI Services
- **OpenAI GPT-4o** for Terraform code generation and optimization
- Custom prompts for infrastructure-as-code best practices

### Database
- **Neon PostgreSQL** as the primary database
- Connection pooling with `@neondatabase/serverless`
- Migration management with Drizzle Kit

### Cloud Provider APIs
- AWS pricing APIs for cost estimation
- Support for multi-cloud pricing (AWS, Azure, GCP)

### Authentication
- **Replit Auth** for user authentication
- OpenID Connect protocol implementation
- Session management with `connect-pg-simple`

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations with `drizzle-kit push`
- Environment variable configuration

### Production Build
- Frontend: Vite production build to `dist/public`
- Backend: ESBuild bundling to `dist/index.js`
- Single deployable artifact with static file serving
- PostgreSQL database with connection pooling

### Architecture Decisions

#### Database Choice
- **PostgreSQL** chosen for ACID compliance and JSON support
- **Drizzle ORM** for type safety and migration management
- Schema-first approach with shared types

#### Frontend Framework
- **React with TypeScript** for type safety and component reusability
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling and design consistency

#### Authentication Strategy
- **Replit Auth** for seamless Replit integration
- **Session-based auth** for simplicity and security
- **Role-based access control** for enterprise features

#### AI Integration
- **OpenAI GPT-4o** for intelligent code generation
- **Structured prompts** for consistent Terraform output
- **Validation layer** for generated code quality

#### State Management
- **Zustand** for client-side state (lightweight alternative to Redux)
- **TanStack Query** for server state management and caching
- **Local state** for UI-specific interactions

The platform is designed to scale from small teams to enterprise organizations with comprehensive audit logging, role-based permissions, and multi-cloud support.