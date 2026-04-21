import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertasPanel } from "@/components/dashboard/AlertasPanel";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Accidentes este mes"
            value={1}
            icon={AlertTriangle}
            variant="destructive"
            trend={{ value: -50, label: "vs mes anterior" }}
          />
          <StatCard
            title="Inspecciones realizadas"
            value={24}
            icon={ClipboardCheck}
            variant="success"
            subtitle="de 30 programadas"
          />
          <StatCard
            title="Capacitaciones"
            value={8}
            icon={GraduationCap}
            variant="info"
            subtitle="152 asistentes"
          />
          <StatCard
            title="Exámenes por vencer"
            value={5}
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
          </div>

          {/* Compliance pie */}
          <div className="rounded-xl bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Cumplimiento SG-SST</h3>
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
