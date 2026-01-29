import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://mpbs.uz";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date for lastmod
    const today = new Date().toISOString().split("T")[0];

    // Start sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/prompts", priority: "0.9", changefreq: "daily" },
      { url: "/lessons", priority: "0.8", changefreq: "weekly" },
      { url: "/faq", priority: "0.6", changefreq: "monthly" },
      { url: "/help", priority: "0.5", changefreq: "monthly" },
      { url: "/contact", priority: "0.5", changefreq: "monthly" },
      { url: "/terms", priority: "0.3", changefreq: "yearly" },
      { url: "/privacy", priority: "0.3", changefreq: "yearly" },
      { url: "/payment-terms", priority: "0.3", changefreq: "yearly" },
    ];

    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Fetch published prompts
    const { data: prompts } = await supabase
      .from("prompts")
      .select("slug, updated_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (prompts) {
      for (const prompt of prompts) {
        const lastmod = prompt.updated_at 
          ? new Date(prompt.updated_at).toISOString().split("T")[0] 
          : today;
        sitemap += `  <url>
    <loc>${BASE_URL}/prompt/${prompt.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      }
    }

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    if (categories) {
      for (const category of categories) {
        const lastmod = category.updated_at 
          ? new Date(category.updated_at).toISOString().split("T")[0] 
          : today;
        sitemap += `  <url>
    <loc>${BASE_URL}/prompts?category=${category.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Fetch published lessons
    const { data: lessons } = await supabase
      .from("lessons")
      .select("slug, updated_at")
      .eq("is_published", true);

    if (lessons) {
      for (const lesson of lessons) {
        const lastmod = lesson.updated_at 
          ? new Date(lesson.updated_at).toISOString().split("T")[0] 
          : today;
        sitemap += `  <url>
    <loc>${BASE_URL}/lessons/${lesson.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Close sitemap
    sitemap += `</urlset>`;

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate sitemap" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
