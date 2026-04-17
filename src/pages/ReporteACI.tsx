import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera, MapPin, AlertTriangle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ACI {
  id: string;
  tipo: string;
  area: string | null;
  ubicacion: string | null;
  descripcion: string;
  nivel_riesgo: string;
  foto_url: string | null;
  estado: string;
  acciones_tomadas: string | null;
  reportado_por: string | null;
  reportado_por_nombre: string | null;
  fecha_reporte: string;
}

const tipos = ["Acto inseguro", "Condición insegura"];
const niveles = ["Bajo", "Medio", "Alto", "Crítico"];
const estados = ["Reportado", "En análisis", "En acción", "Cerrado"];

const nivelVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Bajo: "secondary", Medio: "default", Alto: "destructive", Crítico: "destructive",
};

export default function ReporteACI() {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<ACI[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<ACI | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<Partial<ACI>>({ tipo: "Acto inseguro", nivel_riesgo: "Medio", estado: "Reportado" });
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("aci_reportes").select("*").order("fecha_reporte", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => {
    setForm({ tipo: "Acto inseguro", nivel_riesgo: "Medio", estado: "Reportado" });
    setFile(null);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!user) { toast({ title: "Sesión requerida", variant: "destructive" }); return; }
    if (!form.descripcion?.trim()) { toast({ title: "La descripción es obligatoria", variant: "destructive" }); return; }
    setUploading(true);

    let foto_url: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("aci-evidencias").upload(path, file, { upsert: false });
      if (upErr) { toast({ title: "Error subiendo foto", description: upErr.message, variant: "destructive" }); setUploading(false); return; }
      const { data: pub } = supabase.storage.from("aci-evidencias").getPublicUrl(path);
      foto_url = pub.publicUrl;
    }

    const payload = {
      ...form,
      foto_url,
      reportado_por: user.id,
      reportado_por_nombre: user.user_metadata?.full_name || user.email,
    } as any;

    const { error } = await supabase.from("aci_reportes").insert(payload);
    setUploading(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reporte enviado" }); setOpen(false); fetchData(); }
  };

  const updateEstado = async (id: string, estado: string) => {
    const patch: any = { estado };
    if (estado === "Cerrado") patch.fecha_cierre = new Date().toISOString();
    const { error } = await supabase.from("aci_reportes").update(patch).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Estado actualizado" }); fetchData(); }
  };

  const abiertos = items.filter(i => i.estado !== "Cerrado").length;
  const criticos = items.filter(i => i.nivel_riesgo === "Crítico" || i.nivel_riesgo === "Alto").length;

  return (
    <AppLayout title="Reporte ACI · Actos y Condiciones Inseguras">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Total reportes</p>
            <p className="text-2xl font-bold mt-1">{items.length}</p>
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Abiertos</p>
            <p className="text-2xl font-bold mt-1 text-primary">{abiertos}</p>
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Riesgo Alto / Crítico</p>
            <p className="text-2xl font-bold mt-1 text-destructive">{criticos}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Cualquier trabajador puede reportar actos o condiciones inseguras
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo reporte</Button></DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nuevo reporte ACI</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                <div className="space-y-1.5">
                  <Label>Tipo *</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Nivel de riesgo *</Label>
                  <Select value={form.nivel_riesgo} onValueChange={v => setForm({ ...form, nivel_riesgo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{niveles.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label>Área</Label><Input value={form.area || ""} onChange={e => setForm({ ...form, area: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Ubicación específica</Label><Input placeholder="Bodega 2, estante A" value={form.ubicacion || ""} onChange={e => setForm({ ...form, ubicacion: e.target.value })} /></div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label>Descripción *</Label>
                  <Textarea rows={3} placeholder="Describa el acto o condición insegura observada" value={form.descripcion || ""} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />Fotografía</Label>
                  <Input type="file" accept="image/*" capture="environment" onChange={e => setFile(e.target.files?.[0] || null)} />
                  {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={uploading}>Cancelar</Button>
                <Button onClick={handleSave} disabled={uploading}>{uploading ? "Enviando..." : "Reportar"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            <p className="text-muted-foreground col-span-full text-center py-8">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground col-span-full text-center py-8">No hay reportes aún</p>
          ) : items.map(r => (
            <div key={r.id} className="rounded-xl bg-card shadow-card overflow-hidden flex flex-col">
              {r.foto_url ? (
                <button onClick={() => setViewing(r)} className="aspect-video bg-muted overflow-hidden">
                  <img src={r.foto_url} alt={r.tipo} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </button>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground"><Camera className="h-8 w-8" /></div>
              )}
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs">{r.tipo}</Badge>
                  <Badge variant={nivelVariant[r.nivel_riesgo] || "default"} className="text-xs">{r.nivel_riesgo}</Badge>
                </div>
                <p className="text-sm font-medium line-clamp-2">{r.descripcion}</p>
                {(r.area || r.ubicacion) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{[r.area, r.ubicacion].filter(Boolean).join(" · ")}</p>
                )}
                <div className="flex items-center justify-between pt-2 mt-auto border-t">
                  <span className="text-xs text-muted-foreground">{r.reportado_por_nombre || "—"}</span>
                  {isAdmin ? (
                    <Select value={r.estado} onValueChange={v => updateEstado(r.id, v)}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{estados.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={r.estado === "Cerrado" ? "secondary" : "default"} className="text-xs">{r.estado}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="h-4 w-4" />Reporte ACI</DialogTitle></DialogHeader>
            {viewing && (
              <div className="space-y-3">
                {viewing.foto_url && <img src={viewing.foto_url} alt="" className="w-full max-h-96 object-contain rounded-lg bg-muted" />}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Tipo</p><p>{viewing.tipo}</p></div>
                  <div><p className="text-xs text-muted-foreground">Nivel</p><Badge variant={nivelVariant[viewing.nivel_riesgo]}>{viewing.nivel_riesgo}</Badge></div>
                  <div><p className="text-xs text-muted-foreground">Área</p><p>{viewing.area || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Ubicación</p><p>{viewing.ubicacion || "—"}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground">Descripción</p><p>{viewing.descripcion}</p></div>
                  <div><p className="text-xs text-muted-foreground">Reportado por</p><p>{viewing.reportado_por_nombre || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Fecha</p><p>{new Date(viewing.fecha_reporte).toLocaleString()}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
