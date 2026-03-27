import { useState } from "react";
import { GraduationCap, CalendarDays, Users, ClipboardCheck, Award, BookOpen, Plus, Copy } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const mockCapacitaciones = [
  { id: "1", tema: "Trabajo en alturas", instructor: "Ext. SafeWork", fecha: "2024-06-20", duracion: "4h", estado: "Programada", asistentes: 0, maxParticipantes: 25, codigoAcceso: "ALT-2024-001", progreso: 0 },
  { id: "2", tema: "Primeros auxilios", instructor: "ARL Sura", fecha: "2024-06-14", duracion: "8h", estado: "Completada", asistentes: 32, maxParticipantes: 40, codigoAcceso: "AUX-2024-002", progreso: 100 },
  { id: "3", tema: "Manejo de extintores", instructor: "Juan Rojas", fecha: "2024-06-08", duracion: "2h", estado: "Completada", asistentes: 18, maxParticipantes: 20, codigoAcceso: "EXT-2024-003", progreso: 100 },
  { id: "4", tema: "Riesgo químico", instructor: "María López", fecha: "2024-06-25", duracion: "3h", estado: "Programada", asistentes: 0, maxParticipantes: 30, codigoAcceso: "QUI-2024-004", progreso: 0 },
  { id: "5", tema: "Ergonomía", instructor: "Ana Torres", fecha: "2024-05-30", duracion: "2h", estado: "En curso", asistentes: 35, maxParticipantes: 40, codigoAcceso: "ERG-2024-005", progreso: 65 },
];

const mockAsistencia = [
  { nombre: "Carlos Pérez", email: "carlos@empresa.com", asistio: true },
  { nombre: "Ana Gómez", email: "ana@empresa.com", asistio: true },
  { nombre: "Luis Martínez", email: "luis@empresa.com", asistio: false },
  { nombre: "María Rodríguez", email: "maria@empresa.com", asistio: true },
];

const mockEvaluaciones = [
  { nombre: "Carlos Pérez", puntaje: 92, aprobado: true },
  { nombre: "Ana Gómez", puntaje: 88, aprobado: true },
  { nombre: "Luis Martínez", puntaje: 45, aprobado: false },
];

const mockMateriales = [
  { nombre: "Presentación - Trabajo en alturas", tipo: "PDF", fecha: "2024-06-18" },
  { nombre: "Video instructivo", tipo: "Video", fecha: "2024-06-18" },
  { nombre: "Normativa Resolución 4272", tipo: "PDF", fecha: "2024-06-15" },
];

const statusColors: Record<string, "default" | "secondary" | "destructive"> = {
  Programada: "default",
  "En curso": "default",
  Completada: "secondary",
};

export default function Capacitaciones() {
  const [selectedCap, setSelectedCap] = useState<string | null>(null);
  const { toast } = useToast();

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast({ title: "Código copiado", description: codigo });
  };

  const selected = mockCapacitaciones.find((c) => c.id === selectedCap);

  return (
    <AppLayout title="Capacitaciones">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Registro de actividades de formación, control de asistencia y evaluación.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Nueva capacitación
          </Button>
        </div>

        <Tabs defaultValue="programacion" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="programacion" className="gap-1.5 text-xs sm:text-sm">
              <CalendarDays className="h-4 w-4 hidden sm:block" /> Programación
            </TabsTrigger>
            <TabsTrigger value="asistencia" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-4 w-4 hidden sm:block" /> Asistencia
            </TabsTrigger>
            <TabsTrigger value="evaluacion" className="gap-1.5 text-xs sm:text-sm">
              <ClipboardCheck className="h-4 w-4 hidden sm:block" /> Evaluación
            </TabsTrigger>
            <TabsTrigger value="materiales" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4 hidden sm:block" /> Materiales
            </TabsTrigger>
            <TabsTrigger value="certificados" className="gap-1.5 text-xs sm:text-sm">
              <Award className="h-4 w-4 hidden sm:block" /> Certificados
            </TabsTrigger>
          </TabsList>

          {/* PROGRAMACIÓN */}
          <TabsContent value="programacion" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockCapacitaciones.map((cap) => (
                <Card
                  key={cap.id}
                  className={`cursor-pointer transition-all hover:shadow-card-hover ${selectedCap === cap.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setSelectedCap(cap.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{cap.tema}</CardTitle>
                      <Badge variant={statusColors[cap.estado] || "outline"}>{cap.estado}</Badge>
                    </div>
                    <CardDescription>{cap.instructor} · {cap.duracion}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fecha: {cap.fecha}</span>
                      <span className="text-muted-foreground">{cap.asistentes}/{cap.maxParticipantes}</span>
                    </div>
                    <Progress value={cap.progreso} className="h-2" />
                    <div className="flex items-center gap-2">
                      <Input value={cap.codigoAcceso} readOnly className="text-xs h-8 font-mono" />
                      <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => { e.stopPropagation(); copiarCodigo(cap.codigoAcceso); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ASISTENCIA */}
          <TabsContent value="asistencia" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Control de Asistencia {selected ? `- ${selected.tema}` : ""}
                </CardTitle>
                <CardDescription>Registra la asistencia de los participantes a cada capacitación.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Asistencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAsistencia.map((p, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3">{p.nombre}</td>
                          <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant={p.asistio ? "secondary" : "destructive"}>
                              {p.asistio ? "Presente" : "Ausente"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EVALUACIÓN */}
          <TabsContent value="evaluacion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Evaluaciones {selected ? `- ${selected.tema}` : ""}
                </CardTitle>
                <CardDescription>Resultados de evaluaciones aplicadas a los participantes.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Participante</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Puntaje</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockEvaluaciones.map((e, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-4 py-3">{e.nombre}</td>
                          <td className="px-4 py-3 font-semibold">{e.puntaje}/100</td>
                          <td className="px-4 py-3">
                            <Badge variant={e.aprobado ? "secondary" : "destructive"}>
                              {e.aprobado ? "Aprobado" : "Reprobado"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MATERIALES */}
          <TabsContent value="materiales" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Material Didáctico
                    </CardTitle>
                    <CardDescription>Archivos y recursos de apoyo para las capacitaciones.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Subir material
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMateriales.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{m.nombre}</p>
                          <p className="text-xs text-muted-foreground">{m.tipo} · {m.fecha}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Descargar</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CERTIFICADOS */}
          <TabsContent value="certificados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Certificados Emitidos
                </CardTitle>
                <CardDescription>Certificados generados para participantes que completaron y aprobaron la capacitación.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEvaluaciones.filter((e) => e.aprobado).map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                          <Award className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{e.nombre}</p>
                          <p className="text-xs text-muted-foreground">Puntaje: {e.puntaje}/100 · CERT-{String(i + 1).padStart(4, "0")}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Descargar PDF</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
