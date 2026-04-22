
-- Trigger function: si empresa_id es NULL en INSERT, lo rellena con la empresa del usuario
CREATE OR REPLACE FUNCTION public.set_empresa_id_from_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.empresa_id IS NULL THEN
    NEW.empresa_id := public.get_user_empresa(auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar a todas las tablas operativas
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'trabajadores','matriz_riesgos','aci_reportes','capacitaciones','examenes_medicos',
    'permisos_trabajo','plan_anual_trabajo','plan_emergencias','plan_mejoramiento',
    'autoevaluacion_estandares','checklist_plantillas','checklist_ejecuciones'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_empresa_id ON public.%I', tbl);
    EXECUTE format('CREATE TRIGGER trg_set_empresa_id BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_empresa_id_from_user()', tbl);
  END LOOP;
END $$;

-- Permitir empresa_id NULL en INSERT (el trigger lo rellena antes del check NOT NULL)
-- En realidad NOT NULL se aplica al final, así que el trigger BEFORE INSERT funciona.
-- Pero para que el cliente pueda omitir el campo, lo dejamos NOT NULL pero el trigger lo asigna.
