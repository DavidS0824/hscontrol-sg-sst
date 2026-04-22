
-- ============================================
-- TABLA PLANES
-- ============================================
CREATE TABLE IF NOT EXISTS public.planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  precio NUMERIC NOT NULL DEFAULT 0,
  descripcion TEXT,
  max_usuarios INTEGER NOT NULL DEFAULT 2,
  max_trabajadores INTEGER NOT NULL DEFAULT 25,
  modulos JSONB NOT NULL DEFAULT '[]'::jsonb,
  activo BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

-- TABLA EMPRESAS
CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nit TEXT,
  contacto_nombre TEXT,
  contacto_email TEXT,
  contacto_telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  plan_id UUID REFERENCES public.planes(id),
  estado TEXT NOT NULL DEFAULT 'activa',
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  notas TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- TABLA EMPRESA_USUARIOS
CREATE TABLE IF NOT EXISTS public.empresa_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.empresa_usuarios ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_empresa_usuarios_empresa ON public.empresa_usuarios(empresa_id);

-- FUNCIONES
CREATE OR REPLACE FUNCTION public.get_user_empresa(_user_id UUID)
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT empresa_id FROM public.empresa_usuarios WHERE user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'::app_role);
$$;

CREATE OR REPLACE FUNCTION public.has_module_access(_user_id UUID, _module TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_super_admin(_user_id) OR EXISTS (
    SELECT 1 FROM public.empresa_usuarios eu
    JOIN public.empresas e ON e.id = eu.empresa_id
    JOIN public.planes p ON p.id = e.plan_id
    WHERE eu.user_id = _user_id AND e.estado = 'activa' AND p.modulos ? _module
  );
$$;

-- RLS NUEVAS TABLAS
CREATE POLICY "Authenticated view planes" ON public.planes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin manage planes" ON public.planes FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admin manage empresas" ON public.empresas FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Users view own empresa" ON public.empresas FOR SELECT TO authenticated
  USING (id = public.get_user_empresa(auth.uid()));
CREATE POLICY "Admin update own empresa" ON public.empresas FOR UPDATE TO authenticated
  USING (id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admin manage empresa_usuarios" ON public.empresa_usuarios FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Users view own empresa_usuarios" ON public.empresa_usuarios FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()));
CREATE POLICY "Admin manage own empresa users" ON public.empresa_usuarios FOR ALL TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_planes_updated BEFORE UPDATE ON public.planes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_empresas_updated BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INSERTAR PLANES
INSERT INTO public.planes (nombre, precio, descripcion, max_usuarios, max_trabajadores, orden, modulos) VALUES
('Básico', 29900, 'Plan inicial para microempresas. Funcionalidades esenciales SG-SST.', 2, 25, 1,
  '["dashboard","trabajadores","matriz-riesgos","documentos","alertas","autoevaluacion","plan-mejoramiento"]'::jsonb),
('Estándar', 69900, 'Plan completo para PYMES. Incluye gestión operativa y seguimiento.', 5, 100, 2,
  '["dashboard","trabajadores","matriz-riesgos","documentos","alertas","autoevaluacion","plan-mejoramiento","capacitaciones","inspecciones","accidentes","examenes","plan-anual","reporte-aci","checklists"]'::jsonb),
('Premium', 149900, 'Plan profesional con IA. Todos los módulos sin límite.', 15, 999999, 3,
  '["dashboard","trabajadores","matriz-riesgos","documentos","alertas","autoevaluacion","plan-mejoramiento","capacitaciones","inspecciones","accidentes","examenes","plan-anual","reporte-aci","checklists","permisos-trabajo","plan-emergencias","asistente-ia","generador-documentos","examenes-medicos","analitica-ia"]'::jsonb)
ON CONFLICT (nombre) DO NOTHING;

-- AGREGAR empresa_id A TABLAS DE DATOS
ALTER TABLE public.trabajadores ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.matriz_riesgos ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.aci_reportes ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.capacitaciones ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.examenes_medicos ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.permisos_trabajo ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.plan_anual_trabajo ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.plan_emergencias ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.plan_mejoramiento ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.autoevaluacion_estandares ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.checklist_plantillas ADD COLUMN IF NOT EXISTS empresa_id UUID;
ALTER TABLE public.checklist_ejecuciones ADD COLUMN IF NOT EXISTS empresa_id UUID;

-- CREAR EMPRESA INICIAL Y MIGRAR DATOS
DO $$
DECLARE
  v_empresa_id UUID;
  v_premium_id UUID;
  v_user_id UUID;
BEGIN
  SELECT id INTO v_premium_id FROM public.planes WHERE nombre = 'Premium' LIMIT 1;
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drsolano3@gmail.com' LIMIT 1;

  INSERT INTO public.empresas (nombre, nit, contacto_email, plan_id, estado, fecha_vencimiento, created_by)
  VALUES ('HSControl Admin', '900000000-0', 'drsolano3@gmail.com', v_premium_id, 'activa', CURRENT_DATE + INTERVAL '10 years', v_user_id)
  RETURNING id INTO v_empresa_id;

  UPDATE public.trabajadores SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.matriz_riesgos SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.aci_reportes SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.capacitaciones SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.examenes_medicos SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.permisos_trabajo SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.plan_anual_trabajo SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.plan_emergencias SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.plan_mejoramiento SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.autoevaluacion_estandares SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.checklist_plantillas SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;
  UPDATE public.checklist_ejecuciones SET empresa_id = v_empresa_id WHERE empresa_id IS NULL;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.empresa_usuarios (user_id, empresa_id) VALUES (v_user_id, v_empresa_id) ON CONFLICT (user_id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin'::app_role) ON CONFLICT DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin'::app_role) ON CONFLICT DO NOTHING;
  END IF;

  INSERT INTO public.empresa_usuarios (user_id, empresa_id)
  SELECT u.id, v_empresa_id FROM auth.users u
  WHERE NOT EXISTS (SELECT 1 FROM public.empresa_usuarios eu WHERE eu.user_id = u.id);
END $$;

-- HACER empresa_id NOT NULL
ALTER TABLE public.trabajadores ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.matriz_riesgos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.aci_reportes ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.capacitaciones ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.examenes_medicos ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.permisos_trabajo ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.plan_anual_trabajo ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.plan_emergencias ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.plan_mejoramiento ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.autoevaluacion_estandares ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.checklist_plantillas ALTER COLUMN empresa_id SET NOT NULL;
ALTER TABLE public.checklist_ejecuciones ALTER COLUMN empresa_id SET NOT NULL;

-- ACTUALIZAR RLS DE TABLAS DE DATOS
DROP POLICY IF EXISTS "Admins manage trabajadores" ON public.trabajadores;
DROP POLICY IF EXISTS "Authenticated can view trabajadores" ON public.trabajadores;
CREATE POLICY "Empresa view trabajadores" ON public.trabajadores FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage trabajadores" ON public.trabajadores FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage matriz_riesgos" ON public.matriz_riesgos;
DROP POLICY IF EXISTS "Authenticated can view matriz_riesgos" ON public.matriz_riesgos;
CREATE POLICY "Empresa view matriz" ON public.matriz_riesgos FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage matriz" ON public.matriz_riesgos FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete aci" ON public.aci_reportes;
DROP POLICY IF EXISTS "Authenticated can view aci" ON public.aci_reportes;
DROP POLICY IF EXISTS "Users can create own aci" ON public.aci_reportes;
DROP POLICY IF EXISTS "Users update own aci or admin" ON public.aci_reportes;
CREATE POLICY "Empresa view aci" ON public.aci_reportes FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa create aci" ON public.aci_reportes FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa(auth.uid()) AND reportado_por = auth.uid());
CREATE POLICY "Empresa update aci" ON public.aci_reportes FOR UPDATE TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND (reportado_por = auth.uid() OR public.has_role(auth.uid(),'admin'::app_role))) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa delete aci" ON public.aci_reportes FOR DELETE TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage capacitaciones" ON public.capacitaciones;
DROP POLICY IF EXISTS "Authenticated can view capacitaciones" ON public.capacitaciones;
CREATE POLICY "Empresa view capacitaciones" ON public.capacitaciones FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage capacitaciones" ON public.capacitaciones FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage examenes" ON public.examenes_medicos;
CREATE POLICY "Empresa view examenes" ON public.examenes_medicos FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage examenes" ON public.examenes_medicos FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage permisos" ON public.permisos_trabajo;
DROP POLICY IF EXISTS "Authenticated can view permisos" ON public.permisos_trabajo;
CREATE POLICY "Empresa view permisos" ON public.permisos_trabajo FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage permisos" ON public.permisos_trabajo FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage pat" ON public.plan_anual_trabajo;
DROP POLICY IF EXISTS "Authenticated can view pat" ON public.plan_anual_trabajo;
CREATE POLICY "Empresa view pat" ON public.plan_anual_trabajo FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage pat" ON public.plan_anual_trabajo FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage emergencias" ON public.plan_emergencias;
DROP POLICY IF EXISTS "Authenticated view emergencias" ON public.plan_emergencias;
CREATE POLICY "Empresa view emergencias" ON public.plan_emergencias FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage emergencias" ON public.plan_emergencias FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage mejoramiento" ON public.plan_mejoramiento;
DROP POLICY IF EXISTS "Authenticated can view mejoramiento" ON public.plan_mejoramiento;
CREATE POLICY "Empresa view mejoramiento" ON public.plan_mejoramiento FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage mejoramiento" ON public.plan_mejoramiento FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage autoevaluacion" ON public.autoevaluacion_estandares;
DROP POLICY IF EXISTS "Authenticated can view autoevaluacion" ON public.autoevaluacion_estandares;
CREATE POLICY "Empresa view autoeval" ON public.autoevaluacion_estandares FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage autoeval" ON public.autoevaluacion_estandares FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage plantillas" ON public.checklist_plantillas;
DROP POLICY IF EXISTS "Authenticated view plantillas" ON public.checklist_plantillas;
CREATE POLICY "Empresa view plantillas" ON public.checklist_plantillas FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage plantillas" ON public.checklist_plantillas FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage ejecuciones" ON public.checklist_ejecuciones;
DROP POLICY IF EXISTS "Authenticated view ejecuciones" ON public.checklist_ejecuciones;
DROP POLICY IF EXISTS "Users create own ejecuciones" ON public.checklist_ejecuciones;
CREATE POLICY "Empresa view ejecuciones" ON public.checklist_ejecuciones FOR SELECT TO authenticated
  USING (empresa_id = public.get_user_empresa(auth.uid()) OR public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa create ejecuciones" ON public.checklist_ejecuciones FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_user_empresa(auth.uid()) AND ejecutado_por = auth.uid());
CREATE POLICY "Empresa admin manage ejecuciones" ON public.checklist_ejecuciones FOR ALL TO authenticated
  USING ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()))
  WITH CHECK ((empresa_id = public.get_user_empresa(auth.uid()) AND public.has_role(auth.uid(),'admin'::app_role)) OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admin manage all roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Empresa admin manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role) AND public.get_user_empresa(user_id) = public.get_user_empresa(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role) AND public.get_user_empresa(user_id) = public.get_user_empresa(auth.uid()) AND role <> 'super_admin'::app_role);
