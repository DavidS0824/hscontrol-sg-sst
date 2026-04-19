CREATE TABLE public.trabajadores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  documento TEXT NOT NULL UNIQUE,
  tipo_documento TEXT NOT NULL DEFAULT 'CC',
  nombre TEXT NOT NULL,
  cargo TEXT,
  area TEXT,
  sede TEXT,
  fecha_ingreso DATE,
  fecha_retiro DATE,
  estado TEXT NOT NULL DEFAULT 'Activo',
  eps TEXT,
  arl TEXT,
  afp TEXT,
  telefono TEXT,
  correo TEXT,
  direccion TEXT,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  nivel_riesgo_cargo TEXT DEFAULT 'I',
  observaciones TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_trabajadores_documento ON public.trabajadores(documento);
CREATE INDEX idx_trabajadores_estado ON public.trabajadores(estado);
CREATE INDEX idx_trabajadores_area ON public.trabajadores(area);

ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view trabajadores"
ON public.trabajadores FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage trabajadores"
ON public.trabajadores FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_trabajadores_updated_at
BEFORE UPDATE ON public.trabajadores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();