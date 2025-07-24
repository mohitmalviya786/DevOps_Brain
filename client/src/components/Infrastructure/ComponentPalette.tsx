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
    <Card className="w-64">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">AWS Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
