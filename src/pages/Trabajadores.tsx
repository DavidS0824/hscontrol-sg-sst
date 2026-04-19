import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, UserCircle2, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Trabajador = {
  id: string;
  documento: string;
  tipo_documento: string;
  nombre: string;
  cargo: string | null;
  area: string | null;
  sede: string | null;
  fecha_ingreso: string | null;
  estado: string;
  eps: string | null;
  arl: string | null;
  afp: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  contacto_emergencia_nombre: string | null;
  contacto_emergencia_telefono: string | null;
  nivel_riesgo_cargo: string | null;
  observaciones: string | null;
};

const empty: Partial<Trabajador> = {
  tipo_documento: "CC",
  estado: "Activo",
  nivel_riesgo_cargo: "I",
};

export default function Trabajadores() {
  const { user } = useAuth();
  const [items, setItems] = useState<Trabajador[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Trabajador>>(empty);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("trabajadores").select("*").order("nombre");
    if (error) toast.error(error.message);
    setItems((data as Trabajador[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
    }
  }, [user]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return items.filter(
      (i) =>
        !t ||
        i.nombre.toLowerCase().includes(t) ||
        i.documento.toLowerCase().includes(t) ||
        (i.cargo ?? "").toLowerCase().includes(t) ||
        (i.area ?? "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const save = async () => {
    if (!form.documento || !form.nombre) {
      toast.error("Documento y nombre son obligatorios");
      return;
    }
    const payload = { ...form, created_by: user?.id };
    const op = form.id
      ? supabase.from("trabajadores").update(payload).eq("id", form.id)
      : supabase.from("trabajadores").insert(payload as any);
    const { error } = await op;
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(form.id ? "Trabajador actualizado" : "Trabajador creado");
    setOpen(false);
    setForm(empty);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este trabajador? Esto no borra su historial en otros módulos.")) return;
    const { error } = await supabase.from("trabajadores").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Eliminado");
    load();
  };

  const editar = (t: Trabajador) => {
    setForm(t);
    setOpen(true);
  };

  return (
    <AppLayout title="Trabajadores">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Maestro único de trabajadores. Sirve como base para el perfil 360° (exámenes, capacitaciones, ACI, accidentes).
          </p>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setForm(empty); }}>
              <DialogTrigger asChild>
                <Button className="shrink-0"><Plus className="h-4 w-4 mr-1.5" />Nuevo trabajador</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>{form.id ? "Editar" : "Nuevo"} trabajador</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tipo doc.">
                    <Select value={form.tipo_documento} onValueChange={(v) => setForm({ ...form, tipo_documento: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["CC", "CE", "TI", "PA", "PEP"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Documento *"><Input value={form.documento ?? ""} onChange={(e) => setForm({ ...form, documento: e.target.value })} /></Field>
                  <Field label="Nombre completo *" full><Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></Field>
                  <Field label="Cargo"><Input value={form.cargo ?? ""} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></Field>
                  <Field label="Área"><Input value={form.area ?? ""} onChange={(e) => setForm({ ...form, area: e.target.value })} /></Field>
                  <Field label="Sede"><Input value={form.sede ?? ""} onChange={(e) => setForm({ ...form, sede: e.target.value })} /></Field>
                  <Field label="Fecha ingreso"><Input type="date" value={form.fecha_ingreso ?? ""} onChange={(e) => setForm({ ...form, fecha_ingreso: e.target.value })} /></Field>
                  <Field label="Estado">
                    <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Activo", "Retirado", "Suspendido", "Incapacidad"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nivel riesgo cargo (ARL)">
                    <Select value={form.nivel_riesgo_cargo ?? "I"} onValueChange={(v) => setForm({ ...form, nivel_riesgo_cargo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["I", "II", "III", "IV", "V"].map((n) => <SelectItem key={n} value={n}>Clase {n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="EPS"><Input value={form.eps ?? ""} onChange={(e) => setForm({ ...form, eps: e.target.value })} /></Field>
                  <Field label="ARL"><Input value={form.arl ?? ""} onChange={(e) => setForm({ ...form, arl: e.target.value })} /></Field>
                  <Field label="AFP"><Input value={form.afp ?? ""} onChange={(e) => setForm({ ...form, afp: e.target.value })} /></Field>
                  <Field label="Teléfono"><Input value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
                  <Field label="Correo"><Input type="email" value={form.correo ?? ""} onChange={(e) => setForm({ ...form, correo: e.target.value })} /></Field>
                  <Field label="Dirección" full><Input value={form.direccion ?? ""} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></Field>
                  <Field label="Contacto emergencia"><Input value={form.contacto_emergencia_nombre ?? ""} onChange={(e) => setForm({ ...form, contacto_emergencia_nombre: e.target.value })} /></Field>
                  <Field label="Tel. emergencia"><Input value={form.contacto_emergencia_telefono ?? ""} onChange={(e) => setForm({ ...form, contacto_emergencia_telefono: e.target.value })} /></Field>
                  <Field label="Observaciones" full><Textarea value={form.observaciones ?? ""} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} /></Field>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button onClick={save}>Guardar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, documento, cargo o área…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Documento</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Área</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Riesgo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Cargando…</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Sin trabajadores. Crea el primero para construir el perfil 360°.</td></tr>}
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{t.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{t.tipo_documento} {t.documento}</td>
                    <td className="px-4 py-3">{t.cargo ?? "—"}</td>
                    <td className="px-4 py-3">{t.area ?? "—"}</td>
                    <td className="px-4 py-3"><Badge variant="outline">Clase {t.nivel_riesgo_cargo ?? "I"}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={t.estado === "Activo" ? "secondary" : "outline"}>{t.estado}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild size="sm" variant="ghost"><Link to={`/trabajadores/${t.id}`}><UserCircle2 className="h-4 w-4" /></Link></Button>
                        {isAdmin && <>
                          <Button size="sm" variant="ghost" onClick={() => editar(t)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
