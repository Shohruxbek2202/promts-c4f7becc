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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get users needing reminders
    const { data: reminders, error } = await supabase.rpc("get_subscription_reminders");

    if (error) {
      console.error("get_subscription_reminders error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!reminders || reminders.length === 0) {
      console.log("No reminders to send");
      return new Response(JSON.stringify({ sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const r of reminders) {
      if (!r.email) continue;

      const userName = r.full_name || r.email.split("@")[0];
      const expiresDate = r.expires_at
        ? new Date(r.expires_at).toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" })
        : "";

      const { subject, heading, message, ctaText, ctaUrl, color } = getEmailContent(
        r.reminder_type,
        userName,
        r.subscription_type,
        expiresDate
      );

      const htmlBody = buildEmailHtml({ heading, message, ctaText, ctaUrl, color, userName });

      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "MPBS.uz <onboarding@resend.dev>",
            to: [r.email],
            subject,
            html: htmlBody,
          }),
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error(`Failed to send to ${r.email}:`, errText);
          errorCount++;
          continue;
        }

        // Record reminder (idempotency) — INSERT with ON CONFLICT DO NOTHING
        const { error: insertErr } = await supabase
          .from("subscription_reminders")
          .insert({
            profile_id: r.profile_id,
            reminder_type: r.reminder_type,
            subscription_type: r.subscription_type,
            expires_at: r.expires_at,
          });

        if (insertErr) {
          // Unique constraint = already sent, skip
          console.log(`Reminder already logged for ${r.profile_id}/${r.reminder_type}`);
        }

        // Audit log
        await supabase.from("audit_log").insert({
          admin_user_id: r.user_id,
          action: "subscription_reminder_sent",
          table_name: "profiles",
          record_id: r.profile_id,
          details: {
            reminder_type: r.reminder_type,
            subscription_type: r.subscription_type,
            expires_at: r.expires_at,
          },
        });

        sentCount++;
        console.log(`Reminder sent: ${r.email} (${r.reminder_type})`);
      } catch (emailErr) {
        console.error(`Error sending to ${r.email}:`, emailErr);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({ sent: sentCount, errors: errorCount, total: reminders.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getEmailContent(
  reminderType: string,
  userName: string,
  subscriptionType: string,
  expiresDate: string
) {
  const planLabel = subscriptionType === "vip" ? "VIP" : subscriptionType === "yearly" ? "Yillik" : "Oylik";

  switch (reminderType) {
    case "7_days":
      return {
        subject: `📅 Obunangiz 7 kundan so'ng tugaydi — MPBS.uz`,
        heading: "📅 Obunangiz tugayapti!",
        message: `Hurmatli <strong>${userName}</strong>, sizning <strong>${planLabel}</strong> obunangiz <strong>${expiresDate}</strong> kuni tugaydi. Erta yangilang va uzluksiz foydalaning.`,
        ctaText: "Obunani yangilash →",
        ctaUrl: "https://promts.lovable.app/payment",
        color: "#3b82f6",
      };
    case "3_days":
      return {
        subject: `⏰ Obunangiz 3 kundan so'ng tugaydi — MPBS.uz`,
        heading: "⏰ Obunangiz tugayapti!",
        message: `Hurmatli <strong>${userName}</strong>, sizning <strong>${planLabel}</strong> obunangiz <strong>${expiresDate}</strong> kuni tugaydi. Uzluksiz foydalanish uchun hoziroq yangilang.`,
        ctaText: "Obunani yangilash →",
        ctaUrl: "https://promts.lovable.app/payment",
        color: "#f59e0b",
      };
    case "1_day":
      return {
        subject: `🔴 Obunangiz ertaga tugaydi — MPBS.uz`,
        heading: "🔴 Ertaga tugaydi!",
        message: `Hurmatli <strong>${userName}</strong>, sizning <strong>${planLabel}</strong> obunangiz <strong>ertaga</strong> tugaydi. Promptlarga kirishni yo'qotmaslik uchun hoziroq yangilang!`,
        ctaText: "Hozir yangilash →",
        ctaUrl: "https://promts.lovable.app/payment",
        color: "#ef4444",
      };
    case "expired":
      return {
        subject: `❌ Obunangiz tugadi — MPBS.uz`,
        heading: "❌ Obunangiz tugadi",
        message: `Hurmatli <strong>${userName}</strong>, sizning <strong>${planLabel}</strong> obunangiz tugadi. Premium promptlarga qayta kirish uchun yangi obuna sotib oling.`,
        ctaText: "Qayta obuna bo'lish →",
        ctaUrl: "https://promts.lovable.app/payment",
        color: "#dc2626",
      };
    default:
      return {
        subject: `Obuna eslatmasi — MPBS.uz`,
        heading: "Obuna eslatmasi",
        message: `Hurmatli <strong>${userName}</strong>, obunangiz holati haqida xabar.`,
        ctaText: "Kabinetga kirish →",
        ctaUrl: "https://promts.lovable.app/dashboard",
        color: "#7c3aed",
      };
  }
}

function buildEmailHtml(opts: {
  heading: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  color: string;
  userName: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${opts.color}; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${opts.heading}</h1>
      </div>
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">${opts.message}</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${opts.ctaUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            ${opts.ctaText}
          </a>
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">MPBS.uz — AI Marketing Promtlari Platformasi</p>
      </div>
    </div>
  `;
}
