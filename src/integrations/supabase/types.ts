export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aci_reportes: {
        Row: {
          acciones_tomadas: string | null
          area: string | null
          created_at: string
          descripcion: string
          empresa_id: string
          estado: string
          fecha_cierre: string | null
          fecha_reporte: string
          foto_url: string | null
          id: string
          nivel_riesgo: string
          reportado_por: string | null
          reportado_por_nombre: string | null
          tipo: string
          ubicacion: string | null
          updated_at: string
        }
        Insert: {
          acciones_tomadas?: string | null
          area?: string | null
          created_at?: string
          descripcion: string
          empresa_id: string
          estado?: string
          fecha_cierre?: string | null
          fecha_reporte?: string
          foto_url?: string | null
          id?: string
          nivel_riesgo?: string
          reportado_por?: string | null
          reportado_por_nombre?: string | null
          tipo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Update: {
          acciones_tomadas?: string | null
          area?: string | null
          created_at?: string
          descripcion?: string
          empresa_id?: string
          estado?: string
          fecha_cierre?: string | null
          fecha_reporte?: string
          foto_url?: string | null
          id?: string
          nivel_riesgo?: string
          reportado_por?: string | null
          reportado_por_nombre?: string | null
          tipo?: string
          ubicacion?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      asistencia: {
        Row: {
          asistio: boolean | null
          capacitacion_id: string
          fecha_registro: string
          id: string
          user_id: string
        }
        Insert: {
          asistio?: boolean | null
          capacitacion_id: string
          fecha_registro?: string
          id?: string
          user_id: string
        }
        Update: {
          asistio?: boolean | null
          capacitacion_id?: string
          fecha_registro?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "asistencia_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "capacitaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      autoevaluacion_estandares: {
        Row: {
          anio_evaluacion: number
          calificacion_maxima: number
          calificacion_obtenida: number
          ciclo: string
          created_at: string
          created_by: string | null
          criterio: string | null
          empresa_id: string
          estandar: string
          evidencia: string | null
          id: string
          justificacion: string | null
          numero_estandar: string
          updated_at: string
        }
        Insert: {
          anio_evaluacion?: number
          calificacion_maxima?: number
          calificacion_obtenida?: number
          ciclo: string
          created_at?: string
          created_by?: string | null
          criterio?: string | null
          empresa_id: string
          estandar: string
          evidencia?: string | null
          id?: string
          justificacion?: string | null
          numero_estandar: string
          updated_at?: string
        }
        Update: {
          anio_evaluacion?: number
          calificacion_maxima?: number
          calificacion_obtenida?: number
          ciclo?: string
          created_at?: string
          created_by?: string | null
          criterio?: string | null
          empresa_id?: string
          estandar?: string
          evidencia?: string | null
          id?: string
          justificacion?: string | null
          numero_estandar?: string
          updated_at?: string
        }
        Relationships: []
      }
      capacitaciones: {
        Row: {
          codigo_acceso: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          duracion: string
          empresa_id: string
          estado: string
          fecha: string
          id: string
          instructor: string
          max_participantes: number | null
          tema: string
          updated_at: string
        }
        Insert: {
          codigo_acceso?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          duracion: string
          empresa_id: string
          estado?: string
          fecha: string
          id?: string
          instructor: string
          max_participantes?: number | null
          tema: string
          updated_at?: string
        }
        Update: {
          codigo_acceso?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          duracion?: string
          empresa_id?: string
          estado?: string
          fecha?: string
          id?: string
          instructor?: string
          max_participantes?: number | null
          tema?: string
          updated_at?: string
        }
        Relationships: []
      }
      certificados: {
        Row: {
          capacitacion_id: string
          codigo_certificado: string
          fecha_emision: string
          id: string
          user_id: string
        }
        Insert: {
          capacitacion_id: string
          codigo_certificado?: string
          fecha_emision?: string
          id?: string
          user_id: string
        }
        Update: {
          capacitacion_id?: string
          codigo_certificado?: string
          fecha_emision?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "capacitaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_ejecuciones: {
        Row: {
          area: string | null
          created_at: string
          ejecutado_por: string | null
          ejecutado_por_nombre: string | null
          empresa_id: string
          estado: string
          fecha_ejecucion: string
          id: string
          observaciones: string | null
          plantilla_id: string
          porcentaje_cumplimiento: number
          ubicacion: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          ejecutado_por?: string | null
          ejecutado_por_nombre?: string | null
          empresa_id: string
          estado?: string
          fecha_ejecucion?: string
          id?: string
          observaciones?: string | null
          plantilla_id: string
          porcentaje_cumplimiento?: number
          ubicacion?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          ejecutado_por?: string | null
          ejecutado_por_nombre?: string | null
          empresa_id?: string
          estado?: string
          fecha_ejecucion?: string
          id?: string
          observaciones?: string | null
          plantilla_id?: string
          porcentaje_cumplimiento?: number
          ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_ejecuciones_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "checklist_plantillas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          created_at: string
          id: string
          obligatorio: boolean
          orden: number
          plantilla_id: string
          pregunta: string
        }
        Insert: {
          created_at?: string
          id?: string
          obligatorio?: boolean
          orden?: number
          plantilla_id: string
          pregunta: string
        }
        Update: {
          created_at?: string
          id?: string
          obligatorio?: boolean
          orden?: number
          plantilla_id?: string
          pregunta?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_plantilla_id_fkey"
            columns: ["plantilla_id"]
            isOneToOne: false
            referencedRelation: "checklist_plantillas"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_plantillas: {
        Row: {
          activa: boolean
          categoria: string
          created_at: string
          created_by: string | null
          descripcion: string | null
          empresa_id: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          activa?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          empresa_id: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          activa?: boolean
          categoria?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          empresa_id?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      checklist_respuestas: {
        Row: {
          created_at: string
          ejecucion_id: string
          id: string
          item_id: string
          observacion: string | null
          respuesta: string
        }
        Insert: {
          created_at?: string
          ejecucion_id: string
          id?: string
          item_id: string
          observacion?: string | null
          respuesta?: string
        }
        Update: {
          created_at?: string
          ejecucion_id?: string
          id?: string
          item_id?: string
          observacion?: string | null
          respuesta?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_respuestas_ejecucion_id_fkey"
            columns: ["ejecucion_id"]
            isOneToOne: false
            referencedRelation: "checklist_ejecuciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_respuestas_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_usuarios: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ciudad: string | null
          contacto_email: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          estado: string
          fecha_inicio: string
          fecha_vencimiento: string | null
          id: string
          nit: string | null
          nombre: string
          notas: string | null
          plan_id: string | null
          updated_at: string
        }
        Insert: {
          ciudad?: string | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          estado?: string
          fecha_inicio?: string
          fecha_vencimiento?: string | null
          id?: string
          nit?: string | null
          nombre: string
          notas?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Update: {
          ciudad?: string | null
          contacto_email?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          estado?: string
          fecha_inicio?: string
          fecha_vencimiento?: string | null
          id?: string
          nit?: string | null
          nombre?: string
          notas?: string | null
          plan_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluaciones: {
        Row: {
          aprobado: boolean | null
          capacitacion_id: string
          fecha_evaluacion: string
          id: string
          puntaje: number | null
          user_id: string
        }
        Insert: {
          aprobado?: boolean | null
          capacitacion_id: string
          fecha_evaluacion?: string
          id?: string
          puntaje?: number | null
          user_id: string
        }
        Update: {
          aprobado?: boolean | null
          capacitacion_id?: string
          fecha_evaluacion?: string
          id?: string
          puntaje?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluaciones_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "capacitaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      examenes_medicos: {
        Row: {
          aptitud: string
          archivo_url: string | null
          area: string | null
          cargo: string | null
          created_at: string
          created_by: string | null
          datos_extraidos: Json | null
          empresa_id: string
          fecha_examen: string
          fecha_vencimiento: string | null
          id: string
          ips: string | null
          medico_evaluador: string | null
          observaciones: string | null
          recomendaciones: string | null
          restricciones: string | null
          tipo_examen: string
          trabajador_documento: string | null
          trabajador_nombre: string
          updated_at: string
        }
        Insert: {
          aptitud?: string
          archivo_url?: string | null
          area?: string | null
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          datos_extraidos?: Json | null
          empresa_id: string
          fecha_examen?: string
          fecha_vencimiento?: string | null
          id?: string
          ips?: string | null
          medico_evaluador?: string | null
          observaciones?: string | null
          recomendaciones?: string | null
          restricciones?: string | null
          tipo_examen?: string
          trabajador_documento?: string | null
          trabajador_nombre: string
          updated_at?: string
        }
        Update: {
          aptitud?: string
          archivo_url?: string | null
          area?: string | null
          cargo?: string | null
          created_at?: string
          created_by?: string | null
          datos_extraidos?: Json | null
          empresa_id?: string
          fecha_examen?: string
          fecha_vencimiento?: string | null
          id?: string
          ips?: string | null
          medico_evaluador?: string | null
          observaciones?: string | null
          recomendaciones?: string | null
          restricciones?: string | null
          tipo_examen?: string
          trabajador_documento?: string | null
          trabajador_nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      materiales: {
        Row: {
          capacitacion_id: string
          created_at: string
          id: string
          nombre: string
          tipo: string
          uploaded_by: string | null
          url: string | null
        }
        Insert: {
          capacitacion_id: string
          created_at?: string
          id?: string
          nombre: string
          tipo: string
          uploaded_by?: string | null
          url?: string | null
        }
        Update: {
          capacitacion_id?: string
          created_at?: string
          id?: string
          nombre?: string
          tipo?: string
          uploaded_by?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materiales_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "capacitaciones"
            referencedColumns: ["id"]
          },
        ]
      }
      matriz_riesgos: {
        Row: {
          actividad: string
          area: string | null
          controles_existentes: string | null
          controles_propuestos: string | null
          created_at: string
          created_by: string | null
          empresa_id: string
          estado: string
          fecha_revision: string | null
          id: string
          nivel_riesgo: string
          peligro: string
          proceso: string
          responsable: string | null
          tipo_peligro: string
          updated_at: string
        }
        Insert: {
          actividad: string
          area?: string | null
          controles_existentes?: string | null
          controles_propuestos?: string | null
          created_at?: string
          created_by?: string | null
          empresa_id: string
          estado?: string
          fecha_revision?: string | null
          id?: string
          nivel_riesgo?: string
          peligro: string
          proceso: string
          responsable?: string | null
          tipo_peligro: string
          updated_at?: string
        }
        Update: {
          actividad?: string
          area?: string | null
          controles_existentes?: string | null
          controles_propuestos?: string | null
          created_at?: string
          created_by?: string | null
          empresa_id?: string
          estado?: string
          fecha_revision?: string | null
          id?: string
          nivel_riesgo?: string
          peligro?: string
          proceso?: string
          responsable?: string | null
          tipo_peligro?: string
          updated_at?: string
        }
        Relationships: []
      }
      permisos_trabajo: {
        Row: {
          aprobado_por: string | null
          area: string | null
          controles_requeridos: string | null
          created_at: string
          created_by: string | null
          descripcion_tarea: string
          ejecutores: string | null
          empresa_id: string
          epp_requerido: string | null
          estado: string
          fecha_aprobacion: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          observaciones: string | null
          responsable: string
          riesgos_identificados: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          aprobado_por?: string | null
          area?: string | null
          controles_requeridos?: string | null
          created_at?: string
          created_by?: string | null
          descripcion_tarea: string
          ejecutores?: string | null
          empresa_id: string
          epp_requerido?: string | null
          estado?: string
          fecha_aprobacion?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          observaciones?: string | null
          responsable: string
          riesgos_identificados?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          aprobado_por?: string | null
          area?: string | null
          controles_requeridos?: string | null
          created_at?: string
          created_by?: string | null
          descripcion_tarea?: string
          ejecutores?: string | null
          empresa_id?: string
          epp_requerido?: string | null
          estado?: string
          fecha_aprobacion?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          observaciones?: string | null
          responsable?: string
          riesgos_identificados?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_anual_trabajo: {
        Row: {
          actividad: string
          anio: number
          avance: number
          created_at: string
          created_by: string | null
          empresa_id: string
          estado: string
          evidencias: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          objetivo: string | null
          observaciones: string | null
          presupuesto: number | null
          responsable: string | null
          updated_at: string
        }
        Insert: {
          actividad: string
          anio?: number
          avance?: number
          created_at?: string
          created_by?: string | null
          empresa_id: string
          estado?: string
          evidencias?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          objetivo?: string | null
          observaciones?: string | null
          presupuesto?: number | null
          responsable?: string | null
          updated_at?: string
        }
        Update: {
          actividad?: string
          anio?: number
          avance?: number
          created_at?: string
          created_by?: string | null
          empresa_id?: string
          estado?: string
          evidencias?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          objetivo?: string | null
          observaciones?: string | null
          presupuesto?: number | null
          responsable?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      plan_emergencias: {
        Row: {
          area: string | null
          created_at: string
          created_by: string | null
          descripcion: string | null
          empresa_id: string
          estado: string
          fecha: string | null
          id: string
          nombre: string
          observaciones: string | null
          participantes: number | null
          recursos: string | null
          responsable: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          empresa_id: string
          estado?: string
          fecha?: string | null
          id?: string
          nombre: string
          observaciones?: string | null
          participantes?: number | null
          recursos?: string | null
          responsable?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          created_by?: string | null
          descripcion?: string | null
          empresa_id?: string
          estado?: string
          fecha?: string | null
          id?: string
          nombre?: string
          observaciones?: string | null
          participantes?: number | null
          recursos?: string | null
          responsable?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      plan_mejoramiento: {
        Row: {
          created_at: string
          created_by: string | null
          descripcion: string
          eficacia: string | null
          empresa_id: string
          estado: string
          fecha_cierre: string | null
          fecha_identificacion: string
          fecha_limite: string | null
          id: string
          observaciones: string | null
          origen_hallazgo: string
          responsable: string | null
          tipo_accion: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descripcion: string
          eficacia?: string | null
          empresa_id: string
          estado?: string
          fecha_cierre?: string | null
          fecha_identificacion?: string
          fecha_limite?: string | null
          id?: string
          observaciones?: string | null
          origen_hallazgo: string
          responsable?: string | null
          tipo_accion?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descripcion?: string
          eficacia?: string | null
          empresa_id?: string
          estado?: string
          fecha_cierre?: string | null
          fecha_identificacion?: string
          fecha_limite?: string | null
          id?: string
          observaciones?: string | null
          origen_hallazgo?: string
          responsable?: string | null
          tipo_accion?: string
          updated_at?: string
        }
        Relationships: []
      }
      planes: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          max_trabajadores: number
          max_usuarios: number
          modulos: Json
          nombre: string
          orden: number
          precio: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          max_trabajadores?: number
          max_usuarios?: number
          modulos?: Json
          nombre: string
          orden?: number
          precio?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          max_trabajadores?: number
          max_usuarios?: number
          modulos?: Json
          nombre?: string
          orden?: number
          precio?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          empresa: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          empresa?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          empresa?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trabajadores: {
        Row: {
          afp: string | null
          area: string | null
          arl: string | null
          cargo: string | null
          contacto_emergencia_nombre: string | null
          contacto_emergencia_telefono: string | null
          correo: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          documento: string
          empresa_id: string
          eps: string | null
          estado: string
          fecha_ingreso: string | null
          fecha_retiro: string | null
          id: string
          nivel_riesgo_cargo: string | null
          nombre: string
          observaciones: string | null
          sede: string | null
          telefono: string | null
          tipo_documento: string
          updated_at: string
        }
        Insert: {
          afp?: string | null
          area?: string | null
          arl?: string | null
          cargo?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          correo?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          documento: string
          empresa_id: string
          eps?: string | null
          estado?: string
          fecha_ingreso?: string | null
          fecha_retiro?: string | null
          id?: string
          nivel_riesgo_cargo?: string | null
          nombre: string
          observaciones?: string | null
          sede?: string | null
          telefono?: string | null
          tipo_documento?: string
          updated_at?: string
        }
        Update: {
          afp?: string | null
          area?: string | null
          arl?: string | null
          cargo?: string | null
          contacto_emergencia_nombre?: string | null
          contacto_emergencia_telefono?: string | null
          correo?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          documento?: string
          empresa_id?: string
          eps?: string | null
          estado?: string
          fecha_ingreso?: string | null
          fecha_retiro?: string | null
          id?: string
          nivel_riesgo_cargo?: string | null
          nombre?: string
          observaciones?: string | null
          sede?: string | null
          telefono?: string | null
          tipo_documento?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_empresa: { Args: { _user_id: string }; Returns: string }
      has_module_access: {
        Args: { _module: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "visualizador" | "participante" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "visualizador", "participante", "super_admin"],
    },
  },
} as const
