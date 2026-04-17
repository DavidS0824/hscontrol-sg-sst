import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ListChecks, Play, Trash2, Pencil, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Plantilla { id: string; nombre: string; categoria: string; descripcion: string | null; activa: boolean; }
interface Item { id: string; plantilla_id: string; orden: number; pregunta: string; obligatorio: boolean; }
interface Ejecucion { id: string; plantilla_id: string; ejecutado_por_nombre: string | null; area: string | null; ubicacion: string | null; fecha_ejecucion: string; porcentaje_cumplimiento: number; observaciones: string | null; estado: string; }

const categorias = ["General", "Vehículos", "Maquinaria", "Herramientas", "EPP", "Áreas de trabajo"];

export default function Checklists() {
  const { hasRole, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");

  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [ejecuciones, setEjecuciones] = useState<Ejecucion[]>([]);
  const [loading, setLoading] = useState(true);

  // Plantilla dialog
  const [openP, setOpenP] = useState(false);
  const [editingP, setEditingP] = useState<Plantilla | null>(null);
  const [formP, setFormP] = useState<Partial<Plantilla>>({ categoria: "General", activa: true });
  const [items, setItems] = useState<Partial<Item>[]>([{ pregunta: "", obligatorio: true }]);

  // Ejecutar dialog
  const [openE, setOpenE] = useState(false);
  const [runPlantilla, setRunPlantilla] = useState<Plantilla | null>(null);
  const [runItems, setRunItems] = useState<Item[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, { respuesta: string; observacion: string }>>({});
  const [formE, setFormE] = useState<{ area: string; ubicacion: string; observaciones: string }>({ area: "", ubicacion: "", observaciones: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: pl }, { data: ej }] = await Promise.all([
      supabase.from("checklist_plantillas").select("*").order("nombre"),
      supabase.from("checklist_ejecuciones").select("*").order("fecha_ejecucion", { ascending: false }).limit(50),
    ]);
    setPlantillas(pl || []);
    setEjecuciones(ej || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNewPlantilla = () => { setEditingP(null); setFormP({ categoria: "General", activa: true }); setItems([{ pregunta: "", obligatorio: true }]); setOpenP(true); };

  const openEditPlantilla = async (p: Plantilla) => {
    setEditingP(p); setFormP(p);
    const { data } = await supabase.from("checklist_items").select("*").eq("plantilla_id", p.id).order("orden");
    setItems(data && data.length ? data : [{ pregunta: "", obligatorio: true }]);
    setOpenP(true);
  };

  const savePlantilla = async () => {
    if (!formP.nombre?.trim()) { toast({ title: "Nombre requerido", variant: "destructive" }); return; }
    const validItems = items.filter(i => i.pregunta?.trim());
    if (!validItems.length) { toast({ title: "Agrega al menos un ítem", variant: "destructive" }); return; }

    const payload = { ...formP, created_by: user?.id } as any;
    const { data: pData, error } = editingP
      ? await supabase.from("checklist_plantillas").update(payload).eq("id", editingP.id).select().single()
      : await supabase.from("checklist_plantillas").insert(payload).select().single();
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    if (editingP) await supabase.from("checklist_items").delete().eq("plantilla_id", editingP.id);
    const itemsPayload = validItems.map((i, idx) => ({ plantilla_id: pData.id, orden: idx, pregunta: i.pregunta!, obligatorio: i.obligatorio ?? true }));
    const { error: iErr } = await supabase.from("checklist_items").insert(itemsPayload);
    if (iErr) { toast({ title: "Error guardando ítems", description: iErr.message, variant: "destructive" }); return; }
    toast({ title: editingP ? "Plantilla actualizada" : "Plantilla creada" });
    setOpenP(false); fetchData();
  };

  const deletePlantilla = async (id: string) => {
    if (!confirm("¿Eliminar la plantilla? Las ejecuciones existentes se conservarán bloqueadas.")) return;
    const { error } = await supabase.from("checklist_plantillas").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminada" }); fetchData(); }
  };

  const startRun = async (p: Plantilla) => {
    const { data } = await supabase.from("checklist_items").select("*").eq("plantilla_id", p.id).order("orden");
    if (!data?.length) { toast({ title: "Esta plantilla no tiene ítems", variant: "destructive" }); return; }
    setRunPlantilla(p); setRunItems(data);
    const init: Record<string, { respuesta: string; observacion: string }> = {};
    data.forEach(i => init[i.id] = { respuesta: "cumple", observacion: "" });
    setRespuestas(init);
    setFormE({ area: "", ubicacion: "", observaciones: "" });
    setOpenE(true);
  };

  const submitRun = async () => {
    if (!user || !runPlantilla) return;
    setSaving(true);
    const total = runItems.length;
    const cumple = Object.values(respuestas).filter(r => r.respuesta === "cumple").length;
    const noAplica = Object.values(respuestas).filter(r => r.respuesta === "na").length;
    const denom = total - noAplica;
    const porcentaje = denom > 0 ? Math.round((cumple / denom) * 100) : 100;

    const { data: ejec, error } = await supabase.from("checklist_ejecuciones").insert({
      plantilla_id: runPlantilla.id,
      ejecutado_por: user.id,
      ejecutado_por_nombre: user.user_metadata?.full_name || user.email,
      area: formE.area || null,
      ubicacion: formE.ubicacion || null,
      observaciones: formE.observaciones || null,
      porcentaje_cumplimiento: porcentaje,
      estado: "Completado",
    }).select().single();
    if (error || !ejec) { setSaving(false); toast({ title: "Error", description: error?.message, variant: "destructive" }); return; }

    const respPayload = runItems.map(i => ({
      ejecucion_id: ejec.id,
      item_id: i.id,
      respuesta: respuestas[i.id]?.respuesta || "cumple",
      observacion: respuestas[i.id]?.observacion || null,
    }));
    const { error: rErr } = await supabase.from("checklist_respuestas").insert(respPayload);
    setSaving(false);
    if (rErr) toast({ title: "Error guardando respuestas", description: rErr.message, variant: "destructive" });
    else { toast({ title: `Ejecución guardada · ${porcentaje}%` }); setOpenE(false); fetchData(); }
  };

  const updateItem = (idx: number, key: keyof Item, value: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: value } : it));
  };

  return (
    <AppLayout title="Checklist Digitales">
      <Tabs defaultValue="plantillas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plantillas">Plantillas ({plantillas.length})</TabsTrigger>
          <TabsTrigger value="ejecuciones">Ejecuciones ({ejecuciones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="plantillas" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground flex items-center gap-2"><ListChecks className="h-4 w-4" />Plantillas reutilizables de inspección</p>
            {isAdmin && <Button onClick={openNewPlantilla}><Plus className="h-4 w-4 mr-1.5" />Nueva plantilla</Button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {loading ? (
              <p className="text-muted-foreground col-span-full text-center py-8">Cargando...</p>
            ) : plantillas.length === 0 ? (
              <p className="text-muted-foreground col-span-full text-center py-8">No hay plantillas. {isAdmin && "Crea la primera."}</p>
            ) : plantillas.map(p => (
              <div key={p.id} className="rounded-xl bg-card shadow-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{p.categoria}</Badge>
                  </div>
                  {!p.activa && <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
                </div>
                {p.descripcion && <p className="text-xs text-muted-foreground line-clamp-2">{p.descripcion}</p>}
                <div className="flex items-center gap-1 pt-2 border-t">
                  <Button size="sm" variant="default" className="flex-1" onClick={() => startRun(p)}><Play className="h-3.5 w-3.5 mr-1" />Ejecutar</Button>
                  {isAdmin && (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => openEditPlantilla(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => deletePlantilla(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ejecuciones" className="space-y-4">
          <div className="rounded-xl bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Plantilla</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Ejecutor</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Área</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-right">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {ejecuciones.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sin ejecuciones todavía</td></tr>
                  ) : ejecuciones.map(e => {
                    const plant = plantillas.find(p => p.id === e.plantilla_id);
                    return (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">{plant?.nombre || "—"}</td>
                        <td className="px-4 py-3">{e.ejecutado_por_nombre || "—"}</td>
                        <td className="px-4 py-3">{e.area || "—"}</td>
                        <td className="px-4 py-3 text-xs">{new Date(e.fecha_ejecucion).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={e.porcentaje_cumplimiento >= 80 ? "secondary" : e.porcentaje_cumplimiento >= 50 ? "default" : "destructive"}>{e.porcentaje_cumplimiento}%</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Crear/editar plantilla */}
      <Dialog open={openP} onOpenChange={setOpenP}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingP ? "Editar" : "Nueva"} plantilla</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Nombre *</Label><Input value={formP.nombre || ""} onChange={e => setFormP({ ...formP, nombre: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>Categoría</Label>
                <Select value={formP.categoria} onValueChange={v => setFormP({ ...formP, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5"><Label>Descripción</Label><Textarea rows={2} value={formP.descripcion || ""} onChange={e => setFormP({ ...formP, descripcion: e.target.value })} /></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ítems del checklist</Label>
                <Button size="sm" variant="outline" onClick={() => setItems([...items, { pregunta: "", obligatorio: true }])}><Plus className="h-3.5 w-3.5 mr-1" />Añadir</Button>
              </div>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                    <Input placeholder="Pregunta del ítem" value={it.pregunta || ""} onChange={e => updateItem(i, "pregunta", e.target.value)} />
                    <Button size="icon" variant="ghost" onClick={() => setItems(items.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenP(false)}>Cancelar</Button>
            <Button onClick={savePlantilla}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Ejecutar plantilla */}
      <Dialog open={openE} onOpenChange={setOpenE}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ejecutar: {runPlantilla?.nombre}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Área</Label><Input value={formE.area} onChange={e => setFormE({ ...formE, area: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Ubicación</Label><Input value={formE.ubicacion} onChange={e => setFormE({ ...formE, ubicacion: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              {runItems.map((it, i) => (
                <div key={it.id} className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-medium">{i + 1}. {it.pregunta}</p>
                  <div className="flex flex-wrap gap-2">
                    {[{ v: "cumple", l: "Cumple" }, { v: "no_cumple", l: "No cumple" }, { v: "na", l: "N/A" }].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => setRespuestas({ ...respuestas, [it.id]: { ...respuestas[it.id], respuesta: opt.v } })}
                        className={`px-3 py-1 rounded-md text-xs border transition-colors ${respuestas[it.id]?.respuesta === opt.v ? (opt.v === "cumple" ? "bg-primary text-primary-foreground border-primary" : opt.v === "no_cumple" ? "bg-destructive text-destructive-foreground border-destructive" : "bg-muted border-muted-foreground/20") : "bg-background hover:bg-muted"}`}
                      >{opt.l}</button>
                    ))}
                  </div>
                  {respuestas[it.id]?.respuesta === "no_cumple" && (
                    <Input placeholder="Observación" value={respuestas[it.id]?.observacion || ""} onChange={e => setRespuestas({ ...respuestas, [it.id]: { ...respuestas[it.id], observacion: e.target.value } })} />
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-1.5"><Label>Observaciones generales</Label><Textarea value={formE.observaciones} onChange={e => setFormE({ ...formE, observaciones: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenE(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={submitRun} disabled={saving}>{saving ? "Guardando..." : "Finalizar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
