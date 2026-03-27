import { Stethoscope } from "lucide-react";
import { ModulePage } from "@/components/modules/ModulePage";

const columns = [
  { key: "trabajador", label: "Trabajador" },
  { key: "tipo", label: "Tipo examen" },
  { key: "fecha", label: "Último examen" },
  { key: "vencimiento", label: "Vencimiento" },
  { key: "concepto", label: "Concepto" },
  { key: "estado", label: "Estado" },
];

const data = [
  { trabajador: "Juan Martínez", tipo: "Periódico", fecha: "2024-01-15", vencimiento: "2025-01-15", concepto: "Apto", estado: "Vigente" },
  { trabajador: "María López", tipo: "Ingreso", fecha: "2024-06-01", vencimiento: "2025-06-01", concepto: "Apto", estado: "Vigente" },
  { trabajador: "Carlos Ruiz", tipo: "Periódico", fecha: "2023-05-20", vencimiento: "2024-05-20", concepto: "Apto con restricciones", estado: "Vencido" },
  { trabajador: "Ana García", tipo: "Periódico", fecha: "2024-04-10", vencimiento: "2024-07-10", concepto: "Apto", estado: "Por vencer" },
  { trabajador: "Pedro Sánchez", tipo: "Egreso", fecha: "2024-06-15", vencimiento: "N/A", concepto: "Apto", estado: "Completada" },
];

export default function Examenes() {
  return (
    <ModulePage
      title="Exámenes Médicos"
      icon={Stethoscope}
      description="Seguimiento de exámenes médicos ocupacionales y control de vencimientos."
      columns={columns}
      data={data}
      statusKey="estado"
      addLabel="Nuevo examen"
    />
  );
}
