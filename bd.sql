-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clientes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  telefono text,
  estado_pago text,
  fecha_inicio date NOT NULL,
  plan text DEFAULT 'Mensualidad'::text,
  fecha_vencimiento date,
  correo text,
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.configuracion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_negocio text DEFAULT 'Mi Negocio'::text,
  moneda text DEFAULT 'MXN'::text,
  correo_contacto text,
  correo_bienvenida_activo boolean DEFAULT false,
  correo_vencimiento_activo boolean DEFAULT false,
  citas_publicas_activo boolean DEFAULT false,
  servicios_citas ARRAY DEFAULT ARRAY['Corte'::text, 'Peinado'::text, 'Tinte'::text, 'Tratamiento'::text],
  CONSTRAINT configuracion_pkey PRIMARY KEY (id)
);
CREATE TABLE public.planes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  precio numeric DEFAULT 0,
  duracion_dias integer DEFAULT 30,
  activo boolean DEFAULT true,
  CONSTRAINT planes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pagos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente_id bigint,
  fecha_pago date NOT NULL,
  monto numeric NOT NULL,
  plan text NOT NULL,
  metodo_pago text DEFAULT 'Efectivo'::text,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pagos_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.gda_clientes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_negocio text NOT NULL,
  contacto_nombre text,
  contacto_telefono text,
  contacto_correo text,
  plan text NOT NULL,
  monto_mensual numeric NOT NULL,
  estado text DEFAULT 'Activo'::text,
  fecha_inicio date NOT NULL,
  fecha_vencimiento date,
  stripe_customer_id text,
  stripe_subscription_id text,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gda_clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gda_pagos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente_id bigint,
  fecha_pago date NOT NULL,
  monto numeric NOT NULL,
  metodo text DEFAULT 'Stripe'::text,
  stripe_payment_id text,
  notas text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gda_pagos_pkey PRIMARY KEY (id),
  CONSTRAINT gda_pagos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.gda_clientes(id)
);
CREATE TABLE public.citas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_cliente text NOT NULL,
  telefono text,
  correo text,
  servicio text,
  fecha date NOT NULL,
  hora time without time zone NOT NULL,
  duracion_minutos integer DEFAULT 60,
  estado text DEFAULT 'Pendiente'::text,
  notas text,
  origen text DEFAULT 'interno'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT citas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gl_planes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  precio numeric DEFAULT 0,
  limite_leads integer DEFAULT 50,
  limite_usuarios integer DEFAULT 1,
  modulo_landing boolean DEFAULT true,
  modulo_citas boolean DEFAULT false,
  modulo_cotizador boolean DEFAULT false,
  CONSTRAINT gl_planes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gl_empresas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre_negocio text NOT NULL,
  plan_id bigint,
  estado text DEFAULT 'Activo'::text,
  stripe_customer_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gl_empresas_pkey PRIMARY KEY (id),
  CONSTRAINT gl_empresas_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.gl_planes(id)
);
CREATE TABLE public.gl_usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  nombre text NOT NULL,
  correo text NOT NULL UNIQUE,
  rol text DEFAULT 'admin'::text,
  auth_id uuid,
  CONSTRAINT gl_usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT gl_usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.gl_empresas(id)
);
CREATE TABLE public.gl_leads (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  nombre text NOT NULL,
  telefono text,
  correo text,
  origen text,
  estado text DEFAULT 'Nuevo'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT gl_leads_pkey PRIMARY KEY (id),
  CONSTRAINT gl_leads_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.gl_empresas(id)
);
CREATE TABLE public.gl_citas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  lead_id bigint,
  titulo text NOT NULL,
  fecha_hora timestamp with time zone NOT NULL,
  estado text DEFAULT 'Pendiente'::text,
  notas text,
  CONSTRAINT gl_citas_pkey PRIMARY KEY (id),
  CONSTRAINT gl_citas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.gl_empresas(id),
  CONSTRAINT gl_citas_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.gl_leads(id)
);
CREATE TABLE public.gl_analytics_events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  empresa_id bigint NOT NULL,
  event_type text NOT NULL,
  path text,
  source text,
  country_code text,
  visitor_id text,
  created_at timestamp with time zone DEFAULT now(),
  landing_id uuid,
  CONSTRAINT gl_analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT gl_analytics_events_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.gl_empresas(id),
  CONSTRAINT gl_analytics_events_landing_id_fkey FOREIGN KEY (landing_id) REFERENCES public.gl_landings(id)
);
CREATE TABLE public.gl_landings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id bigint NOT NULL,
  template_key text NOT NULL CHECK (template_key = ANY (ARRAY['bold-red'::text, 'clean-white'::text, 'dark-purple'::text, 'orange-industrial'::text, 'warm-wood'::text])),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text AND (slug <> ALL (ARRAY['admin'::text, 'app'::text, 'www'::text]))),
  custom_domain text CHECK (custom_domain IS NULL OR btrim(custom_domain) <> ''::text AND custom_domain !~* '(^|\.)gamalink\.online$'::text AND custom_domain !~* '(^|\.)localhost$'::text AND custom_domain !~* '(^|\.)vercel\.app$'::text),
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object'::text AND
CASE
    WHEN jsonb_typeof(content -> 'imagenes'::text) = 'array'::text THEN jsonb_array_length(content -> 'imagenes'::text) <= 5
    ELSE false
END),
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT gl_landings_pkey PRIMARY KEY (id),
  CONSTRAINT gl_landings_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.gl_empresas(id)
);