import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, Search, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Mejora {
  id: string;
  origen_hallazgo: string;
  descripcion: string;
  tipo_accion: string;
  responsable: string | null;
  fecha_identificacion: string;
  fecha_limite: string | null;
  fecha_cierre: string | null;
  estado: string;
  eficacia: string | null;
  observaciones: string | null;
}

const estadoVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Abierto": "destructive",
  "En proceso": "default",
  "Cerrado": "secondary",
  "Vencido": "destructive",
};

const origenes = ["Auditoría interna", "Auditoría externa", "Inspección", "Accidente", "Investigación", "Reporte ACI", "Otro"];

export default function PlanMejoramiento() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Mejora[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Mejora | null>(null);
  const [form, setForm] = useState<Partial<Mejora>>({ tipo_accion: "Correctiva", estado: "Abierto", origen_hallazgo: "Auditoría interna", fecha_identificacion: new Date().toISOString().slice(0, 10) });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plan_mejoramiento").select("*").order("fecha_identificacion", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ tipo_accion: "Correctiva", estado: "Abierto", origen_hallazgo: "Auditoría interna", fecha_identificacion: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (m: Mejora) => { setEditing(m); setForm(m); setOpen(true); };

  const handleSave = async () => {
    if (!form.descripcion) { toast({ title: "La descripción es obligatoria", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("plan_mejoramiento").update(payload).eq("id", editing.id)
      : await supabase.from("plan_mejoramiento").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actualizado" : "Creado" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este hallazgo?")) return;
    const { error } = await supabase.from("plan_mejoramiento").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  const filtered = items.filter(i => i.descripcion.toLowerCase().includes(search.toLowerCase()) || i.responsable?.toLowerCase().includes(search.toLowerCase()));
  const abiertos = items.filter(i => i.estado === "Abierto" || i.estado === "En proceso").length;
  const cerrados = items.filter(i => i.estado === "Cerrado").length;

  return (
    <AppLayout title="Plan de Mejoramiento">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Total hallazgos</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">En gestión</p><p className="text-2xl font-bold mt-1 text-orange-500">{abiertos}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Cerrados</p><p className="text-2xl font-bold mt-1 text-emerald-500">{cerrados}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />Acciones correctivas, preventivas y de mejora</p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo hallazgo</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} hallazgo</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="space-y-1.5">
                    <Label>Origen *</Label>
                    <Select value={form.origen_hallazgo} onValueChange={v => setForm({ ...form, origen_hallazgo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{origenes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo de acción</Label>
                    <Select value={form.tipo_accion} onValueChange={v => setForm({ ...form, tipo_accion: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Correctiva">Correctiva</SelectItem>
                        <SelectItem value="Preventiva">Preventiva</SelectItem>
                        <SelectItem value="Mejora">Mejora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Descripción *</Label><Textarea value={form.descripcion || ""} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Responsable</Label><Input value={form.responsable || ""} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Abierto">Abierto</SelectItem>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                        <SelectItem value="Vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Fecha identificación</Label><Input type="date" value={form.fecha_identificacion || ""} onChange={e => setForm({ ...form, fecha_identificacion: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha límite</Label><Input type="date" value={form.fecha_limite || ""} onChange={e => setForm({ ...form, fecha_limite: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha cierre</Label><Input type="date" value={form.fecha_cierre || ""} onChange={e => setForm({ ...form, fecha_cierre: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Eficacia</Label><Input placeholder="Eficaz / No eficaz" value={form.eficacia || ""} onChange={e => setForm({ ...form, eficacia: e.target.value })} /></div>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Origen</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Descripción</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Responsable</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Límite</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sin hallazgos registrados</td></tr>
                ) : filtered.map(m => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.origen_hallazgo}</td>
                    <td className="px-4 py-3 max-w-md truncate">{m.descripcion}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{m.tipo_accion}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{m.responsable || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{m.fecha_limite || "—"}</td>
                    <td className="px-4 py-3"><Badge variant={estadoVariants[m.estado] || "outline"}>{m.estado}</Badge></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
