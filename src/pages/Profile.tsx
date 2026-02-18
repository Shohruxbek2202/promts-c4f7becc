import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, ArrowLeft, Camera, Save, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().max(100, "Ism 100 ta belgidan oshmasin").optional(),
  phone: z
    .string()
    .trim()
    .max(20, "Telefon raqam 20 ta belgidan oshmasin")
    .regex(/^[\d\s\+\-\(\)]*$/, "Telefon raqam noto'g'ri formatda")
    .optional()
    .or(z.literal("")),
});

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  subscription_type: string | null;
}

const Profile = () => {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, avatar_url, subscription_type")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setAvatarUrl(data.avatar_url);
    }
    setLoadingProfile(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm 5MB dan oshmasligi kerak");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari ruxsat etilgan");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      // Use prompt-media public bucket for avatars (subfolder: avatars/)
      const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("prompt-media")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("prompt-media")
        .getPublicUrl(filePath);

      const newUrl = urlData.publicUrl;
      setAvatarUrl(newUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast.success("Avatar yangilandi!");
    } catch (err) {
      console.error(err);
      toast.error("Avatar yuklashda xatolik");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const parsed = profileSchema.safeParse({ full_name: fullName, phone });
    if (!parsed.success) {
      const errs: { full_name?: string; phone?: string } = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0] === "full_name") errs.full_name = e.message;
        if (e.path[0] === "phone") errs.phone = e.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("user_id", user!.id);

      if (error) throw error;
      toast.success("Profil muvaffaqiyatli saqlandi!");
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const initials =
    fullName?.trim()
      ? fullName.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : user.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:inline">
              MPBS.uz
            </span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profilni tahrirlash</h1>
            <p className="text-muted-foreground mt-1">Shaxsiy ma'lumotlaringizni yangilang</p>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <Avatar className="w-28 h-28 ring-4 ring-primary/20">
                <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <Camera className="w-6 h-6 text-primary" />
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleAvatarClick} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Rasmni o'zgartirish
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 space-y-5">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email (o'zgartirib bo'lmaydi)</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/30 border border-border text-muted-foreground text-sm">
                <User className="w-4 h-4 flex-shrink-0" />
                {profile?.email || user.email}
              </div>
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">To'liq ism</Label>
              <Input
                id="full_name"
                placeholder="Ism va familiyangiz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
              {errors.full_name && (
                <p className="text-destructive text-xs">{errors.full_name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <Input
                id="phone"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                type="tel"
              />
              {errors.phone && (
                <p className="text-destructive text-xs">{errors.phone}</p>
              )}
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Saqlash
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
