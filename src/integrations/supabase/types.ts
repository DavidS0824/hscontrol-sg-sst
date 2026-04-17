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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "visualizador" | "participante"
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
      app_role: ["admin", "visualizador", "participante"],
    },
  },
} as const
