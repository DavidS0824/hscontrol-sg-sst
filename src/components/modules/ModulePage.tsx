import { AppLayout } from "@/components/layout/AppLayout";
import { LucideIcon, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Column {
  key: string;
  label: string;
}

interface ModulePageProps {
  title: string;
  icon: LucideIcon;
  description: string;
  columns: Column[];
  data: Record<string, any>[];
  statusKey?: string;
  addLabel?: string;
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Abierto": "destructive",
  "En investigación": "default",
  "Cerrado": "secondary",
  "Completada": "secondary",
  "Programada": "default",
  "Pendiente": "destructive",
  "Vigente": "secondary",
  "Por vencer": "default",
  "Vencido": "destructive",
  "Conforme": "secondary",
  "No conforme": "destructive",
  "En proceso": "default",
};

export function ModulePage({ title, icon: Icon, description, columns, data, statusKey, addLabel = "Nuevo" }: ModulePageProps) {
  return (
    <AppLayout title={title}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button className="shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            {addLabel}
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                        {statusKey && col.key === statusKey ? (
                          <Badge variant={statusVariants[row[col.key]] || "outline"}>
                            {row[col.key]}
                          </Badge>
                        ) : (
                          <span className="text-card-foreground">{row[col.key]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
