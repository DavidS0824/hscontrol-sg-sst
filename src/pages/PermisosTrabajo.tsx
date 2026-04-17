import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, HardHat, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Permiso {
  id: string;
  tipo: string;
  descripcion_tarea: string;
  area: string | null;
  responsable: string;
  ejecutores: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  controles_requeridos: string | null;
  epp_requerido: string | null;
  riesgos_identificados: string | null;
  aprobado_por: string | null;
  fecha_aprobacion: string | null;
  estado: string;
  observaciones: string | null;
}

const tipos = ["Trabajo en alturas", "Espacios confinados", "Trabajo en caliente", "Trabajo eléctrico"];
const estados = ["Pendiente", "Aprobado", "En ejecución", "Cerrado", "Rechazado"];

const estadoVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Pendiente: "outline", Aprobado: "default", "En ejecución": "default", Cerrado: "secondary", Rechazado: "destructive",
};

export default function PermisosTrabajo() {
  const { hasRole, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Permiso | null>(null);
  const [form, setForm] = useState<Partial<Permiso>>({ tipo: "Trabajo en alturas", estado: "Pendiente" });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("permisos_trabajo").select("*").order("fecha_inicio", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ tipo: "Trabajo en alturas", estado: "Pendiente" }); setOpen(true); };
  const openEdit = (p: Permiso) => { setEditing(p); setForm(p); setOpen(true); };

  const handleSave = async () => {
    if (!form.descripcion_tarea || !form.responsable || !form.fecha_inicio) {
      toast({ title: "Tarea, responsable y fecha de inicio son obligatorios", variant: "destructive" }); return;
    }
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("permisos_trabajo").update(payload).eq("id", editing.id)
      : await supabase.from("permisos_trabajo").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actualizado" : "Creado" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este permiso?")) return;
    const { error } = await supabase.from("permisos_trabajo").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  const aprobar = async (p: Permiso) => {
    const { error } = await supabase.from("permisos_trabajo").update({
      estado: "Aprobado", aprobado_por: user?.user_metadata?.full_name || user?.email, fecha_aprobacion: new Date().toISOString(),
    }).eq("id", p.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Permiso aprobado" }); fetchData(); }
  };

  const pendientes = items.filter(i => i.estado === "Pendiente").length;
  const activos = items.filter(i => i.estado === "Aprobado" || i.estado === "En ejecución").length;

  return (
    <AppLayout title="Permisos de Trabajo de Alto Riesgo">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Total permisos</p><p className="text-2xl font-bold mt-1">{items.length}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Pendientes</p><p className="text-2xl font-bold mt-1 text-primary">{pendientes}</p></div>
          <div className="rounded-xl bg-card shadow-card p-4"><p className="text-xs text-muted-foreground">Activos</p><p className="text-2xl font-bold mt-1">{activos}</p></div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><HardHat className="h-4 w-4" />Alturas, espacios confinados, trabajo en caliente y eléctrico</p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo permiso</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} permiso de trabajo</DialogTitle></DialogHeader>
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
                  <div className="sm:col-span-2 space-y-1.5"><Label>Descripción de la tarea *</Label><Textarea value={form.descripcion_tarea || ""} onChange={e => setForm({ ...form, descripcion_tarea: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Área</Label><Input value={form.area || ""} onChange={e => setForm({ ...form, area: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Responsable *</Label><Input value={form.responsable || ""} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Ejecutores</Label><Input placeholder="Nombres separados por coma" value={form.ejecutores || ""} onChange={e => setForm({ ...form, ejecutores: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha inicio *</Label><Input type="datetime-local" value={form.fecha_inicio?.slice(0, 16) || ""} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha fin</Label><Input type="datetime-local" value={form.fecha_fin?.slice(0, 16) || ""} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Riesgos identificados</Label><Textarea rows={2} value={form.riesgos_identificados || ""} onChange={e => setForm({ ...form, riesgos_identificados: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Controles requeridos</Label><Textarea rows={2} value={form.controles_requeridos || ""} onChange={e => setForm({ ...form, controles_requeridos: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>EPP requerido</Label><Input placeholder="Casco, arnés, gafas..." value={form.epp_requerido || ""} onChange={e => setForm({ ...form, epp_requerido: e.target.value })} /></div>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tarea</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Responsable</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Inicio</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Sin permisos registrados</td></tr>
                ) : items.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{p.tipo}</Badge></td>
                    <td className="px-4 py-3 max-w-xs truncate">{p.descripcion_tarea}</td>
                    <td className="px-4 py-3">{p.responsable}</td>
                    <td className="px-4 py-3 text-xs">{new Date(p.fecha_inicio).toLocaleString()}</td>
                    <td className="px-4 py-3"><Badge variant={estadoVariant[p.estado] || "default"}>{p.estado}</Badge></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {p.estado === "Pendiente" && (
                          <Button variant="ghost" size="icon" onClick={() => aprobar(p)} title="Aprobar"><CheckCircle2 className="h-4 w-4 text-primary" /></Button>
                        )}
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
