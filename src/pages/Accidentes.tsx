import { AlertTriangle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalizarConIA } from "@/components/AnalizarConIA";

const data = [
  { fecha: "2024-06-15", trabajador: "Juan Martínez", area: "Producción", tipo: "Accidente", severidad: "Moderado", estado: "En investigación" },
  { fecha: "2024-06-10", trabajador: "María López", area: "Bodega", tipo: "Incidente", severidad: "Leve", estado: "Cerrado" },
  { fecha: "2024-06-02", trabajador: "Carlos Ruiz", area: "Mantenimiento", tipo: "Accidente", severidad: "Grave", estado: "Abierto" },
  { fecha: "2024-05-28", trabajador: "Ana García", area: "Oficinas", tipo: "Incidente", severidad: "Leve", estado: "Cerrado" },
  { fecha: "2024-05-15", trabajador: "Pedro Sánchez", area: "Producción", tipo: "Accidente", severidad: "Moderado", estado: "Cerrado" },
];

const variant = (s: string) =>
  s === "Abierto" || s === "Grave" ? "destructive" : s === "Cerrado" ? "secondary" : "default";

export default function Accidentes() {
  return (
    <AppLayout title="Accidentes e Incidentes">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Registro, seguimiento y cierre de accidentes e incidentes laborales.
          </p>
          <AnalizarConIA contexto="Accidentes e Incidentes" datosExtra={{ accidentes_demo: data }} />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["Fecha", "Trabajador", "Área", "Tipo", "Severidad", "Estado"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">{r.fecha}</td>
                    <td className="px-4 py-3 font-medium">{r.trabajador}</td>
                    <td className="px-4 py-3">{r.area}</td>
                    <td className="px-4 py-3">{r.tipo}</td>
                    <td className="px-4 py-3"><Badge variant={variant(r.severidad)}>{r.severidad}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={variant(r.estado)}>{r.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
