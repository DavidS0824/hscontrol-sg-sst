import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, User, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { impersonating, empresa, isSuperAdmin, stopImpersonating } = useAuth();
  const navigate = useNavigate();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {isSuperAdmin && impersonating && (
            <div className="bg-amber-100 border-b border-amber-300 text-amber-900 px-4 py-2 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Viendo el sistema como <strong>{empresa?.nombre || "empresa"}</strong> (Plan {empresa?.plan?.nombre || "—"})
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-amber-400 text-amber-900 hover:bg-amber-200"
                onClick={() => { stopImpersonating(); navigate("/super-admin"); }}
              >
                <X className="h-3.5 w-3.5 mr-1" /> Salir de la vista
              </Button>
            </div>
          )}
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground" />
              {title && (
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
