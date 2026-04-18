import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Accidentes from "./pages/Accidentes";
import Inspecciones from "./pages/Inspecciones";
import Capacitaciones from "./pages/Capacitaciones";
import Examenes from "./pages/Examenes";
import Documentos from "./pages/Documentos";
import Alertas from "./pages/Alertas";
import MatrizRiesgos from "./pages/MatrizRiesgos";
import PlanAnualTrabajo from "./pages/PlanAnualTrabajo";
import Autoevaluacion from "./pages/Autoevaluacion";
import PlanMejoramiento from "./pages/PlanMejoramiento";
import ReporteACI from "./pages/ReporteACI";
import PermisosTrabajo from "./pages/PermisosTrabajo";
import Checklists from "./pages/Checklists";
import PlanEmergencias from "./pages/PlanEmergencias";
import AsistenteIA from "./pages/AsistenteIA";
import GeneradorDocumentos from "./pages/GeneradorDocumentos";
import ExamenesMedicos from "./pages/ExamenesMedicos";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/accidentes" element={<ProtectedRoute><Accidentes /></ProtectedRoute>} />
    <Route path="/inspecciones" element={<ProtectedRoute><Inspecciones /></ProtectedRoute>} />
    <Route path="/capacitaciones" element={<ProtectedRoute><Capacitaciones /></ProtectedRoute>} />
    <Route path="/examenes" element={<ProtectedRoute><Examenes /></ProtectedRoute>} />
    <Route path="/documentos" element={<ProtectedRoute><Documentos /></ProtectedRoute>} />
    <Route path="/alertas" element={<ProtectedRoute><Alertas /></ProtectedRoute>} />
    <Route path="/matriz-riesgos" element={<ProtectedRoute><MatrizRiesgos /></ProtectedRoute>} />
    <Route path="/plan-anual" element={<ProtectedRoute><PlanAnualTrabajo /></ProtectedRoute>} />
    <Route path="/autoevaluacion" element={<ProtectedRoute><Autoevaluacion /></ProtectedRoute>} />
    <Route path="/plan-mejoramiento" element={<ProtectedRoute><PlanMejoramiento /></ProtectedRoute>} />
    <Route path="/reporte-aci" element={<ProtectedRoute><ReporteACI /></ProtectedRoute>} />
    <Route path="/permisos-trabajo" element={<ProtectedRoute><PermisosTrabajo /></ProtectedRoute>} />
    <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
    <Route path="/plan-emergencias" element={<ProtectedRoute><PlanEmergencias /></ProtectedRoute>} />
    <Route path="/asistente-ia" element={<ProtectedRoute><AsistenteIA /></ProtectedRoute>} />
    <Route path="/generador-documentos" element={<ProtectedRoute><GeneradorDocumentos /></ProtectedRoute>} />
    <Route path="/examenes-medicos" element={<ProtectedRoute><ExamenesMedicos /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
