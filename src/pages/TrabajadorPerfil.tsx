import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Stethoscope, GraduationCap, AlertTriangle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TrabajadorPerfil() {
  const { id } = useParams();
  const [trabajador, setTrabajador] = useState<any>(null);
  const [examenes, setExamenes] = useState<any[]>([]);
  const [aci, setAci] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: t, error } = await supabase.from("trabajadores").select("*").eq("id", id).maybeSingle();
      if (error || !t) {
        toast.error("Trabajador no encontrado");
        setLoading(false);
        return;
      }
      setTrabajador(t);
      const [{ data: ex }, { data: a }] = await Promise.all([
        supabase.from("examenes_medicos").select("*").eq("trabajador_documento", t.documento).order("fecha_examen", { ascending: false }),
        supabase.from("aci_reportes").select("*").ilike("descripcion", `%${t.nombre}%`).order("fecha_reporte", { ascending: false }).limit(20),
      ]);
      setExamenes(ex ?? []);
      setAci(a ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <AppLayout title="Perfil 360°"><p className="text-muted-foreground">Cargando…</p></AppLayout>;
  if (!trabajador) return <AppLayout title="Perfil 360°"><p>No encontrado.</p></AppLayout>;

  const noAptos = examenes.filter((e) => e.aptitud !== "Apto").length;
  const vencidos = examenes.filter((e) => e.fecha_vencimiento && new Date(e.fecha_vencimiento) < new Date()).length;

  return (
    <AppLayout title="Perfil 360° del Trabajador">
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm"><Link to="/trabajadores"><ArrowLeft className="h-4 w-4 mr-1.5" />Volver</Link></Button>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3"><User className="h-8 w-8 text-primary" /></div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{trabajador.nombre}</h2>
              <p className="text-sm text-muted-foreground">{trabajador.tipo_documento} {trabajador.documento}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{trabajador.cargo ?? "Sin cargo"}</Badge>
                <Badge variant="outline">{trabajador.area ?? "Sin área"}</Badge>
                <Badge variant="outline">Clase {trabajador.nivel_riesgo_cargo ?? "I"}</Badge>
                <Badge variant={trabajador.estado === "Activo" ? "secondary" : "destructive"}>{trabajador.estado}</Badge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
            <Info label="EPS" value={trabajador.eps} />
            <Info label="ARL" value={trabajador.arl} />
            <Info label="AFP" value={trabajador.afp} />
            <Info label="Ingreso" value={trabajador.fecha_ingreso} />
            <Info label="Teléfono" value={trabajador.telefono} />
            <Info label="Correo" value={trabajador.correo} />
            <Info label="Contacto emergencia" value={trabajador.contacto_emergencia_nombre} />
            <Info label="Tel. emergencia" value={trabajador.contacto_emergencia_telefono} />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat icon={Stethoscope} label="Exámenes" value={examenes.length} sub={`${noAptos} no aptos · ${vencidos} vencidos`} />
          <Stat icon={AlertTriangle} label="ACI relacionados" value={aci.length} sub="por nombre" />
          <Stat icon={ShieldAlert} label="Riesgo cargo" value={`Clase ${trabajador.nivel_riesgo_cargo ?? "I"}`} sub="ARL" />
        </div>

        <Section icon={Stethoscope} title="Historial de exámenes médicos">
          {examenes.length === 0 ? <p className="text-sm text-muted-foreground">Sin exámenes registrados.</p> :
            <div className="space-y-2">
              {examenes.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-3 rounded-md border">
                  <div>
                    <p className="font-medium">{e.tipo_examen} · {e.fecha_examen}</p>
                    <p className="text-xs text-muted-foreground">{e.medico_evaluador ?? e.ips ?? "—"}</p>
                    {e.restricciones && <p className="text-xs text-destructive mt-1">⚠ {e.restricciones}</p>}
                  </div>
                  <Badge variant={e.aptitud === "Apto" ? "secondary" : "destructive"}>{e.aptitud}</Badge>
                </div>
              ))}
            </div>}
        </Section>

        <Section icon={AlertTriangle} title="Reportes ACI relacionados">
          {aci.length === 0 ? <p className="text-sm text-muted-foreground">Sin reportes asociados.</p> :
            <div className="space-y-2">
              {aci.map((a) => (
                <div key={a.id} className="flex justify-between items-start p-3 rounded-md border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.tipo} · {a.area ?? "—"}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.descripcion}</p>
                  </div>
                  <Badge variant={a.nivel_riesgo === "Alto" ? "destructive" : "outline"}>{a.nivel_riesgo}</Badge>
                </div>
              ))}
            </div>}
        </Section>

        <Section icon={GraduationCap} title="Capacitaciones">
          <p className="text-sm text-muted-foreground">Vincula al trabajador con su user_id para mostrar asistencia y certificados.</p>
        </Section>
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value || "—"}</p></div>;
}
function Stat({ icon: Icon, label, value, sub }: any) {
  return <Card className="p-4 flex items-center gap-3"><div className="rounded-md bg-primary/10 p-2"><Icon className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{sub}</p></div></Card>;
}
function Section({ icon: Icon, title, children }: any) {
  return <Card className="p-5"><div className="flex items-center gap-2 mb-3"><Icon className="h-4 w-4 text-primary" /><h3 className="font-semibold">{title}</h3></div>{children}</Card>;
}
