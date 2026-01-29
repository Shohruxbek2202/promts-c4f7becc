import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
  telegram_url: string;
  instagram_url: string;
}

const defaultSettings: ContactSettings = {
  email: "info@mpbs.uz",
  phone: "+998 90 123 45 67",
  address: "Toshkent shahri, O'zbekiston",
  telegram_url: "https://t.me/mpbs_uz",
  instagram_url: "https://instagram.com/mpbs_uz",
};

export const useContactSettings = () => {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "contact_settings")
        .maybeSingle();

      if (data?.value) {
        const value = data.value as unknown as ContactSettings;
        setSettings({
          email: value.email || defaultSettings.email,
          phone: value.phone || defaultSettings.phone,
          address: value.address || defaultSettings.address,
          telegram_url: value.telegram_url || defaultSettings.telegram_url,
          instagram_url: value.instagram_url || defaultSettings.instagram_url,
        });
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  return { settings, isLoading };
};
