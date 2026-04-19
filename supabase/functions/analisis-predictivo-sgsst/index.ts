import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const { contexto = "global", datosExtra } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    const fechaCorte = seisMesesAtras.toISOString();

    const [accidentesRes, aciRes, riesgosRes, examenesRes, mejoraRes, trabajadoresRes] = await Promise.all([
      supabase.from("accidentes" as any).select("*").gte("created_at", fechaCorte).limit(200),
      supabase.from("aci_reportes").select("tipo,area,nivel_riesgo,estado,fecha_reporte,descripcion").gte("fecha_reporte", fechaCorte).limit(200),
      supabase.from("matriz_riesgos").select("proceso,area,peligro,nivel_riesgo,tipo_peligro").limit(100),
      supabase.from("examenes_medicos").select("aptitud,restricciones,area,cargo,fecha_vencimiento").limit(100),
      supabase.from("plan_mejoramiento").select("descripcion,estado,tipo_accion,fecha_limite").limit(50),
      supabase.from("trabajadores").select("area,cargo,nivel_riesgo_cargo,estado").limit(200),
    ]);

    const resumen = {
      total_aci: aciRes.data?.length ?? 0,
      aci_alto: aciRes.data?.filter((a: any) => a.nivel_riesgo === "Alto").length ?? 0,
      aci_por_area: contar(aciRes.data ?? [], "area"),
      aci_por_tipo: contar(aciRes.data ?? [], "tipo"),
      riesgos_altos: riesgosRes.data?.filter((r: any) => r.nivel_riesgo === "Alto" || r.nivel_riesgo === "Crítico").length ?? 0,
      riesgos_por_area: contar(riesgosRes.data ?? [], "area"),
      examenes_no_aptos: examenesRes.data?.filter((e: any) => e.aptitud !== "Apto").length ?? 0,
      examenes_vencidos: examenesRes.data?.filter((e: any) => e.fecha_vencimiento && new Date(e.fecha_vencimiento) < new Date()).length ?? 0,
      acciones_abiertas: mejoraRes.data?.filter((m: any) => m.estado === "Abierto").length ?? 0,
      trabajadores_activos: trabajadoresRes.data?.filter((t: any) => t.estado === "Activo").length ?? 0,
      trabajadores_por_area: contar(trabajadoresRes.data ?? [], "area"),
    };

    const sistema = `Eres un analista experto en SG-SST en Colombia. Analiza los datos reales de la empresa que se te entregan en JSON y entrega:

1. **Resumen ejecutivo** (2-3 frases sobre el estado general).
2. **Top 3 áreas críticas** con justificación basada en los datos (ACI, riesgos altos, exámenes no aptos).
3. **Predicción de probabilidad de accidente** por área (Alta / Media / Baja) con razonamiento breve.
4. **Tendencias detectadas** (tipos de actos/condiciones inseguras más frecuentes, patrones).
5. **Recomendaciones priorizadas** (5 acciones concretas, ordenadas por impacto, citando la norma colombiana cuando aplique: Decreto 1072, Res. 0312, GTC 45).

Sé directo, breve y orientado a MIPYMES. Usa **markdown** (encabezados, listas, negritas).
${contexto !== "global" ? `\nEnfoca el análisis en el contexto: **${contexto}**.` : ""}`;

    const userPayload = {
      resumen_calculado: resumen,
      muestra_aci: (aciRes.data ?? []).slice(0, 30),
      muestra_riesgos: (riesgosRes.data ?? []).slice(0, 30),
      muestra_examenes: (examenesRes.data ?? []).slice(0, 20),
      datos_extra: datosExtra ?? null,
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sistema },
          { role: "user", content: `Datos reales de la empresa (JSON):\n\n${JSON.stringify(userPayload, null, 2)}` },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Límite de uso de IA alcanzado, intenta más tarde." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA agotados. Recárgalos en Configuración." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`Gateway IA: ${txt}`);
    }

    const aiJson = await aiRes.json();
    const analisis = aiJson.choices?.[0]?.message?.content ?? "Sin análisis.";

    return new Response(JSON.stringify({ analisis, resumen }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analisis-predictivo error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function contar(arr: any[], key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const v = item?.[key] ?? "Sin definir";
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}
