import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "No autenticado" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE);
    const { data: superRow } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "super_admin").maybeSingle();
    if (!superRow) return json({ error: "Solo super_admin" }, 403);

    const body = await req.json();
    const { action } = body;

    if (action === "create") {
      const { email, password, full_name, empresa_id, roles } = body;
      if (!email || !password || !empresa_id) return json({ error: "Faltan datos" }, 400);

      // Validar límite del plan
      const { data: emp } = await admin.from("empresas").select("plan_id, planes(max_usuarios, nombre)").eq("id", empresa_id).single();
      const maxUsuarios = (emp as any)?.planes?.max_usuarios ?? 0;
      const { count } = await admin.from("empresa_usuarios").select("*", { count: "exact", head: true }).eq("empresa_id", empresa_id);
      if ((count ?? 0) >= maxUsuarios) {
        return json({ error: `Plan ${(emp as any)?.planes?.nombre} permite máximo ${maxUsuarios} usuarios. Actualiza el plan para añadir más.` }, 400);
      }

      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (cErr || !created.user) return json({ error: cErr?.message || "Error creando usuario" }, 400);
      const newUserId = created.user.id;

      await admin.from("profiles").upsert({ user_id: newUserId, full_name }, { onConflict: "user_id" });
      await admin.from("empresa_usuarios").insert({ user_id: newUserId, empresa_id });
      const rolesToAdd = (Array.isArray(roles) && roles.length > 0) ? roles : ["visualizador"];
      await admin.from("user_roles").insert(rolesToAdd.map((r: string) => ({ user_id: newUserId, role: r })));

      return json({ ok: true, user_id: newUserId });
    }

    if (action === "delete") {
      const { user_id } = body;
      if (!user_id) return json({ error: "Falta user_id" }, 400);
      await admin.from("user_roles").delete().eq("user_id", user_id);
      await admin.from("empresa_usuarios").delete().eq("user_id", user_id);
      await admin.from("profiles").delete().eq("user_id", user_id);
      const { error: dErr } = await admin.auth.admin.deleteUser(user_id);
      if (dErr) return json({ error: dErr.message }, 400);
      return json({ ok: true });
    }

    if (action === "update") {
      const { user_id, full_name, password, email } = body;
      if (!user_id) return json({ error: "Falta user_id" }, 400);
      if (full_name !== undefined) {
        await admin.from("profiles").update({ full_name }).eq("user_id", user_id);
      }
      const updates: any = {};
      if (password) updates.password = password;
      if (email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        const { error } = await admin.auth.admin.updateUserById(user_id, updates);
        if (error) return json({ error: error.message }, 400);
      }
      return json({ ok: true });
    }

    return json({ error: "Acción desconocida" }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}