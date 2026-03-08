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

    const { fileUrl, lessonId } = await req.json();

    if (!fileUrl || !lessonId) {
      return new Response(JSON.stringify({ error: "fileUrl and lessonId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the lesson's course_id
    const { data: lesson } = await supabase
      .from("course_lessons")
      .select("course_id, is_preview")
      .eq("id", lessonId)
      .maybeSingle();

    if (!lesson) {
      return new Response(JSON.stringify({ error: "Lesson not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If not preview, check access
    if (!lesson.is_preview) {
      // Check admin
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!role) {
        // Check course enrollment
        const { data: enrollment } = await supabase
          .from("user_courses")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", lesson.course_id)
          .maybeSingle();

        if (!enrollment) {
          return new Response(JSON.stringify({ error: "Access denied" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Extract file path
    let filePath = fileUrl;
    if (fileUrl.includes("/storage/v1/object/public/course-materials/")) {
      filePath = fileUrl.split("/storage/v1/object/public/course-materials/")[1];
    } else if (fileUrl.includes("/course-materials/")) {
      filePath = fileUrl.split("/course-materials/").pop()!;
    }

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from("course-materials")
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
