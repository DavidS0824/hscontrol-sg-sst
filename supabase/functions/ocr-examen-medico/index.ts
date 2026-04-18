const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");
    if (!imageBase64) return new Response(JSON.stringify({ error: "Falta la imagen" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "Eres un experto en lectura de exámenes médicos ocupacionales colombianos. Extrae los datos clave del documento usando la herramienta proporcionada. Si un campo no aparece, devuélvelo como string vacío. Las fechas deben estar en formato YYYY-MM-DD.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extrae los datos de este examen médico ocupacional." },
              { type: "image_url", image_url: { url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}` } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "registrar_examen_medico",
            description: "Registra los datos extraídos de un examen médico ocupacional",
            parameters: {
              type: "object",
              properties: {
                trabajador_nombre: { type: "string", description: "Nombre completo del trabajador" },
                trabajador_documento: { type: "string", description: "Número de documento de identidad" },
                cargo: { type: "string", description: "Cargo u ocupación" },
                tipo_examen: { type: "string", enum: ["Ingreso", "Periódico", "Egreso", "Post-incapacidad", "Reintegro"], description: "Tipo de examen médico" },
                aptitud: { type: "string", enum: ["Apto", "Apto con restricciones", "No apto", "Aplazado"], description: "Concepto de aptitud médica" },
                restricciones: { type: "string", description: "Restricciones médicas si las hay" },
                recomendaciones: { type: "string", description: "Recomendaciones médicas" },
                medico_evaluador: { type: "string", description: "Nombre y registro del médico" },
                ips: { type: "string", description: "IPS o entidad que practicó el examen" },
                fecha_examen: { type: "string", description: "Fecha del examen YYYY-MM-DD" },
                fecha_vencimiento: { type: "string", description: "Fecha de vencimiento o próximo examen YYYY-MM-DD" },
              },
              required: ["trabajador_nombre", "tipo_examen", "aptitud", "fecha_examen"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "registrar_examen_medico" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Demasiadas solicitudes" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error procesando examen" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return new Response(JSON.stringify({ error: "No se pudieron extraer datos del examen" }), { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const extracted = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ data: extracted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ocr-examen-medico error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
