import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stethoscope, Upload, Loader2, AlertTriangle, Pencil, Trash2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Examen {
  id: string;
  trabajador_nombre: string;
  trabajador_documento: string | null;
  cargo: string | null;
  area?: string | null;
  tipo_examen: string;
  aptitud: string;
  restricciones: string | null;
  recomendaciones: string | null;
  medico_evaluador: string | null;
  ips: string | null;
  fecha_examen: string;
  fecha_vencimiento: string | null;
  archivo_url: string | null;
}

const TIPOS = ["Ingreso", "Periódico", "Egreso", "Post-incapacidad", "Reintegro"];
const APTITUDES = ["Apto", "Apto con restricciones", "No apto", "Aplazado"];

export default function ExamenesMedicos() {
  const { hasRole, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Examen | null>(null);
  const [form, setForm] = useState<Partial<Examen>>({ tipo_examen: "Periódico", aptitud: "Apto" });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupHit, setLookupHit] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("examenes_medicos").select("*").order("fecha_examen", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchData(); else setLoading(false); }, [isAdmin]);

  const openNew = () => { setEditing(null); setForm({ tipo_examen: "Periódico", aptitud: "Apto", fecha_examen: new Date().toISOString().split("T")[0] }); setArchivo(null); setOpen(true); };
  const openEdit = (e: Examen) => { setEditing(e); setForm(e); setArchivo(null); setOpen(true); };

  const buscarTrabajador = async (documento: string) => {
    const doc = documento.trim();
    if (!doc) { setLookupHit(null); return; }
    setLookupLoading(true);
    const { data } = await supabase
      .from("trabajadores")
      .select("nombre, cargo, area")
      .eq("documento", doc)
      .maybeSingle();
    setLookupLoading(false);
    if (data) {
      setForm((prev) => ({
        ...prev,
        trabajador_documento: doc,
        trabajador_nombre: prev.trabajador_nombre || data.nombre,
        cargo: prev.cargo || data.cargo || "",
        area: (prev as any).area || data.area || "",
      }));
      setLookupHit(`✓ ${data.nombre}`);
    } else {
      setLookupHit("Sin coincidencia en maestro");
    }
  };

  const procesarOCR = async (file: File) => {
    setOcrLoading(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("ocr-examen-medico", {
        body: { imageBase64: base64, mimeType: file.type },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm((prev) => ({ ...prev, ...data.data }));
      toast({ title: "Datos extraídos", description: "Revisa y guarda" });
    } catch (e: any) {
      toast({ title: "Error OCR", description: e.message, variant: "destructive" });
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.trabajador_nombre) { toast({ title: "Nombre del trabajador obligatorio", variant: "destructive" }); return; }
    let archivo_url = form.archivo_url || null;
    if (archivo) {
      const path = `${user?.id}/${Date.now()}-${archivo.name}`;
      const { error: upErr } = await supabase.storage.from("examenes-medicos").upload(path, archivo);
      if (upErr) { toast({ title: "Error subiendo archivo", description: upErr.message, variant: "destructive" }); return; }
      archivo_url = path;
    }
    const payload = { ...form, archivo_url, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("examenes_medicos").update(payload).eq("id", editing.id)
      : await supabase.from("examenes_medicos").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actualizado" : "Creado" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este examen?")) return;
    const { error } = await supabase.from("examenes_medicos").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  if (!isAdmin) return <AppLayout title="Exámenes Médicos"><div className="rounded-xl bg-card shadow-card p-8 text-center text-muted-foreground">Solo administradores pueden ver exámenes médicos (datos sensibles).</div></AppLayout>;

  const conRestriccion = items.filter((i) => i.aptitud !== "Apto").length;
  const vencidos = items.filter((i) => i.fecha_vencimiento && new Date(i.fecha_vencimiento) < new Date()).length;
  const proximoVencer = items.filter((i) => {
    if (!i.fecha_vencimiento) return false;
    const dias = (new Date(i.fecha_vencimiento).getTime() - Date.now()) / 86400000;
    return dias >= 0 && dias <= 30;
  }).length;

  return (
    <AppLayout title="Exámenes Médicos Ocupacionales">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Con restricciones</p><p className="text-2xl font-bold mt-1 text-warning">{conRestriccion}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Próximos a vencer (30d)</p><p className="text-2xl font-bold mt-1 text-amber-600">{proximoVencer}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Vencidos</p><p className="text-2xl font-bold mt-1 text-destructive">{vencidos}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Stethoscope className="h-4 w-4" />Sube el PDF y la IA extraerá los datos automáticamente</p>
          <Button onClick={openNew}><Upload className="h-4 w-4 mr-1.5" />Nuevo examen</Button>
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Trabajador</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Aptitud</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Vence</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                  : items.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin exámenes registrados</td></tr>
                  : items.map((i) => {
                    const venc = i.fecha_vencimiento ? new Date(i.fecha_vencimiento) : null;
                    const dias = venc ? (venc.getTime() - Date.now()) / 86400000 : null;
                    return (
                      <tr key={i.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3"><div className="font-medium">{i.trabajador_nombre}</div><div className="text-xs text-muted-foreground">{i.cargo || "—"}</div></td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{i.tipo_examen}</Badge></td>
                        <td className="px-4 py-3"><Badge variant={i.aptitud === "Apto" ? "secondary" : i.aptitud === "No apto" ? "destructive" : "default"}>{i.aptitud}</Badge>{i.restricciones && <div className="flex items-center gap-1 text-xs text-amber-600 mt-1"><AlertTriangle className="h-3 w-3" />Con restricciones</div>}</td>
                        <td className="px-4 py-3 text-xs">{new Date(i.fecha_examen).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-xs">{venc ? <span className={dias! < 0 ? "text-destructive font-medium" : dias! < 30 ? "text-amber-600 font-medium" : ""}>{venc.toLocaleDateString()}</span> : "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} examen médico</DialogTitle></DialogHeader>
            {!editing && (
              <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                <Label className="flex items-center gap-2 mb-2"><Sparkles className="h-4 w-4 text-primary" />Lectura automática con IA</Label>
                <Input type="file" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setArchivo(f); if (f.type.startsWith("image/")) procesarOCR(f); else toast({ title: "Para OCR sube imagen (JPG/PNG)", description: "El PDF se guardará pero la extracción IA solo aplica a imágenes" }); } }} disabled={ocrLoading} />
                {ocrLoading && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Extrayendo datos del examen...</p>}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="sm:col-span-2 space-y-1.5"><Label>Trabajador *</Label><Input value={form.trabajador_nombre || ""} onChange={(e) => setForm({ ...form, trabajador_nombre: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Documento</Label><Input value={form.trabajador_documento || ""} onChange={(e) => setForm({ ...form, trabajador_documento: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Cargo</Label><Input value={form.cargo || ""} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Tipo</Label>
                <Select value={form.tipo_examen} onValueChange={(v) => setForm({ ...form, tipo_examen: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Aptitud</Label>
                <Select value={form.aptitud} onValueChange={(v) => setForm({ ...form, aptitud: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{APTITUDES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Fecha del examen</Label><Input type="date" value={form.fecha_examen || ""} onChange={(e) => setForm({ ...form, fecha_examen: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Fecha vencimiento</Label><Input type="date" value={form.fecha_vencimiento || ""} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Médico evaluador</Label><Input value={form.medico_evaluador || ""} onChange={(e) => setForm({ ...form, medico_evaluador: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>IPS</Label><Input value={form.ips || ""} onChange={(e) => setForm({ ...form, ips: e.target.value })} /></div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Restricciones</Label><Textarea rows={2} value={form.restricciones || ""} onChange={(e) => setForm({ ...form, restricciones: e.target.value })} /></div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Recomendaciones</Label><Textarea rows={2} value={form.recomendaciones || ""} onChange={(e) => setForm({ ...form, recomendaciones: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
