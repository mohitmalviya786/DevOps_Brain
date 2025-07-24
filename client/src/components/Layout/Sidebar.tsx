import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  className?: string;
}

const navigation = [
  {
    title: "Infrastructure",
    items: [
      { name: "Infrastructure Designer", href: "/infrastructure", icon: "fas fa-diagram-project", active: true },
      { name: "Resources", href: "/resources", icon: "fas fa-server" },
      { name: "Cost Optimization", href: "/costs", icon: "fas fa-dollar-sign" },
    ],
  },
  {
    title: "Deployment",
    items: [
      { name: "Applications", href: "/applications", icon: "fas fa-rocket" },
      { name: "CI/CD Pipelines", href: "/pipelines", icon: "fas fa-code-branch" },
      { name: "Containers", href: "/containers", icon: "fas fa-docker" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Monitoring", href: "/monitoring", icon: "fas fa-chart-line" },
      { name: "Logs", href: "/logs", icon: "fas fa-file-alt" },
      { name: "Security", href: "/security", icon: "fas fa-shield-alt" },
    ],
  },
  {
    title: "Organization",
    items: [
      { name: "Teams", href: "/teams", icon: "fas fa-users" },
      { name: "Settings", href: "/settings", icon: "fas fa-cog" },
    ],
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className={cn("w-64 bg-white border-r border-slate-200 flex flex-col", className)}>
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-cloud text-primary-foreground text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">CloudOps AI</h1>
            <p className="text-xs text-slate-500">Enterprise DevOps</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            {section.items.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + '/');
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <i className={cn(item.icon, "w-4")}></i>
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-slate-600 text-sm"></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">DevOps Engineer</p>
            <p className="text-xs text-slate-500 truncate">Enterprise User</p>
          </div>
          <button 
            onClick={() => window.location.href = '/api/logout'}
            className="text-slate-400 hover:text-slate-600"
            title="Logout"
          >
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
