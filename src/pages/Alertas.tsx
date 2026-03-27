import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, AlertTriangle, Stethoscope, FileText, GraduationCap, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const alertas = [
  {
    icon: Stethoscope,
    titulo: "Examen médico vencido",
    descripcion: "Carlos Ruiz - Examen periódico venció el 20/05/2024",
    prioridad: "Alta",
    fecha: "Hace 28 días",
    variant: "destructive" as const,
  },
  {
    icon: Stethoscope,
    titulo: "Examen médico por vencer",
    descripcion: "Ana García - Examen periódico vence el 10/07/2024",
    prioridad: "Media",
    fecha: "En 22 días",
    variant: "default" as const,
  },
  {
    icon: FileText,
    titulo: "Documento por vencer",
    descripcion: "Procedimiento de trabajo en alturas requiere actualización",
    prioridad: "Media",
    fecha: "En 15 días",
    variant: "default" as const,
  },
  {
    icon: GraduationCap,
    titulo: "Capacitación pendiente",
    descripcion: "Trabajo en alturas - 25 trabajadores sin certificar",
    prioridad: "Alta",
    fecha: "Programada 20/06",
    variant: "destructive" as const,
  },
  {
    icon: AlertTriangle,
    titulo: "Accidente sin cerrar",
    descripcion: "Accidente de Carlos Ruiz en Mantenimiento sigue abierto",
    prioridad: "Alta",
    fecha: "Hace 16 días",
    variant: "destructive" as const,
  },
  {
    icon: Clock,
    titulo: "Inspección pendiente",
    descripcion: "Inspección ergonómica en Oficinas sin completar",
    prioridad: "Baja",
    fecha: "Programada 20/06",
    variant: "secondary" as const,
  },
];

const prioridadColors: Record<string, string> = {
  Alta: "destructive",
  Media: "default",
  Baja: "secondary",
};

export default function Alertas() {
  return (
    <AppLayout title="Alertas y Notificaciones">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sistema de alertas inteligentes con notificaciones por vencimientos y recordatorios automáticos.
        </p>

        <div className="space-y-3">
          {alertas.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                a.variant === "destructive" ? "bg-destructive/10 text-destructive" :
                a.variant === "default" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
              }`}>
                <a.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-card-foreground">{a.titulo}</h4>
                  <Badge variant={prioridadColors[a.prioridad] as any}>{a.prioridad}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.descripcion}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{a.fecha}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
