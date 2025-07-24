import { AWS_RESOURCES } from "@/types/infrastructure";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ComponentPaletteProps {
  onComponentSelect: (resourceType: string) => void;
}

export default function ComponentPalette({ onComponentSelect }: ComponentPaletteProps) {
  const categories = AWS_RESOURCES.reduce((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {} as Record<string, typeof AWS_RESOURCES>);

  const categoryDisplayNames = {
    compute: 'Compute',
    storage: 'Storage',
    network: 'Network',
    database: 'Database',
    security: 'Security',
  };

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-foreground">AWS Resources</h3>
        <p className="text-sm text-slate-500 dark:text-muted-foreground">Drag components to the canvas</p>
      </div>
      <div className="space-y-4">
        {Object.entries(categories).map(([category, resources]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-slate-500 mb-2">
              {categoryDisplayNames[category as keyof typeof categoryDisplayNames]}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {resources.map((resource) => (
                <button
                  key={resource.type}
                  onClick={() => onComponentSelect(resource.type)}
                  className="flex flex-col items-center p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 group transition-colors"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', resource.type);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                >
                  <i className={cn(resource.icon, resource.color, "mb-1")}></i>
                  <span className="text-xs text-slate-600 group-hover:text-primary">
                    {resource.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
