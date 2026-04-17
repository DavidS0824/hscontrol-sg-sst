
-- ACI: Reportes de actos y condiciones inseguras
CREATE TABLE public.aci_reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'Acto inseguro',
  area TEXT,
  ubicacion TEXT,
  descripcion TEXT NOT NULL,
  nivel_riesgo TEXT NOT NULL DEFAULT 'Medio',
  foto_url TEXT,
  estado TEXT NOT NULL DEFAULT 'Reportado',
  acciones_tomadas TEXT,
  reportado_por UUID,
  reportado_por_nombre TEXT,
  fecha_reporte TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_cierre TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aci_reportes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view aci" ON public.aci_reportes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own aci" ON public.aci_reportes FOR INSERT TO authenticated WITH CHECK (reportado_por = auth.uid());
CREATE POLICY "Users update own aci or admin" ON public.aci_reportes FOR UPDATE TO authenticated USING (reportado_por = auth.uid() OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete aci" ON public.aci_reportes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_aci_updated BEFORE UPDATE ON public.aci_reportes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Permisos de trabajo de alto riesgo
CREATE TABLE public.permisos_trabajo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  descripcion_tarea TEXT NOT NULL,
  area TEXT,
  responsable TEXT NOT NULL,
  ejecutores TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  controles_requeridos TEXT,
  epp_requerido TEXT,
  riesgos_identificados TEXT,
  aprobado_por TEXT,
  fecha_aprobacion TIMESTAMPTZ,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permisos_trabajo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view permisos" ON public.permisos_trabajo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage permisos" ON public.permisos_trabajo FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_permisos_updated BEFORE UPDATE ON public.permisos_trabajo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Checklist: plantillas e items
CREATE TABLE public.checklist_plantillas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'General',
  descripcion TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_plantillas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view plantillas" ON public.checklist_plantillas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage plantillas" ON public.checklist_plantillas FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_plantillas_updated BEFORE UPDATE ON public.checklist_plantillas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plantilla_id UUID NOT NULL REFERENCES public.checklist_plantillas(id) ON DELETE CASCADE,
  orden INTEGER NOT NULL DEFAULT 0,
  pregunta TEXT NOT NULL,
  obligatorio BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view items" ON public.checklist_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage items" ON public.checklist_items FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE INDEX idx_checklist_items_plantilla ON public.checklist_items(plantilla_id, orden);

-- Checklist: ejecuciones y respuestas
CREATE TABLE public.checklist_ejecuciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plantilla_id UUID NOT NULL REFERENCES public.checklist_plantillas(id) ON DELETE RESTRICT,
  ejecutado_por UUID,
  ejecutado_por_nombre TEXT,
  area TEXT,
  ubicacion TEXT,
  fecha_ejecucion TIMESTAMPTZ NOT NULL DEFAULT now(),
  porcentaje_cumplimiento NUMERIC NOT NULL DEFAULT 0,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'Completado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_ejecuciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view ejecuciones" ON public.checklist_ejecuciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create own ejecuciones" ON public.checklist_ejecuciones FOR INSERT TO authenticated WITH CHECK (ejecutado_por = auth.uid());
CREATE POLICY "Admins manage ejecuciones" ON public.checklist_ejecuciones FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TABLE public.checklist_respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ejecucion_id UUID NOT NULL REFERENCES public.checklist_ejecuciones(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.checklist_items(id) ON DELETE CASCADE,
  respuesta TEXT NOT NULL DEFAULT 'cumple',
  observacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.checklist_respuestas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view respuestas" ON public.checklist_respuestas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert respuestas" ON public.checklist_respuestas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage respuestas" ON public.checklist_respuestas FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE INDEX idx_respuestas_ejecucion ON public.checklist_respuestas(ejecucion_id);

-- Plan de Emergencias
CREATE TABLE public.plan_emergencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  responsable TEXT,
  area TEXT,
  fecha DATE,
  participantes INTEGER DEFAULT 0,
  recursos TEXT,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'Programado',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_emergencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view emergencias" ON public.plan_emergencias FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage emergencias" ON public.plan_emergencias FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_emergencias_updated BEFORE UPDATE ON public.plan_emergencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para fotos ACI
INSERT INTO storage.buckets (id, name, public) VALUES ('aci-evidencias', 'aci-evidencias', true);

CREATE POLICY "Public read aci-evidencias" ON storage.objects FOR SELECT USING (bucket_id = 'aci-evidencias');
CREATE POLICY "Auth upload aci-evidencias" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'aci-evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own aci photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'aci-evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own aci photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'aci-evidencias' AND auth.uid()::text = (storage.foldername(name))[1]);
