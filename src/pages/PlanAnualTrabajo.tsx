import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CalendarRange, Search, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PAT {
  id: string;
  anio: number;
  actividad: string;
  objetivo: string | null;
  responsable: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  presupuesto: number | null;
  avance: number;
  estado: string;
  evidencias: string | null;
  observaciones: string | null;
}

const estadoVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Programada": "default",
  "En proceso": "default",
  "Completada": "secondary",
  "Vencida": "destructive",
};

export default function PlanAnualTrabajo() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<PAT[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PAT | null>(null);
  const [form, setForm] = useState<Partial<PAT>>({ anio: new Date().getFullYear(), avance: 0, estado: "Programada", presupuesto: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plan_anual_trabajo").select("*").order("fecha_inicio", { ascending: true, nullsFirst: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ anio: new Date().getFullYear(), avance: 0, estado: "Programada", presupuesto: 0 }); setOpen(true); };
  const openEdit = (p: PAT) => { setEditing(p); setForm(p); setOpen(true); };

  const handleSave = async () => {
    if (!form.actividad) { toast({ title: "La actividad es obligatoria", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("plan_anual_trabajo").update(payload).eq("id", editing.id)
      : await supabase.from("plan_anual_trabajo").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actividad actualizada" : "Actividad creada" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad?")) return;
    const { error } = await supabase.from("plan_anual_trabajo").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminada" }); fetchData(); }
  };

  const filtered = items.filter(i => i.actividad.toLowerCase().includes(search.toLowerCase()) || i.responsable?.toLowerCase().includes(search.toLowerCase()));
  const avancePromedio = items.length ? Math.round(items.reduce((s, i) => s + i.avance, 0) / items.length) : 0;
  const presupuestoTotal = items.reduce((s, i) => s + Number(i.presupuesto || 0), 0);

  return (
    <AppLayout title="Plan Anual de Trabajo (PAT)">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Actividades</p>
            <p className="text-2xl font-bold mt-1">{items.length}</p>
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Avance promedio</p>
            <p className="text-2xl font-bold mt-1">{avancePromedio}%</p>
            <Progress value={avancePromedio} className="h-1.5 mt-2" />
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Presupuesto total</p>
            <p className="text-2xl font-bold mt-1">${presupuestoTotal.toLocaleString("es-CO")}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            Cronograma anual de actividades del SG-SST
          </p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nueva actividad</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar actividad" : "Nueva actividad"}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="sm:col-span-2 space-y-1.5"><Label>Actividad *</Label><Input value={form.actividad || ""} onChange={e => setForm({ ...form, actividad: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Objetivo</Label><Textarea value={form.objetivo || ""} onChange={e => setForm({ ...form, objetivo: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Año</Label><Input type="number" value={form.anio || ""} onChange={e => setForm({ ...form, anio: parseInt(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label>Responsable</Label><Input value={form.responsable || ""} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha inicio</Label><Input type="date" value={form.fecha_inicio || ""} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha fin</Label><Input type="date" value={form.fecha_fin || ""} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Presupuesto (COP)</Label><Input type="number" value={form.presupuesto ?? 0} onChange={e => setForm({ ...form, presupuesto: parseFloat(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label>Avance (%)</Label><Input type="number" min={0} max={100} value={form.avance ?? 0} onChange={e => setForm({ ...form, avance: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} /></div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Programada">Programada</SelectItem>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                        <SelectItem value="Vencida">Vencida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Evidencias</Label><Textarea value={form.evidencias || ""} onChange={e => setForm({ ...form, evidencias: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Observaciones</Label><Textarea value={form.observaciones || ""} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSave}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Actividad</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Responsable</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Periodo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Avance</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin actividades planificadas</td></tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.actividad}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.responsable || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{p.fecha_inicio || "—"} → {p.fecha_fin || "—"}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <Progress value={p.avance} className="h-1.5 flex-1" />
                        <span className="text-xs w-9 text-right">{p.avance}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={estadoVariants[p.estado] || "outline"}>{p.estado}</Badge></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
