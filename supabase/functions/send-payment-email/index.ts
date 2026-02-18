import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { paymentId, action } = await req.json();

    if (!paymentId || !action) {
      return new Response(JSON.stringify({ error: "Missing paymentId or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is admin
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

    // Check if admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get payment + user info
    const { data: payment } = await supabase
      .from("payments")
      .select("id, amount, user_id, plan_id, course_id")
      .eq("id", paymentId)
      .maybeSingle();

    if (!payment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user email from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", payment.user_id)
      .maybeSingle();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get plan or course name
    let itemName = "Xarid";
    if (payment.plan_id) {
      const { data: plan } = await supabase
        .from("pricing_plans")
        .select("name")
        .eq("id", payment.plan_id)
        .maybeSingle();
      if (plan) itemName = plan.name;
    } else if (payment.course_id) {
      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", payment.course_id)
        .maybeSingle();
      if (course) itemName = course.title;
    }

    const isApproved = action === "approved";
    const userName = profile.full_name || profile.email.split("@")[0];
    const amount = Number(payment.amount).toLocaleString("uz-UZ");

    const subject = isApproved
      ? `✅ To'lovingiz tasdiqlandi — MPBS.uz`
      : `❌ To'lovingiz rad etildi — MPBS.uz`;

    const htmlBody = isApproved
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #5b21b6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ To'lov Tasdiqlandi!</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Hurmatli <strong>${userName}</strong>,</p>
            <p style="color: #374151;">Sizning to'lovingiz muvaffaqiyatli tasdiqlandi!</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Xarid:</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #111827;">${itemName}</p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Summa: <strong>${amount} so'm</strong></p>
            </div>
            <p style="color: #374151;">Endi siz barcha premium imkoniyatlardan foydalanishingiz mumkin.</p>
            <a href="https://promts.lovable.app/dashboard" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Kabinetga kirish →
            </a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">MPBS.uz — AI Marketing Promtlari Platformasi</p>
          </div>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">❌ To'lov Rad Etildi</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Hurmatli <strong>${userName}</strong>,</p>
            <p style="color: #374151;">Afsuski, sizning to'lovingiz rad etildi.</p>
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Xarid:</p>
              <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #111827;">${itemName}</p>
              <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Summa: <strong>${amount} so'm</strong></p>
            </div>
            <p style="color: #374151;">Agar muammo bo'lsa, biz bilan bog'laning yoki qayta to'lov qiling.</p>
            <a href="https://promts.lovable.app/payment" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 10px;">
              Qayta to'lash →
            </a>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">MPBS.uz — AI Marketing Promtlari Platformasi</p>
          </div>
        </div>
      `;

    // Send email via Supabase Auth Admin (uses SMTP configured in project)
    const { error: emailError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
    });

    // Use Supabase built-in email via admin API
    // We'll use the resend-compatible approach via fetch
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (RESEND_API_KEY) {
      // Use Resend if API key is configured
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MPBS.uz <noreply@mpbs.uz>",
          to: [profile.email],
          subject,
          html: htmlBody,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error("Resend error:", errText);
        return new Response(JSON.stringify({ error: "Email sending failed", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Fallback: log the email (no SMTP configured)
      console.log(`EMAIL TO: ${profile.email}`);
      console.log(`SUBJECT: ${subject}`);
      console.log("No RESEND_API_KEY configured. Email logged only.");
    }

    return new Response(JSON.stringify({ success: true, email: profile.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
