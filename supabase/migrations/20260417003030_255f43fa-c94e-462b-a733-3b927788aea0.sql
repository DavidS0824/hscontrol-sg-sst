
-- ============ MATRIZ DE PELIGROS Y RIESGOS (GTC 45 simplificada) ============
CREATE TABLE public.matriz_riesgos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proceso TEXT NOT NULL,
  actividad TEXT NOT NULL,
  area TEXT,
  peligro TEXT NOT NULL,
  tipo_peligro TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL DEFAULT 'Medio',
  controles_existentes TEXT,
  controles_propuestos TEXT,
  responsable TEXT,
  fecha_revision DATE,
  estado TEXT NOT NULL DEFAULT 'Activo',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.matriz_riesgos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view matriz_riesgos" ON public.matriz_riesgos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage matriz_riesgos" ON public.matriz_riesgos FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_matriz_riesgos_updated BEFORE UPDATE ON public.matriz_riesgos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PLAN ANUAL DE TRABAJO (PAT) ============
CREATE TABLE public.plan_anual_trabajo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anio INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  actividad TEXT NOT NULL,
  objetivo TEXT,
  responsable TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto NUMERIC(14,2) DEFAULT 0,
  avance INTEGER NOT NULL DEFAULT 0 CHECK (avance >= 0 AND avance <= 100),
  estado TEXT NOT NULL DEFAULT 'Programada',
  evidencias TEXT,
  observaciones TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_anual_trabajo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view pat" ON public.plan_anual_trabajo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage pat" ON public.plan_anual_trabajo FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pat_updated BEFORE UPDATE ON public.plan_anual_trabajo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ AUTOEVALUACIÓN ESTÁNDARES MÍNIMOS (Res. 0312) ============
CREATE TABLE public.autoevaluacion_estandares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anio_evaluacion INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now())::INTEGER,
  numero_estandar TEXT NOT NULL,
  ciclo TEXT NOT NULL,
  estandar TEXT NOT NULL,
  criterio TEXT,
  calificacion_obtenida NUMERIC(5,2) NOT NULL DEFAULT 0,
  calificacion_maxima NUMERIC(5,2) NOT NULL DEFAULT 0,
  justificacion TEXT,
  evidencia TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.autoevaluacion_estandares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view autoevaluacion" ON public.autoevaluacion_estandares FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage autoevaluacion" ON public.autoevaluacion_estandares FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_autoeval_updated BEFORE UPDATE ON public.autoevaluacion_estandares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PLAN DE MEJORAMIENTO ============
CREATE TABLE public.plan_mejoramiento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origen_hallazgo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo_accion TEXT NOT NULL DEFAULT 'Correctiva',
  responsable TEXT,
  fecha_identificacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite DATE,
  fecha_cierre DATE,
  estado TEXT NOT NULL DEFAULT 'Abierto',
  eficacia TEXT,
  observaciones TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_mejoramiento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view mejoramiento" ON public.plan_mejoramiento FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage mejoramiento" ON public.plan_mejoramiento FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_mejoramiento_updated BEFORE UPDATE ON public.plan_mejoramiento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
