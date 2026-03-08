import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileUrl, guideId } = await req.json();

    if (!fileUrl || !guideId) {
      return new Response(JSON.stringify({ error: "fileUrl and guideId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if guide is free
    const { data: guide } = await supabase
      .from("guides")
      .select("is_premium")
      .eq("id", guideId)
      .maybeSingle();

    if (!guide) {
      return new Response(JSON.stringify({ error: "Guide not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (guide.is_premium) {
      // Check admin
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      const isAdmin = !!role;

      if (!isAdmin) {
        // Check active subscription
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_type, subscription_expires_at")
          .eq("user_id", user.id)
          .maybeSingle();

        const hasSubscription = profile?.subscription_type &&
          ['monthly', 'yearly', 'lifetime', 'vip'].includes(profile.subscription_type) &&
          (
            profile.subscription_type === 'lifetime' ||
            (profile.subscription_type === 'vip' && !profile.subscription_expires_at) ||
            (profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date())
          );

        if (!hasSubscription) {
          // Check individual purchase
          const { data: purchased } = await supabase
            .from("user_guides")
            .select("id")
            .eq("user_id", user.id)
            .eq("guide_id", guideId)
            .maybeSingle();

          if (!purchased) {
            return new Response(JSON.stringify({ error: "Access denied" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    // Extract file path from the URL
    // fileUrl could be a full URL or just a path
    let filePath = fileUrl;
    if (fileUrl.includes("/storage/v1/object/public/guide-files/")) {
      filePath = fileUrl.split("/storage/v1/object/public/guide-files/")[1];
    } else if (fileUrl.includes("/guide-files/")) {
      filePath = fileUrl.split("/guide-files/").pop()!;
    }

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from("guide-files")
      .createSignedUrl(filePath, 3600);

    if (error || !data?.signedUrl) {
      console.error("Signed URL error:", error);
      return new Response(JSON.stringify({ error: "Could not generate signed URL" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
