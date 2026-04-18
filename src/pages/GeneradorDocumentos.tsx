import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Loader2, Download, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TIPOS = [
  { value: "politica", label: "Política de SG-SST", desc: "Política firmada por gerencia (Decreto 1072 art. 2.2.4.6.5)" },
  { value: "reglamento", label: "Reglamento de Higiene y Seguridad", desc: "Conforme a Resolución 2400/1979" },
  { value: "acta_copasst", label: "Acta de COPASST / Vigía SST", desc: "Conformación del comité (Res. 2013/1986)" },
  { value: "procedimiento", label: "Procedimiento Operativo", desc: "Plantilla parametrizable para cualquier procedimiento" },
];

export default function GeneradorDocumentos() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [tipo, setTipo] = useState("politica");
  const [empresa, setEmpresa] = useState("");
  const [nit, setNit] = useState("");
  const [arl, setArl] = useState("");
  const [actividad, setActividad] = useState("");
  const [trabajadores, setTrabajadores] = useState("");
  const [representante, setRepresentante] = useState("");
  const [contexto, setContexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isAdmin) return <AppLayout title="Generador de Documentos IA"><div className="rounded-xl bg-card shadow-card p-8 text-center text-muted-foreground">Solo administradores pueden generar documentos.</div></AppLayout>;

  const generar = async () => {
    if (!empresa.trim()) { toast({ title: "Completa el nombre de la empresa", variant: "destructive" }); return; }
    setLoading(true);
    setHtml("");
    try {
      const { data, error } = await supabase.functions.invoke("generar-documento-sgsst", {
        body: { tipo, datos: { empresa, nit, arl, actividad_economica: actividad, numero_trabajadores: trabajadores, representante_legal: representante, contexto_adicional: contexto, fecha: new Date().toLocaleDateString("es-CO") } },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setHtml(data.html);
      toast({ title: "Documento generado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = () => {
    if (!previewRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const titulo = TIPOS.find((t) => t.value === tipo)?.label || "Documento SG-SST";
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${titulo} - ${empresa}</title>
      <style>
        @page { size: A4; margin: 2.5cm 2cm; }
        body { font-family: Inter, system-ui, sans-serif; color: #111; line-height: 1.55; font-size: 11pt; }
        h1 { font-size: 18pt; text-align: center; margin: 0 0 16px; }
        h2 { font-size: 13pt; margin: 18px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        h3 { font-size: 11pt; margin: 12px 0 6px; }
        p { margin: 6px 0; text-align: justify; }
        ul, ol { margin: 6px 0 6px 20px; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style></head><body>${previewRef.current.innerHTML}<script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
  };

  return (
    <AppLayout title="Generador de Documentos IA">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl bg-card shadow-card p-5 space-y-4">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-semibold">Datos del documento</h2></div>
          <div className="space-y-1.5"><Label>Tipo de documento</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}><div><div className="font-medium">{t.label}</div><div className="text-xs text-muted-foreground">{t.desc}</div></div></SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Empresa *</Label><Input value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Razón social" /></div>
            <div className="space-y-1.5"><Label>NIT</Label><Input value={nit} onChange={(e) => setNit(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>ARL</Label><Input value={arl} onChange={(e) => setArl(e.target.value)} placeholder="Sura, Positiva..." /></div>
            <div className="space-y-1.5"><Label>N° trabajadores</Label><Input value={trabajadores} onChange={(e) => setTrabajadores(e.target.value)} type="number" /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Actividad económica</Label><Input value={actividad} onChange={(e) => setActividad(e.target.value)} placeholder="Ej. Construcción, comercio..." /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Representante legal</Label><Input value={representante} onChange={(e) => setRepresentante(e.target.value)} /></div>
            <div className="sm:col-span-2 space-y-1.5"><Label>Contexto adicional</Label><Textarea value={contexto} onChange={(e) => setContexto(e.target.value)} rows={3} placeholder={tipo === "procedimiento" ? "Para qué tarea es el procedimiento (ej. trabajo en alturas, manejo de cargas...)" : "Información adicional opcional"} /></div>
          </div>
          <Button onClick={generar} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generando...</> : <><Sparkles className="h-4 w-4 mr-2" />Generar con IA</>}
          </Button>
        </div>

        <div className="rounded-xl bg-card shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><h2 className="font-semibold">Vista previa</h2></div>
            {html && <Button size="sm" variant="outline" onClick={descargarPDF}><Download className="h-4 w-4 mr-1.5" />Descargar PDF</Button>}
          </div>
          <div className="border rounded-lg p-5 bg-background min-h-[400px] max-h-[70vh] overflow-y-auto">
            {loading && <div className="flex items-center justify-center h-40 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Redactando documento...</div>}
            {!loading && !html && <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">El documento generado aparecerá aquí</div>}
            {html && <div ref={previewRef} className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
