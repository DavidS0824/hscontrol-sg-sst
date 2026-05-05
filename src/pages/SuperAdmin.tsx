import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Crown, Plus, Trash2, Edit, Check, X } from "lucide-react";

type Plan = { id: string; nombre: string; precio: number; max_usuarios: number; max_trabajadores: number; modulos: string[] };
type Empresa = { id: string; nombre: string; nit: string | null; contacto_email: string | null; contacto_telefono: string | null; estado: string; fecha_inicio: string; fecha_vencimiento: string | null; plan_id: string | null; plan?: Plan | null };
type EmpresaUsuario = { user_id: string; empresa_id: string; email?: string; full_name?: string; roles?: string[] };

const ROLES = ["admin", "visualizador", "participante"];

export default function SuperAdmin() {
  const { isSuperAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [usuarios, setUsuarios] = useState<EmpresaUsuario[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [openEmpresa, setOpenEmpresa] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [empresaForm, setEmpresaForm] = useState<Partial<Empresa>>({ estado: "activa" });
  const [openUsuario, setOpenUsuario] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<EmpresaUsuario | null>(null);
  const [userForm, setUserForm] = useState<{ email: string; password: string; full_name: string; roles: string[] }>({ email: "", password: "", full_name: "", roles: ["visualizador"] });
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) { fetchPlanes(); fetchEmpresas(); }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (selectedEmpresa) fetchUsuariosEmpresa(selectedEmpresa.id);
  }, [selectedEmpresa]);

  const fetchPlanes = async () => {
    const { data } = await supabase.from("planes").select("*").order("orden");
    if (data) setPlanes(data.map((p: any) => ({ ...p, modulos: Array.isArray(p.modulos) ? p.modulos : [] })));
  };

  const fetchEmpresas = async () => {
    const { data } = await supabase.from("empresas").select("*, planes(*)").order("created_at", { ascending: false });
    if (data) setEmpresas(data.map((e: any) => ({ ...e, plan: e.planes ? { ...e.planes, modulos: Array.isArray(e.planes.modulos) ? e.planes.modulos : [] } : null })));
  };

  const fetchUsuariosEmpresa = async (empresaId: string) => {
    const { data: links } = await supabase.from("empresa_usuarios").select("user_id, empresa_id").eq("empresa_id", empresaId);
    if (!links) { setUsuarios([]); return; }
    const ids = links.map(l => l.user_id);
    const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
    const { data: rolesData } = await supabase.from("user_roles").select("user_id, role").in("user_id", ids);
    setUsuarios(links.map(l => ({
      ...l,
      full_name: profiles?.find(p => p.user_id === l.user_id)?.full_name || "(sin nombre)",
      roles: rolesData?.filter(r => r.user_id === l.user_id).map(r => r.role) || [],
    })));
  };

  const guardarEmpresa = async () => {
    if (!empresaForm.nombre) { toast({ title: "Nombre requerido", variant: "destructive" }); return; }
    const payload: any = {
      nombre: empresaForm.nombre,
      nit: empresaForm.nit || null,
      contacto_email: empresaForm.contacto_email || null,
      contacto_telefono: empresaForm.contacto_telefono || null,
      estado: empresaForm.estado || "activa",
      plan_id: empresaForm.plan_id || null,
      fecha_vencimiento: empresaForm.fecha_vencimiento || null,
    };
    const op = editingEmpresa
      ? supabase.from("empresas").update(payload).eq("id", editingEmpresa.id)
      : supabase.from("empresas").insert(payload);
    const { error } = await op;
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingEmpresa ? "Empresa actualizada" : "Empresa creada" });
    setOpenEmpresa(false); setEditingEmpresa(null); setEmpresaForm({ estado: "activa" });
    fetchEmpresas();
  };

  const eliminarEmpresa = async (id: string) => {
    if (!confirm("¿Eliminar esta empresa? Se desvincularán sus usuarios pero los datos quedan.")) return;
    const { error } = await supabase.from("empresas").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Empresa eliminada" }); fetchEmpresas(); if (selectedEmpresa?.id === id) setSelectedEmpresa(null); }
  };

  const cambiarPlanEmpresa = async (empresaId: string, planId: string) => {
    const { error } = await supabase.from("empresas").update({ plan_id: planId }).eq("id", empresaId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Plan actualizado" }); fetchEmpresas(); }
  };

  const cambiarEstadoEmpresa = async (empresaId: string, estado: string) => {
    const { error } = await supabase.from("empresas").update({ estado }).eq("id", empresaId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Empresa ${estado === "activa" ? "activada" : estado}` }); fetchEmpresas(); }
  };

  const moverUsuario = async (userId: string, nuevaEmpresaId: string) => {
    const { error } = await supabase.from("empresa_usuarios").update({ empresa_id: nuevaEmpresaId }).eq("user_id", userId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Usuario movido" }); if (selectedEmpresa) fetchUsuariosEmpresa(selectedEmpresa.id); }
  };

  const desvincularUsuario = async (userId: string) => {
    if (!confirm("¿Quitar este usuario de la empresa?")) return;
    const { error } = await supabase.from("empresa_usuarios").delete().eq("user_id", userId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Usuario desvinculado" }); if (selectedEmpresa) fetchUsuariosEmpresa(selectedEmpresa.id); }
  };

  const eliminarUsuario = async (userId: string) => {
    if (!confirm("¿Eliminar este usuario PERMANENTEMENTE? Esta acción no se puede deshacer.")) return;
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "delete", user_id: userId } });
    if (error || (data as any)?.error) {
      toast({ title: "Error", description: error?.message || (data as any)?.error, variant: "destructive" });
    } else {
      toast({ title: "Usuario eliminado" });
      if (selectedEmpresa) fetchUsuariosEmpresa(selectedEmpresa.id);
    }
  };

  const guardarUsuario = async () => {
    if (!selectedEmpresa) return;
    setSavingUser(true);
    try {
      if (editingUsuario) {
        const payload: any = { action: "update", user_id: editingUsuario.user_id, full_name: userForm.full_name };
        if (userForm.password) payload.password = userForm.password;
        const { data, error } = await supabase.functions.invoke("admin-users", { body: payload });
        if (error || (data as any)?.error) { toast({ title: "Error", description: error?.message || (data as any)?.error, variant: "destructive" }); return; }
        toast({ title: "Usuario actualizado" });
      } else {
        if (!userForm.email || !userForm.password) { toast({ title: "Email y contraseña requeridos", variant: "destructive" }); return; }
        const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "create", email: userForm.email, password: userForm.password, full_name: userForm.full_name, empresa_id: selectedEmpresa.id, roles: userForm.roles } });
        if (error || (data as any)?.error) { toast({ title: "Error", description: error?.message || (data as any)?.error, variant: "destructive" }); return; }
        toast({ title: "Usuario creado" });
      }
      setOpenUsuario(false); setEditingUsuario(null); setUserForm({ email: "", password: "", full_name: "", roles: ["visualizador"] });
      fetchUsuariosEmpresa(selectedEmpresa.id);
    } finally { setSavingUser(false); }
  };

  const toggleRol = async (userId: string, rol: string, tiene: boolean) => {
    if (tiene) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", rol as any);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: rol as any });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Rol actualizado" });
    if (selectedEmpresa) fetchUsuariosEmpresa(selectedEmpresa.id);
  };

  if (loading) return <AppLayout><div className="p-8 text-muted-foreground">Cargando...</div></AppLayout>;
  if (!isSuperAdmin) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Crown className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Super Administración</h1>
            <p className="text-sm text-muted-foreground">Gestiona empresas, planes, usuarios y roles del sistema</p>
          </div>
        </div>

        <Tabs defaultValue="empresas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="empresas"><Building2 className="h-4 w-4 mr-2" />Empresas</TabsTrigger>
            <TabsTrigger value="usuarios"><Users className="h-4 w-4 mr-2" />Usuarios</TabsTrigger>
            <TabsTrigger value="planes"><Crown className="h-4 w-4 mr-2" />Planes</TabsTrigger>
          </TabsList>

          {/* EMPRESAS */}
          <TabsContent value="empresas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{empresas.length} empresa(s) registradas</h2>
              <Dialog open={openEmpresa} onOpenChange={(o) => { setOpenEmpresa(o); if (!o) { setEditingEmpresa(null); setEmpresaForm({ estado: "activa" }); } }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Nueva empresa</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>{editingEmpresa ? "Editar empresa" : "Nueva empresa"}</DialogTitle></DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div><Label>Nombre *</Label><Input value={empresaForm.nombre || ""} onChange={(e) => setEmpresaForm({ ...empresaForm, nombre: e.target.value })} /></div>
                    <div><Label>NIT</Label><Input value={empresaForm.nit || ""} onChange={(e) => setEmpresaForm({ ...empresaForm, nit: e.target.value })} /></div>
                    <div><Label>Email contacto</Label><Input type="email" value={empresaForm.contacto_email || ""} onChange={(e) => setEmpresaForm({ ...empresaForm, contacto_email: e.target.value })} /></div>
                    <div><Label>Teléfono</Label><Input value={empresaForm.contacto_telefono || ""} onChange={(e) => setEmpresaForm({ ...empresaForm, contacto_telefono: e.target.value })} /></div>
                    <div>
                      <Label>Plan</Label>
                      <Select value={empresaForm.plan_id || ""} onValueChange={(v) => setEmpresaForm({ ...empresaForm, plan_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar plan" /></SelectTrigger>
                        <SelectContent>{planes.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre} — ${p.precio.toLocaleString()}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Estado</Label>
                      <Select value={empresaForm.estado || "activa"} onValueChange={(v) => setEmpresaForm({ ...empresaForm, estado: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="activa">Activa</SelectItem>
                          <SelectItem value="suspendida">Suspendida</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2"><Label>Fecha de vencimiento</Label><Input type="date" value={empresaForm.fecha_vencimiento || ""} onChange={(e) => setEmpresaForm({ ...empresaForm, fecha_vencimiento: e.target.value })} /></div>
                  </div>
                  <DialogFooter><Button onClick={guardarEmpresa}>Guardar</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Empresa</TableHead><TableHead>NIT</TableHead><TableHead>Plan</TableHead><TableHead>Estado</TableHead><TableHead>Vencimiento</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {empresas.map(e => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{e.nombre}<br/><span className="text-xs text-muted-foreground">{e.contacto_email}</span></TableCell>
                        <TableCell>{e.nit || "—"}</TableCell>
                        <TableCell>
                          <Select value={e.plan_id || ""} onValueChange={(v) => cambiarPlanEmpresa(e.id, v)}>
                            <SelectTrigger className="w-[140px] h-8"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>{planes.map(p => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={e.estado} onValueChange={(v) => cambiarEstadoEmpresa(e.id, v)}>
                            <SelectTrigger className="w-[130px] h-8">
                              <Badge variant={e.estado === "activa" ? "default" : e.estado === "suspendida" ? "secondary" : "destructive"}>{e.estado}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="activa">Activa</SelectItem>
                              <SelectItem value="suspendida">Suspendida</SelectItem>
                              <SelectItem value="cancelada">Cancelada</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm">{e.fecha_vencimiento || "—"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedEmpresa(e); }}><Users className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingEmpresa(e); setEmpresaForm(e); setOpenEmpresa(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => eliminarEmpresa(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* USUARIOS */}
          <TabsContent value="usuarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios por empresa</CardTitle>
                <CardDescription>Selecciona una empresa para gestionar sus usuarios y roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedEmpresa?.id || ""} onValueChange={(v) => setSelectedEmpresa(empresas.find(e => e.id === v) || null)}>
                  <SelectTrigger className="w-full md:w-[400px]"><SelectValue placeholder="Selecciona una empresa" /></SelectTrigger>
                  <SelectContent>{empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nombre} ({e.plan?.nombre || "sin plan"})</SelectItem>)}</SelectContent>
                </Select>

                {selectedEmpresa && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="text-sm text-muted-foreground">
                        Plan: <strong>{selectedEmpresa.plan?.nombre || "—"}</strong> · Límite usuarios: <strong>{selectedEmpresa.plan?.max_usuarios || "—"}</strong> · Actuales: <strong>{usuarios.length}</strong>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => { setEditingUsuario(null); setUserForm({ email: "", password: "", full_name: "", roles: ["visualizador"] }); setOpenUsuario(true); }}
                        disabled={!!selectedEmpresa.plan && usuarios.length >= (selectedEmpresa.plan.max_usuarios || 0)}
                      >
                        <Plus className="h-4 w-4 mr-1" />Nuevo usuario
                      </Button>
                    </div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Roles</TableHead><TableHead>Mover a</TableHead><TableHead></TableHead></TableRow></TableHeader>
                      <TableBody>
                        {usuarios.map(u => (
                          <TableRow key={u.user_id}>
                            <TableCell className="font-medium">{u.full_name}<br/><span className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0,8)}…</span></TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {ROLES.map(r => {
                                  const tiene = u.roles?.includes(r);
                                  return (
                                    <Button key={r} size="sm" variant={tiene ? "default" : "outline"} className="h-7 text-xs" onClick={() => toggleRol(u.user_id, r, !!tiene)}>
                                      {tiene ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}{r}
                                    </Button>
                                  );
                                })}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select value="" onValueChange={(v) => moverUsuario(u.user_id, v)}>
                                <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Otra empresa..." /></SelectTrigger>
                                <SelectContent>{empresas.filter(e => e.id !== selectedEmpresa.id).map(e => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button size="sm" variant="ghost" title="Editar" onClick={() => { setEditingUsuario(u); setUserForm({ email: "", password: "", full_name: u.full_name || "", roles: u.roles || [] }); setOpenUsuario(true); }}><Edit className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" title="Desvincular" onClick={() => desvincularUsuario(u.user_id)}><X className="h-4 w-4 text-muted-foreground" /></Button>
                              <Button size="sm" variant="ghost" title="Eliminar usuario" onClick={() => eliminarUsuario(u.user_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {usuarios.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Sin usuarios vinculados</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <Dialog open={openUsuario} onOpenChange={(o) => { setOpenUsuario(o); if (!o) { setEditingUsuario(null); } }}>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingUsuario ? "Editar usuario" : "Nuevo usuario"}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                      {!editingUsuario && (
                        <div><Label>Email *</Label><Input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                      )}
                      <div><Label>Nombre completo</Label><Input value={userForm.full_name} onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })} /></div>
                      <div><Label>{editingUsuario ? "Nueva contraseña (opcional)" : "Contraseña *"}</Label><Input type="text" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Mínimo 6 caracteres" /></div>
                      {!editingUsuario && (
                        <div>
                          <Label>Roles</Label>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {ROLES.map(r => {
                              const tiene = userForm.roles.includes(r);
                              return (
                                <Button key={r} type="button" size="sm" variant={tiene ? "default" : "outline"} onClick={() => setUserForm({ ...userForm, roles: tiene ? userForm.roles.filter(x => x !== r) : [...userForm.roles, r] })}>
                                  {r}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter><Button onClick={guardarUsuario} disabled={savingUser}>{savingUser ? "Guardando..." : "Guardar"}</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PLANES */}
          <TabsContent value="planes" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {planes.map(p => (
                <Card key={p.id} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {p.nombre}
                      <Badge variant="outline">${p.precio.toLocaleString("es-CO")}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {p.max_usuarios} usuarios · {p.max_trabajadores >= 999999 ? "Trabajadores ilimitados" : `${p.max_trabajadores} trabajadores`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground mb-2">Módulos incluidos ({p.modulos.length}):</div>
                    <div className="flex flex-wrap gap-1">
                      {p.modulos.map(m => <Badge key={m} variant="secondary" className="text-[10px]">{m}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Los precios y módulos se pueden modificar directamente en la base de datos. Próximamente: editor visual de planes.</p>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}