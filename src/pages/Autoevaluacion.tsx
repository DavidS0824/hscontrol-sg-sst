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
import { Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Estandar {
  id: string;
  anio_evaluacion: number;
  numero_estandar: string;
  ciclo: string;
  estandar: string;
  criterio: string | null;
  calificacion_obtenida: number;
  calificacion_maxima: number;
  justificacion: string | null;
  evidencia: string | null;
}

const ciclos = ["Planear", "Hacer", "Verificar", "Actuar"];

export default function Autoevaluacion() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Estandar[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Estandar | null>(null);
  const [form, setForm] = useState<Partial<Estandar>>({ anio_evaluacion: new Date().getFullYear(), ciclo: "Planear", calificacion_obtenida: 0, calificacion_maxima: 0 });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("autoevaluacion_estandares").select("*").order("numero_estandar");
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ anio_evaluacion: new Date().getFullYear(), ciclo: "Planear", calificacion_obtenida: 0, calificacion_maxima: 0 }); setOpen(true); };
  const openEdit = (e: Estandar) => { setEditing(e); setForm(e); setOpen(true); };

  const handleSave = async () => {
    if (!form.numero_estandar || !form.estandar) { toast({ title: "Número y estándar son obligatorios", variant: "destructive" }); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("autoevaluacion_estandares").update(payload).eq("id", editing.id)
      : await supabase.from("autoevaluacion_estandares").insert(payload);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: editing ? "Actualizado" : "Creado" }); setOpen(false); fetchData(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este estándar?")) return;
    const { error } = await supabase.from("autoevaluacion_estandares").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  const totalObtenido = items.reduce((s, i) => s + Number(i.calificacion_obtenida || 0), 0);
  const totalMaximo = items.reduce((s, i) => s + Number(i.calificacion_maxima || 0), 0);
  const porcentaje = totalMaximo > 0 ? Math.round((totalObtenido / totalMaximo) * 100) : 0;
  const clasificacion = porcentaje >= 86 ? { label: "Aceptable", variant: "secondary" as const } : porcentaje >= 61 ? { label: "Moderadamente aceptable", variant: "default" as const } : { label: "Crítico", variant: "destructive" as const };

  return (
    <AppLayout title="Autoevaluación Estándares Mínimos">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Estándares evaluados</p>
            <p className="text-2xl font-bold mt-1">{items.length} <span className="text-sm font-normal text-muted-foreground">/ 60</span></p>
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Cumplimiento</p>
            <p className="text-2xl font-bold mt-1">{porcentaje}%</p>
            <Progress value={porcentaje} className="h-1.5 mt-2" />
          </div>
          <div className="rounded-xl bg-card shadow-card p-4">
            <p className="text-xs text-muted-foreground">Clasificación</p>
            <Badge variant={clasificacion.variant} className="mt-2 text-sm">{clasificacion.label}</Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Resolución 0312 de 2019 · 60 estándares mínimos
          </p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo estándar</Button></DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} estándar</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="space-y-1.5"><Label>Número *</Label><Input placeholder="1.1.1" value={form.numero_estandar || ""} onChange={e => setForm({ ...form, numero_estandar: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Ciclo PHVA</Label>
                    <Select value={form.ciclo} onValueChange={v => setForm({ ...form, ciclo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ciclos.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Estándar *</Label><Input value={form.estandar || ""} onChange={e => setForm({ ...form, estandar: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Criterio</Label><Textarea value={form.criterio || ""} onChange={e => setForm({ ...form, criterio: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Calificación obtenida</Label><Input type="number" step="0.25" value={form.calificacion_obtenida ?? 0} onChange={e => setForm({ ...form, calificacion_obtenida: parseFloat(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label>Calificación máxima</Label><Input type="number" step="0.25" value={form.calificacion_maxima ?? 0} onChange={e => setForm({ ...form, calificacion_maxima: parseFloat(e.target.value) })} /></div>
                  <div className="space-y-1.5"><Label>Año</Label><Input type="number" value={form.anio_evaluacion || ""} onChange={e => setForm({ ...form, anio_evaluacion: parseInt(e.target.value) })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Justificación</Label><Textarea value={form.justificacion || ""} onChange={e => setForm({ ...form, justificacion: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Evidencia</Label><Textarea value={form.evidencia || ""} onChange={e => setForm({ ...form, evidencia: e.target.value })} /></div>
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
                  <th className="px-4 py-3 font-medium text-muted-foreground w-20">N°</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Ciclo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estándar</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Puntaje</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay estándares evaluados</td></tr>
                ) : items.map(e => (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{e.numero_estandar}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{e.ciclo}</Badge></td>
                    <td className="px-4 py-3">{e.estandar}</td>
                    <td className="px-4 py-3 text-right font-medium">{Number(e.calificacion_obtenida)} / {Number(e.calificacion_maxima)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
