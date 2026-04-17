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
  ChevronLeft,
  LogOut,
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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const modules = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Matriz de Riesgos", url: "/matriz-riesgos", icon: ShieldAlert },
  { title: "Plan Anual (PAT)", url: "/plan-anual", icon: CalendarRange },
  { title: "Reporte ACI", url: "/reporte-aci", icon: Camera },
  { title: "Permisos de Trabajo", url: "/permisos-trabajo", icon: HardHat },
  { title: "Checklists", url: "/checklists", icon: ListChecks },
  { title: "Plan de Emergencias", url: "/plan-emergencias", icon: Siren },
  { title: "Accidentes", url: "/accidentes", icon: AlertTriangle },
  { title: "Inspecciones", url: "/inspecciones", icon: ClipboardCheck },
  { title: "Capacitaciones", url: "/capacitaciones", icon: GraduationCap },
  { title: "Exámenes Médicos", url: "/examenes", icon: Stethoscope },
  { title: "Documentos", url: "/documentos", icon: FileText },
  { title: "Autoevaluación 0312", url: "/autoevaluacion", icon: ClipboardList },
  { title: "Plan de Mejoramiento", url: "/plan-mejoramiento", icon: TrendingUp },
  { title: "Alertas", url: "/alertas", icon: Bell },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => {
                const isActive = location.pathname === item.url;
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
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <>
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
