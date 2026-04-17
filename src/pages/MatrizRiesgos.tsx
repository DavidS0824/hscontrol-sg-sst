import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShieldAlert, Search, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Riesgo {
  id: string;
  proceso: string;
  actividad: string;
  area: string | null;
  peligro: string;
  tipo_peligro: string;
  nivel_riesgo: string;
  controles_existentes: string | null;
  controles_propuestos: string | null;
  responsable: string | null;
  fecha_revision: string | null;
  estado: string;
}

const nivelVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Bajo": "secondary",
  "Medio": "default",
  "Alto": "destructive",
  "Muy Alto": "destructive",
};

const tiposPeligro = ["Biológico", "Físico", "Químico", "Psicosocial", "Biomecánico", "Condiciones de seguridad", "Fenómenos naturales", "Otro"];
const niveles = ["Bajo", "Medio", "Alto", "Muy Alto"];

export default function MatrizRiesgos() {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasRole("admin");
  const [items, setItems] = useState<Riesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Riesgo | null>(null);
  const [form, setForm] = useState<Partial<Riesgo>>({ nivel_riesgo: "Medio", tipo_peligro: "Físico", estado: "Activo" });

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("matriz_riesgos").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error al cargar", description: error.message, variant: "destructive" });
    else setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openNew = () => { setEditing(null); setForm({ nivel_riesgo: "Medio", tipo_peligro: "Físico", estado: "Activo" }); setOpen(true); };
  const openEdit = (r: Riesgo) => { setEditing(r); setForm(r); setOpen(true); };

  const handleSave = async () => {
    if (!form.proceso || !form.actividad || !form.peligro) {
      toast({ title: "Completa los campos obligatorios", variant: "destructive" });
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...form, created_by: user?.id } as any;
    const { error } = editing
      ? await supabase.from("matriz_riesgos").update(payload).eq("id", editing.id)
      : await supabase.from("matriz_riesgos").insert(payload);
    if (error) toast({ title: "Error al guardar", description: error.message, variant: "destructive" });
    else {
      toast({ title: editing ? "Riesgo actualizado" : "Riesgo creado" });
      setOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este registro?")) return;
    const { error } = await supabase.from("matriz_riesgos").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Eliminado" }); fetchData(); }
  };

  const filtered = items.filter(i =>
    [i.proceso, i.actividad, i.peligro, i.area].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout title="Matriz de Peligros y Riesgos">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Identificación, valoración y control de peligros (GTC 45 simplificada)
          </p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" />Nuevo riesgo</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{editing ? "Editar riesgo" : "Nuevo riesgo"}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div className="space-y-1.5"><Label>Proceso *</Label><Input value={form.proceso || ""} onChange={e => setForm({ ...form, proceso: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Actividad *</Label><Input value={form.actividad || ""} onChange={e => setForm({ ...form, actividad: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Área</Label><Input value={form.area || ""} onChange={e => setForm({ ...form, area: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Responsable</Label><Input value={form.responsable || ""} onChange={e => setForm({ ...form, responsable: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Peligro *</Label><Input value={form.peligro || ""} onChange={e => setForm({ ...form, peligro: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Tipo de peligro</Label>
                    <Select value={form.tipo_peligro} onValueChange={v => setForm({ ...form, tipo_peligro: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{tiposPeligro.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nivel de riesgo</Label>
                    <Select value={form.nivel_riesgo} onValueChange={v => setForm({ ...form, nivel_riesgo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{niveles.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Controles existentes</Label><Textarea value={form.controles_existentes || ""} onChange={e => setForm({ ...form, controles_existentes: e.target.value })} /></div>
                  <div className="sm:col-span-2 space-y-1.5"><Label>Controles propuestos</Label><Textarea value={form.controles_propuestos || ""} onChange={e => setForm({ ...form, controles_propuestos: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Fecha revisión</Label><Input type="date" value={form.fecha_revision || ""} onChange={e => setForm({ ...form, fecha_revision: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Controlado">Controlado</SelectItem>
                        <SelectItem value="Cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
          <Input placeholder="Buscar por proceso, peligro, área..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="rounded-xl bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Proceso</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Peligro</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Área</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Nivel</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  {isAdmin && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sin registros aún</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">{r.proceso}</td>
                    <td className="px-4 py-3">{r.peligro}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.tipo_peligro}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.area || "—"}</td>
                    <td className="px-4 py-3"><Badge variant={nivelVariants[r.nivel_riesgo] || "outline"}>{r.nivel_riesgo}</Badge></td>
                    <td className="px-4 py-3"><Badge variant="outline">{r.estado}</Badge></td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
