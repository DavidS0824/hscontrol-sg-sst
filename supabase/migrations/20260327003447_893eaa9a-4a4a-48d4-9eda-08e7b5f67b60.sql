
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'visualizador', 'participante');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  empresa TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Capacitaciones tables
CREATE TABLE public.capacitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tema TEXT NOT NULL,
  descripcion TEXT,
  instructor TEXT NOT NULL,
  fecha DATE NOT NULL,
  duracion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'Programada',
  codigo_acceso TEXT UNIQUE,
  max_participantes INT DEFAULT 50,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.capacitaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view capacitaciones" ON public.capacitaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage capacitaciones" ON public.capacitaciones
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Asistencia
CREATE TABLE public.asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitacion_id UUID REFERENCES public.capacitaciones(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asistio BOOLEAN DEFAULT false,
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (capacitacion_id, user_id)
);

ALTER TABLE public.asistencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view asistencia" ON public.asistencia
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage asistencia" ON public.asistencia
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can register own asistencia" ON public.asistencia
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Evaluaciones
CREATE TABLE public.evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitacion_id UUID REFERENCES public.capacitaciones(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  puntaje NUMERIC(5,2),
  aprobado BOOLEAN DEFAULT false,
  fecha_evaluacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (capacitacion_id, user_id)
);

ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view evaluaciones" ON public.evaluaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage evaluaciones" ON public.evaluaciones
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Materiales
CREATE TABLE public.materiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitacion_id UUID REFERENCES public.capacitaciones(id) ON DELETE CASCADE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  url TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.materiales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view materiales" ON public.materiales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage materiales" ON public.materiales
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Certificados
CREATE TABLE public.certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitacion_id UUID REFERENCES public.capacitaciones(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  codigo_certificado TEXT UNIQUE NOT NULL DEFAULT 'CERT-' || substr(gen_random_uuid()::text, 1, 8),
  fecha_emision TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (capacitacion_id, user_id)
);

ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view certificados" ON public.certificados
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage certificados" ON public.certificados
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_capacitaciones_updated_at
  BEFORE UPDATE ON public.capacitaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
