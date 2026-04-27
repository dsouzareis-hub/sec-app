import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  // 🔐 CORS (OBRIGATÓRIO)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // 🔴 preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 🔐 CLIENT CORRETO (backend)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const windowMinutes = 5;
    const maxAttempts = 5;

    const timeWindow = new Date(
      Date.now() - windowMinutes * 60 * 1000
    ).toISOString();

    const { count } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true })
      .or(`email.eq.${email},ip.eq.${ip}`)
      .eq("action", "LOGIN_ATTEMPT")
      .gte("created_at", timeWindow);

    if (count && count >= maxAttempts) {
      await supabase.from("logs").insert([
        { email, ip, action: "LOGIN_BLOCKED" },
      ]);

      return new Response(
        JSON.stringify({ error: "Too many attempts" }),
        { status: 429, headers: corsHeaders }
      );
    }

    await supabase.from("logs").insert([
      { email, ip, action: "LOGIN_ATTEMPT" },
    ]);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});