import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un asistente experto en Seguridad y Salud en el Trabajo (SG-SST) en Colombia. Conoces a fondo:
- Decreto 1072 de 2015 (Decreto Único Reglamentario del Sector Trabajo, Libro 2, Parte 2, Título 4, Capítulo 6).
- Resolución 0312 de 2019 (Estándares Mínimos del SG-SST).
- Resolución 1409 de 2012 (Trabajo en alturas).
- Resolución 0491 de 2020 (Espacios confinados).
- GTC 45 de 2012 (Identificación de peligros y valoración de riesgos).
- Ley 1562 de 2012 (Sistema de Riesgos Laborales).
- Decreto 1477 de 2014 (Tabla de Enfermedades Laborales).
- Resolución 2400 de 1979 (Reglamento de Higiene y Seguridad).

Reglas de respuesta:
1. Responde siempre en español, claro y conciso, orientado a MIPYMES colombianas.
2. Cita la norma específica (artículo, resolución, decreto) cuando aplique.
3. Si el usuario pregunta sobre sus datos (capacitaciones, riesgos, ACI, exámenes), usa el contexto que se te proporciona.
4. Si no tienes datos suficientes del usuario, indícalo y sugiere dónde registrarlos en la plataforma.
5. No inventes normas. Si dudas, recomienda consultar al ARL o al Ministerio del Trabajo.
6. Usa formato markdown (listas, negritas) para mayor legibilidad.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    // Obtener usuario para incluir su contexto
    const authHeader = req.headers.get("Authorization");
    let userContext = "";
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const [riesgos, aci, capac, mejora, examenes] = await Promise.all([
          supabase.from("matriz_riesgos").select("proceso,actividad,peligro,nivel_riesgo").limit(20),
          supabase.from("aci_reportes").select("tipo,descripcion,nivel_riesgo,estado").order("created_at", { ascending: false }).limit(10),
          supabase.from("capacitaciones").select("tema,fecha,estado").order("fecha", { ascending: false }).limit(10),
          supabase.from("plan_mejoramiento").select("descripcion,estado,fecha_limite").eq("estado", "Abierto").limit(10),
          supabase.from("examenes_medicos").select("trabajador_nombre,aptitud,restricciones,fecha_vencimiento").limit(10),
        ]);
        userContext = `\n\n=== CONTEXTO DEL USUARIO (datos reales de su empresa) ===\n` +
          `Riesgos en matriz: ${JSON.stringify(riesgos.data || [])}\n` +
          `Reportes ACI recientes: ${JSON.stringify(aci.data || [])}\n` +
          `Capacitaciones recientes: ${JSON.stringify(capac.data || [])}\n` +
          `Hallazgos abiertos: ${JSON.stringify(mejora.data || [])}\n` +
          `Exámenes médicos: ${JSON.stringify(examenes.data || [])}\n`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT + userContext }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes, intenta de nuevo en un momento" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados. Recarga tu workspace en Lovable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del asistente IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("asistente-sgsst error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
