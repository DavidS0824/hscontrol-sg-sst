import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building2, Loader2 } from "lucide-react";
import logoHSControl from "@/assets/logo-hscontrol.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [codigoAcceso, setCodigoAcceso] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Ingresa tu correo", description: "Necesitamos tu correo para enviar el enlace.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
      setShowForgot(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim()) {
      toast({ title: "Empresa requerida", description: "Ingresa el nombre de tu empresa.", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Primero hacer login con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !authData.user) {
      toast({ title: "Error al iniciar sesión", description: authError?.message ?? "Credenciales incorrectas.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Verificar si es super_admin → acceso directo sin validar empresa
    const { data: superRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .eq("role", "super_admin")
      .maybeSingle();

    if (superRole) {
      setLoading(false);
      return;
    }

    // No es super admin → validar empresa
    const { data: empData } = await supabase
      .from("empresas")
      .select("id, nombre, estado")
      .ilike("nombre", empresa.trim())
      .maybeSingle();

    if (!empData) {
      toast({ title: "Empresa no encontrada", description: "Verifica el nombre de tu empresa.", variant: "destructive" });
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    if (empData.estado !== "activa") {
      toast({ title: "Empresa inactiva", description: "Tu empresa no tiene una suscripción activa. Contacta a HSControl.", variant: "destructive" });
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleCodigoAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data } = await supabase
      .from("capacitaciones")
      .select("id, tema")
      .eq("codigo_acceso", codigoAcceso)
      .maybeSingle();
    if (!data) {
      toast({ title: "Código inválido", description: "No se encontró una capacitación con ese código.", variant: "destructive" });
    } else {
      toast({ title: "Capacitación encontrada", description: `Inicia sesión para acceder a: ${data.tema}` });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-4 pb-2">
          <img src={logoHSControl} alt="HSControl" className="h-40 mx-auto object-contain" />
          <div>
            <p className="text-base font-semibold text-foreground tracking-wide">
              Gestión inteligente en Seguridad y Salud
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sistema SG-SST para MiPymes colombianas
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="codigo">Código</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-empresa">Empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-empresa"
                      type="text"
                      placeholder="Nombre de tu empresa"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Ingresando...
                    </span>
                  ) : "Iniciar sesión"}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </form>

              {showForgot && (
                <form onSubmit={handleForgotPassword} className="mt-4 space-y-3 p-4 border rounded-md bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Correo electrónico</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Enviando..." : "Enviar enlace"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForgot(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="codigo">
              <form onSubmit={handleCodigoAcceso} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ingresa el código proporcionado por tu instructor para acceder a la capacitación.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de acceso</Label>
                  <Input
                    id="codigo"
                    placeholder="Ej: CAP-2024-001"
                    value={codigoAcceso}
                    onChange={(e) => setCodigoAcceso(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verificando..." : "Acceder a capacitación"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
