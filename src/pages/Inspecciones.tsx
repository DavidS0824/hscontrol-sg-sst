import { ClipboardCheck } from "lucide-react";
import { ModulePage } from "@/components/modules/ModulePage";

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "area", label: "Área" },
  { key: "inspector", label: "Inspector" },
  { key: "tipo", label: "Tipo" },
  { key: "hallazgos", label: "Hallazgos" },
  { key: "estado", label: "Estado" },
];

const data = [
  { fecha: "2024-06-18", area: "Producción", inspector: "Laura Gómez", tipo: "Seguridad", hallazgos: 3, estado: "Completada" },
  { fecha: "2024-06-15", area: "Bodega", inspector: "Carlos Díaz", tipo: "Orden y aseo", hallazgos: 5, estado: "Completada" },
  { fecha: "2024-06-20", area: "Oficinas", inspector: "María Pérez", tipo: "Ergonómica", hallazgos: 0, estado: "Programada" },
  { fecha: "2024-06-12", area: "Mantenimiento", inspector: "Juan Rojas", tipo: "Eléctrica", hallazgos: 2, estado: "Completada" },
  { fecha: "2024-06-25", area: "Laboratorio", inspector: "Ana Torres", tipo: "Químicos", hallazgos: 0, estado: "Programada" },
];

export default function Inspecciones() {
  return (
    <ModulePage
      title="Inspecciones"
      icon={ClipboardCheck}
      description="Checklist digital, registro de hallazgos y seguimiento de inspecciones."
      columns={columns}
      data={data}
      statusKey="estado"
      addLabel="Nueva inspección"
    />
  );
}
