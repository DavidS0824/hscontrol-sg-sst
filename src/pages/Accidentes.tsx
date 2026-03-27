import { AlertTriangle } from "lucide-react";
import { ModulePage } from "@/components/modules/ModulePage";

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "trabajador", label: "Trabajador" },
  { key: "area", label: "Área" },
  { key: "tipo", label: "Tipo" },
  { key: "severidad", label: "Severidad" },
  { key: "estado", label: "Estado" },
];

const data = [
  { fecha: "2024-06-15", trabajador: "Juan Martínez", area: "Producción", tipo: "Accidente", severidad: "Moderado", estado: "En investigación" },
  { fecha: "2024-06-10", trabajador: "María López", area: "Bodega", tipo: "Incidente", severidad: "Leve", estado: "Cerrado" },
  { fecha: "2024-06-02", trabajador: "Carlos Ruiz", area: "Mantenimiento", tipo: "Accidente", severidad: "Grave", estado: "Abierto" },
  { fecha: "2024-05-28", trabajador: "Ana García", area: "Oficinas", tipo: "Incidente", severidad: "Leve", estado: "Cerrado" },
  { fecha: "2024-05-15", trabajador: "Pedro Sánchez", area: "Producción", tipo: "Accidente", severidad: "Moderado", estado: "Cerrado" },
];

export default function Accidentes() {
  return (
    <ModulePage
      title="Accidentes e Incidentes"
      icon={AlertTriangle}
      description="Registro, seguimiento y cierre de accidentes e incidentes laborales."
      columns={columns}
      data={data}
      statusKey="estado"
      addLabel="Reportar incidente"
    />
  );
}
