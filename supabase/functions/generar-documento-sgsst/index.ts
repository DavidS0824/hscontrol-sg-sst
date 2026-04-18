const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PROMPTS: Record<string, string> = {
  politica: `Genera una POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO conforme al artículo 2.2.4.6.5 del Decreto 1072 de 2015 para una empresa colombiana. Debe incluir: compromiso de la alta dirección, alcance, identificación de peligros y control de riesgos, cumplimiento normativo, mejora continua, y participación de los trabajadores. Estructurada en secciones numeradas, lista para firmar por el representante legal.`,
  reglamento: `Genera un REGLAMENTO DE HIGIENE Y SEGURIDAD INDUSTRIAL conforme a la Resolución 2400 de 1979 y el Decreto 1072 de 2015 para una empresa colombiana. Debe incluir: identificación de la empresa, ARL, clase de riesgo, obligaciones del empleador y trabajadores, prohibiciones, sanciones, comité paritario, y vigencia.`,
  acta_copasst: `Genera un ACTA DE CONFORMACIÓN DEL COPASST (o Vigía de SST si la empresa tiene menos de 10 trabajadores) conforme a la Resolución 2013 de 1986 y el Decreto 1072 de 2015. Incluye: lugar y fecha, asistentes, proceso de elección democrático, integrantes principales y suplentes (representantes del empleador y trabajadores), funciones, periodo (2 años) y firmas.`,
  procedimiento: `Genera un PROCEDIMIENTO OPERATIVO ESTÁNDAR de SST conforme al Decreto 1072 de 2015. Estructura: 1. Objetivo, 2. Alcance, 3. Definiciones, 4. Responsabilidades, 5. Equipos y EPP requeridos, 6. Desarrollo paso a paso, 7. Identificación de peligros y controles, 8. Acciones en caso de emergencia, 9. Registros, 10. Referencias normativas.`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { tipo, datos } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");
    const basePrompt = PROMPTS[tipo];
    if (!basePrompt) return new Response(JSON.stringify({ error: "Tipo de documento no válido" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const userPrompt = `${basePrompt}

DATOS DE LA EMPRESA Y DEL DOCUMENTO:
${JSON.stringify(datos, null, 2)}

INSTRUCCIONES DE FORMATO:
- Devuelve SOLO HTML semántico válido (sin <!DOCTYPE>, sin <html>, sin <body>).
- Usa <h1> para el título, <h2> para secciones, <h3> para subsecciones, <p> para párrafos, <ul>/<ol> para listas.
- No uses estilos inline ni clases CSS.
- Incluye al final un bloque de firma con líneas para nombre, cargo y fecha.
- El contenido debe ser profesional, formal y legalmente coherente con la normativa colombiana.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Eres un experto redactor de documentos legales de SG-SST en Colombia." },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error generando documento" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let html = data.choices?.[0]?.message?.content ?? "";
    // Limpiar fences markdown si vienen
    html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    return new Response(JSON.stringify({ html }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generar-documento error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
