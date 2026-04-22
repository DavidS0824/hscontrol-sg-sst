import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "visualizador" | "participante" | "super_admin";

interface PlanInfo {
  id: string;
  nombre: string;
  precio: number;
  modulos: string[];
  max_usuarios: number;
  max_trabajadores: number;
}

interface EmpresaInfo {
  id: string;
  nombre: string;
  estado: string;
  fecha_vencimiento: string | null;
  plan: PlanInfo | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  empresa: EmpresaInfo | null;
  isSuperAdmin: boolean;
  hasModule: (module: string) => boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (data) {
      setRoles(data.map((r) => r.role as AppRole));
    }
  };

  const fetchEmpresa = async (userId: string) => {
    const { data: link } = await supabase
      .from("empresa_usuarios")
      .select("empresa_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!link) { setEmpresa(null); return; }
    const { data: emp } = await supabase
      .from("empresas")
      .select("id, nombre, estado, fecha_vencimiento, plan_id, planes(id, nombre, precio, modulos, max_usuarios, max_trabajadores)")
      .eq("id", link.empresa_id)
      .maybeSingle();
    if (emp) {
      const plan = (emp as any).planes;
      setEmpresa({
        id: emp.id,
        nombre: emp.nombre,
        estado: emp.estado,
        fecha_vencimiento: emp.fecha_vencimiento,
        plan: plan ? {
          id: plan.id,
          nombre: plan.nombre,
          precio: Number(plan.precio),
          modulos: Array.isArray(plan.modulos) ? plan.modulos : [],
          max_usuarios: plan.max_usuarios,
          max_trabajadores: plan.max_trabajadores,
        } : null,
      });
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchRoles(session.user.id);
            fetchEmpresa(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setEmpresa(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
        fetchEmpresa(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isSuperAdmin = roles.includes("super_admin");
  const hasModule = (module: string) => {
    if (isSuperAdmin) return true;
    if (!empresa || empresa.estado !== "activa" || !empresa.plan) return false;
    return empresa.plan.modulos.includes(module);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, loading, hasRole, empresa, isSuperAdmin, hasModule, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
