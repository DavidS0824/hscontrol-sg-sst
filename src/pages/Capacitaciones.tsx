import { GraduationCap } from "lucide-react";
import { ModulePage } from "@/components/modules/ModulePage";

const columns = [
  { key: "fecha", label: "Fecha" },
  { key: "tema", label: "Tema" },
  { key: "instructor", label: "Instructor" },
  { key: "asistentes", label: "Asistentes" },
  { key: "duracion", label: "Duración" },
  { key: "estado", label: "Estado" },
];

const data = [
  { fecha: "2024-06-20", tema: "Trabajo en alturas", instructor: "Ext. SafeWork", asistentes: 25, duracion: "4h", estado: "Programada" },
  { fecha: "2024-06-14", tema: "Primeros auxilios", instructor: "ARL Sura", asistentes: 32, duracion: "8h", estado: "Completada" },
  { fecha: "2024-06-08", tema: "Manejo de extintores", instructor: "Juan Rojas", asistentes: 18, duracion: "2h", estado: "Completada" },
  { fecha: "2024-06-25", tema: "Riesgo químico", instructor: "María López", asistentes: 0, duracion: "3h", estado: "Programada" },
  { fecha: "2024-05-30", tema: "Ergonomía", instructor: "Ana Torres", asistentes: 40, duracion: "2h", estado: "Completada" },
];

export default function Capacitaciones() {
  return (
    <ModulePage
      title="Capacitaciones"
      icon={GraduationCap}
      description="Registro de actividades de formación y control de asistencia."
      columns={columns}
      data={data}
      statusKey="estado"
      addLabel="Nueva capacitación"
    />
  );
}
