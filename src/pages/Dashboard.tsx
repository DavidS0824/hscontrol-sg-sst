import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertasPanel } from "@/components/dashboard/AlertasPanel";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";
import {
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Stethoscope,
  Shield,
  TrendingDown,
  Users,
  FileCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const recentActivities = [
  { text: "Inspección completada - Área de producción", time: "Hace 2h", type: "success" as const },
  { text: "Nuevo incidente reportado - Bodega B", time: "Hace 4h", type: "warning" as const },
  { text: "Capacitación programada - Trabajo en alturas", time: "Hace 6h", type: "info" as const },
  { text: "Examen médico vencido - Carlos Pérez", time: "Hace 1d", type: "destructive" as const },
  { text: "Documento actualizado - Matriz de riesgos", time: "Hace 1d", type: "info" as const },
];

const typeColors: Record<string, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const anioActual = new Date().getFullYear();
  const [anioFiltro, setAnioFiltro] = useState<number>(anioActual);
  const [sedeFiltro, setSedeFiltro] = useState<string>("__all__");
  const [sedesDisponibles, setSedesDisponibles] = useState<string[]>([]);
  const [accidentData, setAccidentData] = useState<{ mes: string; accidentes: number; incidentes: number }[]>([]);
  const [complianceData, setComplianceData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [riskData, setRiskData] = useState<{ mes: string; alto: number; medio: number; bajo: number }[]>([]);
  const [stats, setStats] = useState({
    accidentesMes: 0,
    accidentesPrev: 0,
    inspeccionesMes: 0,
    inspeccionesProgramadas: 0,
    capacitacionesMes: 0,
    capacitacionesAsistentes: 0,
    examenesPorVencer: 0,
  });

  // Cargar sedes disponibles (combina trabajadores.sede + áreas usadas en ACI)
  useEffect(() => {
    const loadSedes = async () => {
      const [trabRes, aciRes] = await Promise.all([
        supabase.from("trabajadores").select("sede").not("sede", "is", null),
        supabase.from("aci_reportes").select("area").not("area", "is", null),
      ]);
      const set = new Set<string>();
      (trabRes.data ?? []).forEach((r: any) => r.sede && set.add(r.sede));
      (aciRes.data ?? []).forEach((r: any) => r.area && set.add(r.area));
      setSedesDisponibles(Array.from(set).sort());
    };
    loadSedes();
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const hoy = new Date();
      const anio = anioFiltro;
      const esAnioActual = anio === hoy.getFullYear();
      const mes = esAnioActual ? hoy.getMonth() : 11; // si es año pasado, terminamos en diciembre
      const inicioAnio = new Date(anio, 0, 1).toISOString();
      const finAnio = new Date(anio + 1, 0, 1).toISOString();
      const inicioMes = new Date(anio, mes, 1).toISOString();
      const finMes = new Date(anio, mes + 1, 1).toISOString();
      const inicioMesPrev = new Date(anio, mes - 1, 1).toISOString();
      const en30 = new Date(); en30.setDate(hoy.getDate() + 30);
      const sede = sedeFiltro === "__all__" ? null : sedeFiltro;

      const aplicarSede = (q: any, col = "area") => sede ? q.eq(col, sede) : q;

      const [aciRes, riesgosRes, patRes, capacRes, asistRes, exMesRes, inspMesRes, inspProgRes, accMesPrevRes, exVencRes] = await Promise.all([
        aplicarSede(supabase.from("aci_reportes").select("tipo, fecha_reporte").gte("fecha_reporte", inicioAnio).lt("fecha_reporte", finAnio)),
        aplicarSede(supabase.from("matriz_riesgos").select("nivel_riesgo, created_at").gte("created_at", inicioAnio).lt("created_at", finAnio)),
        supabase.from("plan_anual_trabajo").select("estado, avance").eq("anio", anio),
        supabase.from("capacitaciones").select("id, fecha").gte("fecha", inicioMes.split("T")[0]).lt("fecha", finMes.split("T")[0]),
        supabase.from("asistencia").select("id, capacitacion_id, fecha_registro").gte("fecha_registro", inicioMes).lt("fecha_registro", finMes),
        aplicarSede(supabase.from("aci_reportes").select("id").eq("tipo", "Accidente").gte("fecha_reporte", inicioMes).lt("fecha_reporte", finMes)),
        aplicarSede(supabase.from("checklist_ejecuciones").select("id").gte("fecha_ejecucion", inicioMes).lt("fecha_ejecucion", finMes)),
        supabase.from("plan_anual_trabajo").select("id").eq("anio", anio),
        aplicarSede(supabase.from("aci_reportes").select("id").eq("tipo", "Accidente").gte("fecha_reporte", inicioMesPrev).lt("fecha_reporte", inicioMes)),
        aplicarSede(supabase.from("examenes_medicos").select("id").not("fecha_vencimiento", "is", null).lte("fecha_vencimiento", en30.toISOString().split("T")[0]).gte("fecha_vencimiento", hoy.toISOString().split("T")[0])),
      ]);

      // Accidentes/incidentes por mes (últimos 6 meses)
      const acc = aciRes.data ?? [];
      const meses6: { mes: string; accidentes: number; incidentes: number; key: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anio, mes - i, 1);
        meses6.push({ mes: MESES[d.getMonth()], accidentes: 0, incidentes: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
      }
      acc.forEach((r: any) => {
        const d = new Date(r.fecha_reporte);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const slot = meses6.find(m => m.key === key);
        if (!slot) return;
        if (r.tipo === "Accidente") slot.accidentes++;
        else slot.incidentes++;
      });
      setAccidentData(meses6.map(({ key, ...rest }) => rest));

      // Riesgos por mes
      const riesgos = riesgosRes.data ?? [];
      const riesgos6: { mes: string; alto: number; medio: number; bajo: number; key: string }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(anio, mes - i, 1);
        riesgos6.push({ mes: MESES[d.getMonth()], alto: 0, medio: 0, bajo: 0, key: `${d.getFullYear()}-${d.getMonth()}` });
      }
      riesgos.forEach((r: any) => {
        const d = new Date(r.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const slot = riesgos6.find(m => m.key === key);
        if (!slot) return;
        const nv = (r.nivel_riesgo || "").toLowerCase();
        if (nv === "alto") slot.alto++;
        else if (nv === "medio") slot.medio++;
        else slot.bajo++;
      });
      setRiskData(riesgos6.map(({ key, ...rest }) => rest));

      // Cumplimiento SG-SST (basado en plan anual)
      const pat = patRes.data ?? [];
      const total = pat.length || 1;
      let cumplido = 0, progreso = 0, pendiente = 0;
      pat.forEach((p: any) => {
        const av = p.avance ?? 0;
        if (av >= 100 || p.estado === "Cumplida" || p.estado === "Cerrada") cumplido++;
        else if (av > 0 || p.estado === "En progreso") progreso++;
        else pendiente++;
      });
      setComplianceData([
        { name: "Cumplido", value: Math.round((cumplido / total) * 100), color: "hsl(152, 60%, 40%)" },
        { name: "En progreso", value: Math.round((progreso / total) * 100), color: "hsl(36, 90%, 55%)" },
        { name: "Pendiente", value: Math.round((pendiente / total) * 100), color: "hsl(0, 72%, 51%)" },
      ]);

      const accMes = exMesRes.data?.length ?? 0;
      const accPrev = accMesPrevRes.data?.length ?? 0;
      setStats({
        accidentesMes: accMes,
        accidentesPrev: accPrev,
        inspeccionesMes: inspMesRes.data?.length ?? 0,
        inspeccionesProgramadas: inspProgRes.data?.length ?? 0,
        capacitacionesMes: capacRes.data?.length ?? 0,
        capacitacionesAsistentes: asistRes.data?.length ?? 0,
        examenesPorVencer: exVencRes.data?.length ?? 0,
      });
      setLoading(false);
    };
    load();
  }, [anioFiltro, sedeFiltro]);

  const trendAcc = stats.accidentesPrev > 0
    ? Math.round(((stats.accidentesMes - stats.accidentesPrev) / stats.accidentesPrev) * 100)
    : 0;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros:</span>
          </div>
          <Select value={String(anioFiltro)} onValueChange={(v) => setAnioFiltro(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }).map((_, i) => {
                const a = anioActual - i;
                return <SelectItem key={a} value={String(a)}>{a}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Select value={sedeFiltro} onValueChange={setSedeFiltro}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sede / Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas las sedes</SelectItem>
              {sedesDisponibles.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {sedeFiltro !== "__all__" && (
            <span className="text-xs text-muted-foreground ml-auto">
              * Capacitaciones y Plan Anual no se filtran por sede
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Accidentes este mes"
            value={stats.accidentesMes}
            icon={AlertTriangle}
            variant="destructive"
            trend={{ value: trendAcc, label: "vs mes anterior" }}
          />
          <StatCard
            title="Inspecciones realizadas"
            value={stats.inspeccionesMes}
            icon={ClipboardCheck}
            variant="success"
            subtitle={`de ${stats.inspeccionesProgramadas} programadas`}
          />
          <StatCard
            title="Capacitaciones"
            value={stats.capacitacionesMes}
            icon={GraduationCap}
            variant="info"
            subtitle={`${stats.capacitacionesAsistentes} asistentes`}
          />
          <StatCard
            title="Exámenes por vencer"
            value={stats.examenesPorVencer}
            icon={Stethoscope}
            variant="warning"
            subtitle="próximos 30 días"
          />
        </div>

        {/* Panel de Alertas */}
        <AlertasPanel />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Accident chart */}
          <div className="lg:col-span-2 rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Accidentalidad e Incidentes</h3>
            {loading ? <Skeleton className="h-[260px] w-full" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={accidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(210,10%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(210,10%,50%)" />
                <Tooltip />
                <Bar dataKey="accidentes" name="Accidentes" fill="hsl(0,72%,51%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incidentes" name="Incidentes" fill="hsl(36,90%,55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Compliance pie */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Cumplimiento SG-SST</h3>
            {loading ? <Skeleton className="h-[200px] w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={complianceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {complianceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            )}
            <div className="flex justify-center gap-4 mt-2">
              {complianceData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name} ({d.value}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Tendencia de Riesgos</h3>
            {loading ? <Skeleton className="h-[240px] w-full" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210,15%,90%)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(210,10%,50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(210,10%,50%)" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alto" name="Alto" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medio" name="Medio" stroke="hsl(36,90%,55%)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="bajo" name="Bajo" stroke="hsl(152,60%,40%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${typeColors[a.type]}`} />
                  <div className="min-w-0">
                    <p className="text-sm text-card-foreground leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
