
-- Tabla de exámenes médicos ocupacionales
CREATE TABLE public.examenes_medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trabajador_nombre TEXT NOT NULL,
  trabajador_documento TEXT,
  cargo TEXT,
  area TEXT,
  tipo_examen TEXT NOT NULL DEFAULT 'Periódico',
  aptitud TEXT NOT NULL DEFAULT 'Apto',
  restricciones TEXT,
  recomendaciones TEXT,
  medico_evaluador TEXT,
  ips TEXT,
  fecha_examen DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  archivo_url TEXT,
  datos_extraidos JSONB,
  observaciones TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.examenes_medicos ENABLE ROW LEVEL SECURITY;

-- Solo admins (datos sensibles de salud)
CREATE POLICY "Admins manage examenes"
  ON public.examenes_medicos FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_examenes_medicos_updated_at
  BEFORE UPDATE ON public.examenes_medicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket privado para PDFs de exámenes
INSERT INTO storage.buckets (id, name, public) VALUES ('examenes-medicos', 'examenes-medicos', false)
ON CONFLICT (id) DO NOTHING;

-- Solo admins acceden a los archivos
CREATE POLICY "Admins can read examenes files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'examenes-medicos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload examenes files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'examenes-medicos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update examenes files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'examenes-medicos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete examenes files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'examenes-medicos' AND has_role(auth.uid(), 'admin'::app_role));
