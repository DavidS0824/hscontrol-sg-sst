import {
  LayoutDashboard,
  AlertTriangle,
  ClipboardCheck,
  GraduationCap,
  Stethoscope,
  FileText,
  Bell,
  ShieldAlert,
  CalendarRange,
  ClipboardList,
  TrendingUp,
  Camera,
  HardHat,
  ListChecks,
  Siren,
  Bot,
  FileSignature,
  Users,
  Brain,
  ChevronLeft,
  LogOut,
  Building2,
  Crown,
  Home,
  ShieldCheck,
  Activity,
  CalendarCheck,
  Sparkles,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import logoHSControl from "@/assets/logo-hscontrol.jpeg";
import { useAuth } from "@/contexts/AuthContext";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ModuleItem = { title: string; url: string; icon: any; key: string };
type ModuleGroup = { id: string; label: string; icon: any; items: ModuleItem[] };

const moduleGroups: ModuleGroup[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard, key: "dashboard" },
    ],
  },
  {
    id: "personal",
    label: "Gestión de Personal",
    icon: Users,
    items: [
      { title: "Trabajadores", url: "/trabajadores", icon: Users, key: "trabajadores" },
      { title: "Capacitaciones", url: "/capacitaciones", icon: GraduationCap, key: "capacitaciones" },
      { title: "Exámenes Médicos", url: "/examenes-medicos", icon: Stethoscope, key: "examenes-medicos" },
    ],
  },
  {
    id: "riesgos",
    label: "Identificación de Riesgos",
    icon: ShieldCheck,
    items: [
      { title: "Matriz de Riesgos", url: "/matriz-riesgos", icon: ShieldAlert, key: "matriz-riesgos" },
      { title: "Reporte ACI", url: "/reporte-aci", icon: Camera, key: "reporte-aci" },
      { title: "Inspecciones", url: "/inspecciones", icon: ClipboardCheck, key: "inspecciones" },
      { title: "Checklists", url: "/checklists", icon: ListChecks, key: "checklists" },
    ],
  },
  {
    id: "operacion",
    label: "Operación Diaria",
    icon: Activity,
    items: [
      { title: "Permisos de Trabajo", url: "/permisos-trabajo", icon: HardHat, key: "permisos-trabajo" },
      { title: "Accidentes", url: "/accidentes", icon: AlertTriangle, key: "accidentes" },
      { title: "Plan de Emergencias", url: "/plan-emergencias", icon: Siren, key: "plan-emergencias" },
    ],
  },
  {
    id: "planeacion",
    label: "Planeación SG-SST",
    icon: CalendarCheck,
    items: [
      { title: "Plan Anual (PAT)", url: "/plan-anual", icon: CalendarRange, key: "plan-anual" },
      { title: "Autoevaluación 0312", url: "/autoevaluacion", icon: ClipboardList, key: "autoevaluacion" },
      { title: "Plan de Mejoramiento", url: "/plan-mejoramiento", icon: TrendingUp, key: "plan-mejoramiento" },
    ],
  },
  {
    id: "ia",
    label: "Herramientas IA",
    icon: Sparkles,
    items: [
      { title: "Asistente IA", url: "/asistente-ia", icon: Bot, key: "asistente-ia" },
      { title: "Generador Docs IA", url: "/generador-documentos", icon: FileSignature, key: "generador-documentos" },
      { title: "Análisis IA", url: "/analitica-ia", icon: Brain, key: "analitica-ia" },
    ],
  },
  {
    id: "documentacion",
    label: "Documentación y Alertas",
    icon: FolderOpen,
    items: [
      { title: "Documentos", url: "/documentos", icon: FileText, key: "documentos" },
      { title: "Alertas", url: "/alertas", icon: Bell, key: "alertas" },
    ],
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut, hasModule, isSuperAdmin, empresa } = useAuth();
  const visibleGroups = moduleGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => hasModule(i.key)) }))
    .filter((g) => g.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src={logoHSControl} alt="HSControl" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-sidebar-primary-foreground tracking-tight">
                HSControl
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">
                SG-SST
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {visibleGroups.map((group) => {
          const groupActive = group.items.some((i) =>
            i.url === "/" ? location.pathname === "/" : location.pathname === i.url
          );
          if (collapsed) {
            return (
              <SidebarGroup key={group.id}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = item.url === "/"
                        ? location.pathname === "/"
                        : location.pathname === item.url;
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            className={
                              isActive
                                ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            }
                          >
                            <NavLink
                              to={item.url}
                              end={item.url === "/"}
                              activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                            >
                              <item.icon className="h-4 w-4" />
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }
          return (
            <Collapsible key={group.id} defaultOpen={groupActive} className="group/collapsible">
              <SidebarGroup className="py-1">
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors uppercase text-[10px] tracking-wider font-semibold">
                    <span className="flex items-center gap-2">
                      <group.icon className="h-3.5 w-3.5" />
                      {group.label}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const isActive = item.url === "/"
                          ? location.pathname === "/"
                          : location.pathname === item.url;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              tooltip={item.title}
                              className={
                                isActive
                                  ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              }
                            >
                              <NavLink
                                to={item.url}
                                end={item.url === "/"}
                                activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}

        {isSuperAdmin && (
          <Collapsible defaultOpen={location.pathname.startsWith("/super-admin")} className="group/collapsible">
            <SidebarGroup className="py-1">
              {!collapsed ? (
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors uppercase text-[10px] tracking-wider font-semibold">
                    <span className="flex items-center gap-2">
                      <Crown className="h-3.5 w-3.5" />
                      Administración
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              ) : null}
              <CollapsibleContent forceMount={collapsed ? true : undefined}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip="Super Admin"
                        className={location.pathname.startsWith("/super-admin")
                          ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}
                      >
                        <NavLink to="/super-admin" activeClassName="bg-sidebar-accent text-sidebar-primary font-semibold">
                          <Crown className="h-4 w-4" />
                          {!collapsed && <span>Super Admin</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <>
            {empresa && (
              <div className="flex items-start gap-2 px-1 pb-2 border-b border-sidebar-border/40">
                <Building2 className="h-3.5 w-3.5 mt-0.5 text-sidebar-foreground/60" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-semibold text-sidebar-foreground/80 truncate max-w-[140px]">{empresa.nombre}</span>
                  <span className="text-[10px] text-sidebar-foreground/50">Plan {empresa.plan?.nombre || "—"}</span>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/80 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Contraer menú
            </button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
