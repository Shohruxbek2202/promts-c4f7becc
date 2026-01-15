import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Trash2, 
  Play, 
  Image as ImageIcon,
  Link as LinkIcon,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";

interface PromptMedia {
  id: string;
  prompt_id: string;
  media_type: "video" | "image";
  url: string;
  title: string | null;
  sort_order: number;
}

interface PromptMediaManagerProps {
  promptId: string;
}

export const PromptMediaManager = ({ promptId }: PromptMediaManagerProps) => {
  const [media, setMedia] = useState<PromptMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    fetchMedia();
  }, [promptId]);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("prompt_media")
      .select("*")
      .eq("prompt_id", promptId)
      .order("sort_order");

    if (data) setMedia(data as PromptMedia[]);
    setIsLoading(false);
  };

  const handleVideoUrlAdd = async () => {
    if (!videoUrl) {
      toast.error("Video URL kiriting");
      return;
    }

    const { error } = await supabase.from("prompt_media").insert({
      prompt_id: promptId,
      media_type: "video",
      url: videoUrl,
      title: videoTitle || null,
      sort_order: media.length,
    });

    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("Video qo'shildi");
      setVideoUrl("");
      setVideoTitle("");
      fetchMedia();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `${promptId}-${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("prompt-media")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`${file.name} yuklashda xatolik`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("prompt-media")
        .getPublicUrl(fileName);

      await supabase.from("prompt_media").insert({
        prompt_id: promptId,
        media_type: "image",
        url: urlData.publicUrl,
        title: file.name,
        sort_order: media.length + i,
      });
    }

    toast.success("Rasmlar yuklandi");
    fetchMedia();
    setIsUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video hajmi 100MB dan oshmasligi kerak");
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${promptId}-video-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("prompt-media")
      .upload(fileName, file);

    if (error) {
      toast.error("Video yuklashda xatolik");
    } else {
      const { data: urlData } = supabase.storage
        .from("prompt-media")
        .getPublicUrl(fileName);

      await supabase.from("prompt_media").insert({
        prompt_id: promptId,
        media_type: "video",
        url: urlData.publicUrl,
        title: file.name,
        sort_order: media.length,
      });

      toast.success("Video yuklandi");
      fetchMedia();
    }
    setIsUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("prompt_media").delete().eq("id", id);
    
    if (error) {
      toast.error("Xatolik yuz berdi");
    } else {
      toast.success("O'chirildi");
      fetchMedia();
    }
  };

  const videos = media.filter(m => m.media_type === "video");
  const images = media.filter(m => m.media_type === "image");

  return (
    <div className="space-y-8">
      {/* Videos Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Play className="w-4 h-4" />
          Qo'llanma videolari
        </h3>

        {/* Video URL Input */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Video URL (YouTube, Vimeo)</Label>
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label>Sarlavha (ixtiyoriy)</Label>
            <Input
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Video sarlavhasi"
            />
          </div>
          <Button onClick={handleVideoUrlAdd}>
            <LinkIcon className="w-4 h-4 mr-2" />
            Qo'shish
          </Button>
        </div>

        {/* Video Upload */}
        <div className="flex gap-4">
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center flex-1">
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              id="prompt-video-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="prompt-video-upload"
              className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Yuklanmoqda..." : "Video yuklash (max 100MB)"}
            </label>
          </div>
        </div>

        {/* Video List */}
        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-3 bg-muted rounded-lg"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <Play className="w-4 h-4 text-primary" />
                <span className="flex-1 truncate text-sm">
                  {video.title || video.url}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(video.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Natija rasmlari
        </h3>

        {/* Image Upload */}
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="prompt-image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="prompt-image-upload"
            className="cursor-pointer text-muted-foreground hover:text-foreground flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8" />
            <span>{isUploading ? "Yuklanmoqda..." : "Rasmlarni yuklash (bir nechta)"}</span>
          </label>
        </div>

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group aspect-square rounded-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.title || ""}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
