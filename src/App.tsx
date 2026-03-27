import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Accidentes from "./pages/Accidentes";
import Inspecciones from "./pages/Inspecciones";
import Capacitaciones from "./pages/Capacitaciones";
import Examenes from "./pages/Examenes";
import Documentos from "./pages/Documentos";
import Alertas from "./pages/Alertas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accidentes" element={<Accidentes />} />
          <Route path="/inspecciones" element={<Inspecciones />} />
          <Route path="/capacitaciones" element={<Capacitaciones />} />
          <Route path="/examenes" element={<Examenes />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
