import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        db: {
          schema: "public",
        },
      }
    );

    const body = await req.json().catch(() => ({}));
    const email = body.email ?? "unknown";

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const windowMinutes = 5;
    const maxAttempts = 5;

    const timeWindow = new Date(
      Date.now() - windowMinutes * 60 * 1000
    ).toISOString();

    const { count, error: countError } = await supabase
      .from("logs")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .eq("action", "LOGIN_ATTEMPT")
      .gte("created_at", timeWindow);

    if (countError) {
      console.log(countError);
    }

    if ((count ?? 0) >= maxAttempts) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});