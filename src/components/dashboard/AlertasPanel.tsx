import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Stethoscope, FileWarning, ShieldAlert, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertaExamen { id: string; trabajador_nombre: string; fecha_vencimiento: string; dias: number; }
interface AlertaACI { id: string; descripcion: string; area: string | null; fecha_reporte: string; }
interface AlertaPermiso { id: string; descripcion_tarea: string; responsable: string; fecha_inicio: string; }

export function AlertasPanel() {
  const [loading, setLoading] = useState(true);
  const [examenes, setExamenes] = useState<AlertaExamen[]>([]);
  const [aci, setAci] = useState<AlertaACI[]>([]);
  const [permisos, setPermisos] = useState<AlertaPermiso[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const hoy = new Date();
      const en30 = new Date(); en30.setDate(hoy.getDate() + 30);

      const [exRes, aciRes, permRes] = await Promise.all([
        supabase
          .from("examenes_medicos")
          .select("id,trabajador_nombre,fecha_vencimiento")
          .not("fecha_vencimiento", "is", null)
          .lte("fecha_vencimiento", en30.toISOString().split("T")[0])
          .order("fecha_vencimiento", { ascending: true })
          .limit(5),
        supabase
          .from("aci_reportes")
          .select("id,descripcion,area,fecha_reporte")
          .eq("nivel_riesgo", "Alto")
          .neq("estado", "Cerrado")
          .order("fecha_reporte", { ascending: false })
          .limit(5),
        supabase
          .from("permisos_trabajo")
          .select("id,descripcion_tarea,responsable,fecha_inicio")
          .eq("estado", "Pendiente")
          .order("fecha_inicio", { ascending: true })
          .limit(5),
      ]);

      const exMapped: AlertaExamen[] = (exRes.data || []).map((e: any) => {
        const dias = Math.ceil((new Date(e.fecha_vencimiento).getTime() - hoy.getTime()) / 86400000);
        return { id: e.id, trabajador_nombre: e.trabajador_nombre, fecha_vencimiento: e.fecha_vencimiento, dias };
      });
      setExamenes(exMapped);
      setAci(aciRes.data || []);
      setPermisos(permRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const total = examenes.length + aci.length + permisos.length;

  return (
    <div className="rounded-xl bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Panel de Alertas
        </h3>
        {!loading && total > 0 && <Badge variant="destructive">{total}</Badge>}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : total === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Sin alertas activas 🎉</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SeccionAlerta
            titulo="Exámenes por vencer"
            icon={Stethoscope}
            color="text-amber-600"
            link="/examenes-medicos"
            empty="Sin vencimientos próximos"
            items={examenes.map((e) => ({
              key: e.id,
              primary: e.trabajador_nombre,
              secondary: e.dias < 0 ? `Vencido hace ${Math.abs(e.dias)}d` : `En ${e.dias}d`,
              urgent: e.dias <= 7,
            }))}
          />
          <SeccionAlerta
            titulo="ACI Alto sin cerrar"
            icon={ShieldAlert}
            color="text-destructive"
            link="/reporte-aci"
            empty="Sin reportes de riesgo Alto"
            items={aci.map((a) => ({
              key: a.id,
              primary: a.descripcion.length > 40 ? a.descripcion.slice(0, 40) + "…" : a.descripcion,
              secondary: a.area || new Date(a.fecha_reporte).toLocaleDateString(),
              urgent: true,
            }))}
          />
          <SeccionAlerta
            titulo="Permisos pendientes"
            icon={FileWarning}
            color="text-info"
            link="/permisos-trabajo"
            empty="Sin permisos pendientes"
            items={permisos.map((p) => ({
              key: p.id,
              primary: p.descripcion_tarea.length > 40 ? p.descripcion_tarea.slice(0, 40) + "…" : p.descripcion_tarea,
              secondary: p.responsable,
              urgent: false,
            }))}
          />
        </div>
      )}
    </div>
  );
}

interface ItemAlerta { key: string; primary: string; secondary: string; urgent: boolean; }

function SeccionAlerta({ titulo, icon: Icon, color, link, items, empty }: {
  titulo: string; icon: any; color: string; link: string; items: ItemAlerta[]; empty: string;
}) {
  return (
    <div className="rounded-lg border bg-background/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs font-medium">{titulo}</span>
        </div>
        <Badge variant="outline" className="text-[10px] h-5">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((i) => (
            <li key={i.key} className="text-xs">
              <p className="font-medium text-card-foreground truncate">{i.primary}</p>
              <p className={i.urgent ? "text-destructive" : "text-muted-foreground"}>{i.secondary}</p>
            </li>
          ))}
        </ul>
      )}
      <Link to={link} className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline">
        Ver módulo <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}