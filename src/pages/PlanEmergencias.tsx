import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Siren, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  tipo: string;
  nombre: string;
  descripcion: string | null;
  responsable: string | null;
  area: string | null;
  fecha: string | null;
  participantes: number | null;
  recursos: string | null;
  observaciones: string | null;
  estado: string;
}

const tipos = ["Brigada", "Simulacro", "Recurso", "Ruta de evacuación", "Procedimiento"];
const estados = ["Programado", "En curso", "Completado", "Cancelado"];

export default function PlanEmergencias() {
  const { hasRole, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Partial<Item>>({ tipo: "Simulacro", estado: "Programado", participantes: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("plan_emergencias").select("*").order("fecha", { ascending: false, nullsFirst: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ tipo: "Simulacro", estado: "Programado", participantes: 0 }); setOpen(true); };
  const openEdit = (i: Item) => { setEditing(i); setForm(i); setOpen(true); };

  const handleSave = async () => {
    if (!form.tipo || !form.nombre) { toast({ title: "Tipo y nombre obligatorios", variant: "destructive" }); return; }
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("plan_emergencias").update(payload).eq("id", editing.id)
      : await supabase.from("plan_emergencias").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actualizado" : "Creado" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const { error } = await supabase.from("plan_emergencias").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  const brigadas = items.filter(i => i.tipo === "Brigada").length;
  const simulacros = items.filter(i => i.tipo === "Simulacro").length;

  return (
    <AppLayout title="Plan de Emergencias">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Total elementos</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Brigadas</p><p className="text-2xl font-bold mt-1">{brigadas}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Simulacros</p><p className="text-2xl font-bold mt-1">{simulacros}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Siren className="h-4 w-4" />Brigadas, simulacros, recursos y rutas de evacuación</p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo elemento</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} elemento del plan</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="space-y-1.5">
                    <Label>Tipo *</Label>
                    <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{estados.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Nombre *</Label><Input value={form.nombre || ""} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Descripción</Label><Textarea rows={2} value={form.descripcion || ""} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Responsable</Label><Input value={form.responsable || ""} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Área</Label><Input value={form.area || ""} onChange={e => setForm({ ...form, area: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha</Label><Input type="date" value={form.fecha || ""} onChange={e => setForm({ ...form, fecha: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Participantes</Label><Input type="number" value={form.participantes ?? 0} onChange={e => setForm({ ...form, participantes: parseInt(e.target.value) || 0 })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Recursos</Label><Textarea rows={2} placeholder="Extintores, camillas, alarmas..." value={form.recursos || ""} onChange={e => setForm({ ...form, recursos: e.target.value })} /></div>
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

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Responsable</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Fecha</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin elementos registrados</td></tr>
                ) : items.map(i => (
                  <tr key={i.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{i.tipo}</Badge></td>
                    <td className="px-4 py-3 font-medium">{i.nombre}</td>
                    <td className="px-4 py-3">{i.responsable || "—"}</td>
                    <td className="px-4 py-3 text-xs">{i.fecha ? new Date(i.fecha).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><Badge variant={i.estado === "Completado" ? "secondary" : i.estado === "Cancelado" ? "destructive" : "default"}>{i.estado}</Badge></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
