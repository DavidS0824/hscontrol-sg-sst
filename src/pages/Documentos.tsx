import { FileText } from "lucide-react";
import { ModulePage } from "@/components/modules/ModulePage";

const columns = [
  { key: "nombre", label: "Documento" },
  { key: "categoria", label: "Categoría" },
  { key: "version", label: "Versión" },
  { key: "actualizado", label: "Actualizado" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
];

const data = [
  { nombre: "Matriz de riesgos", categoria: "Gestión del riesgo", version: "v3.2", actualizado: "2024-06-10", responsable: "Laura Gómez", estado: "Vigente" },
  { nombre: "Plan de emergencias", categoria: "Emergencias", version: "v2.1", actualizado: "2024-03-15", responsable: "Carlos Díaz", estado: "Vigente" },
  { nombre: "Política SST", categoria: "Políticas", version: "v1.5", actualizado: "2024-01-20", responsable: "Gerencia", estado: "Vigente" },
  { nombre: "Procedimiento trabajo en alturas", categoria: "Procedimientos", version: "v2.0", actualizado: "2023-11-30", responsable: "Juan Rojas", estado: "Por vencer" },
  { nombre: "Reglamento de higiene", categoria: "Reglamentos", version: "v1.0", actualizado: "2022-06-01", responsable: "María Pérez", estado: "Vencido" },
];

export default function Documentos() {
  return (
    <ModulePage
      title="Gestión Documental"
      icon={FileText}
      description="Almacenamiento de evidencias y organización documental por categorías."
      columns={columns}
      data={data}
      statusKey="estado"
      addLabel="Subir documento"
    />
  );
}
