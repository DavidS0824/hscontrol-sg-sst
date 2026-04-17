
DROP POLICY IF EXISTS "Users insert respuestas" ON public.checklist_respuestas;
CREATE POLICY "Users insert respuestas own ejecucion"
  ON public.checklist_respuestas FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.checklist_ejecuciones e
      WHERE e.id = ejecucion_id
        AND (e.ejecutado_por = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Restringir lectura del bucket: solo archivos referenciados desde un reporte ACI existente
DROP POLICY IF EXISTS "Public read aci-evidencias" ON storage.objects;
CREATE POLICY "Read aci-evidencias referenced"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'aci-evidencias'
    AND EXISTS (
      SELECT 1 FROM public.aci_reportes r
      WHERE r.foto_url LIKE '%' || name
    )
  );
