import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, AlertTriangle, ShieldAlert, Stethoscope, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type Resumen = {
  total_aci: number;
  aci_alto: number;
  aci_por_area: Record<string, number>;
  aci_por_tipo: Record<string, number>;
  riesgos_altos: number;
  riesgos_por_area: Record<string, number>;
  examenes_no_aptos: number;
  examenes_vencidos: number;
  acciones_abiertas: number;
  trabajadores_activos: number;
  trabajadores_por_area: Record<string, number>;
};

export default function AnaliticaIA() {
  const [loading, setLoading] = useState(false);
  const [analisis, setAnalisis] = useState<string>("");
  const [resumen, setResumen] = useState<Resumen | null>(null);

  const ejecutar = async () => {
    setLoading(true);
    setAnalisis("");
    try {
      const { data, error } = await supabase.functions.invoke("analisis-predictivo-sgsst", {
        body: { contexto: "global" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalisis(data.analisis);
      setResumen(data.resumen);
      toast.success("Análisis generado");
    } catch (e: any) {
      toast.error(e.message ?? "Error al generar análisis");
    } finally {
      setLoading(false);
    }
  };

  const top = (obj?: Record<string, number>) =>
    Object.entries(obj ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AppLayout title="Análisis Predictivo IA">
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3"><Brain className="h-8 w-8 text-primary" /></div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Análisis predictivo de accidentalidad</h2>
              <p className="text-sm text-muted-foreground mt-1">
                La IA analiza tus datos reales (ACI, accidentes, matriz de riesgos, exámenes médicos, plan de mejoramiento) de los últimos 6 meses
                y genera un diagnóstico, predicciones por área y recomendaciones priorizadas según normativa colombiana.
              </p>
              <Button onClick={ejecutar} disabled={loading} className="mt-4">
                <Sparkles className="h-4 w-4 mr-1.5" />
                {loading ? "Analizando…" : "Generar análisis con IA"}
              </Button>
            </div>
          </div>
        </Card>

        {resumen && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Mini icon={AlertTriangle} label="ACI totales" value={resumen.total_aci} sub={`${resumen.aci_alto} de riesgo alto`} />
            <Mini icon={ShieldAlert} label="Riesgos altos" value={resumen.riesgos_altos} sub="en matriz" />
            <Mini icon={Stethoscope} label="Exámenes" value={resumen.examenes_no_aptos + resumen.examenes_vencidos} sub={`${resumen.examenes_vencidos} vencidos`} />
            <Mini icon={Users} label="Trabajadores activos" value={resumen.trabajadores_activos} sub="hoy" />
          </div>
        )}

        {resumen && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 text-sm">Top áreas con más ACI</h3>
              <div className="space-y-2">
                {top(resumen.aci_por_area).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm">
                    <span className="truncate">{k}</span>
                    <Badge variant="outline">{v}</Badge>
                  </div>
                ))}
                {top(resumen.aci_por_area).length === 0 && <p className="text-xs text-muted-foreground">Sin datos.</p>}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3 text-sm">Tipos de ACI más frecuentes</h3>
              <div className="space-y-2">
                {top(resumen.aci_por_tipo).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm">
                    <span className="truncate">{k}</span>
                    <Badge>{v}</Badge>
                  </div>
                ))}
                {top(resumen.aci_por_tipo).length === 0 && <p className="text-xs text-muted-foreground">Sin datos.</p>}
              </div>
            </Card>
          </div>
        )}

        {analisis && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Diagnóstico y recomendaciones IA</h3>
            </div>
            <article className="prose prose-sm max-w-none dark:prose-invert
              prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground
              prose-li:text-foreground prose-h2:mt-4 prose-h3:mt-3">
              <ReactMarkdown>{analisis}</ReactMarkdown>
            </article>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function Mini({ icon: Icon, label, value, sub }: any) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Card>
  );
}
