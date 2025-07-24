import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-cloud text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-foreground">CloudOps AI</h1>
                <p className="text-sm text-slate-500 dark:text-muted-foreground">Enterprise DevOps Platform</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <i className="fas fa-star mr-1"></i>
              AI-Powered Infrastructure Management
            </Badge>
            <h1 className="text-5xl font-bold text-slate-900 dark:text-foreground mb-6">
              Revolutionize Your
              <span className="text-primary block">DevOps Workflow</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-muted-foreground mb-8 leading-relaxed">
              Build, deploy, and manage cloud infrastructure with AI-powered automation. 
              Drag-and-drop design, intelligent Terraform generation, and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-primary/90 px-8 py-3"
              >
                <i className="fas fa-rocket mr-2"></i>
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-3"
              >
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white/50 dark:bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-4">
              Enterprise-Grade DevOps Platform
            </h2>
            <p className="text-lg text-slate-600 dark:text-muted-foreground">
              Everything you need to streamline your infrastructure management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Infrastructure Design */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-diagram-project text-blue-600 dark:text-blue-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">Visual Infrastructure Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Drag-and-drop interface to design your AWS infrastructure with real-time validation and cost estimation.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Multi-cloud support (AWS, Azure, GCP)
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Interactive component library
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Real-time collaboration
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI-Powered Automation */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-magic text-purple-600 dark:text-purple-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">AI-Powered Code Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Generate production-ready Terraform code and CI/CD pipelines with AI optimization and best practices.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Intelligent Terraform generation
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Automated CI/CD pipelines
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Security scanning & compliance
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cost Optimization */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-dollar-sign text-green-600 dark:text-green-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">Smart Cost Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Real-time cost estimation, optimization recommendations, and budget tracking across all cloud providers.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Real-time cost analysis
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    AI optimization suggestions
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Budget alerts & tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Security */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-shield-alt text-red-600 dark:text-red-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Role-based access control, SSO integration, and comprehensive audit logging for enterprise compliance.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Multi-factor authentication
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    SSO & OAuth integration
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Comprehensive audit logs
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Deployment Automation */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-rocket text-indigo-600 dark:text-indigo-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">Universal Deployment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Deploy applications across VMs, containers, and serverless platforms with automated framework detection.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Auto framework detection
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Container orchestration
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Multi-environment support
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Monitoring & Observability */}
            <Card className="border-slate-200 dark:border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center mb-4">
                  <i className="fas fa-chart-line text-yellow-600 dark:text-yellow-400 text-xl"></i>
                </div>
                <CardTitle className="text-slate-900 dark:text-foreground">Advanced Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-muted-foreground">
                  Comprehensive logging, monitoring, and alerting with support for popular tools like ELK, Grafana, and DataDog.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-muted-foreground">
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    ELK/EFK stack integration
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Prometheus & Grafana
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-green-500 mr-2"></i>
                    Intelligent alerting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-foreground mb-4">
            Ready to Transform Your DevOps?
          </h2>
          <p className="text-lg text-slate-600 dark:text-muted-foreground mb-8">
            Join thousands of engineering teams who trust CloudOps AI for their infrastructure management.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            className="bg-primary hover:bg-primary/90 px-8 py-3"
          >
            <i className="fas fa-rocket mr-2"></i>
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-border bg-white/80 dark:bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-cloud text-primary-foreground"></i>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-foreground">CloudOps AI</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-muted-foreground">
              © 2024 CloudOps AI. Built for enterprise DevOps teams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
