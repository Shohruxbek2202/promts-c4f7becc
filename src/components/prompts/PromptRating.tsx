import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface PromptRatingProps {
  promptId: string;
  averageRating: number;
  ratingCount: number;
  userRating?: number;
  onRatingChange?: () => void;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

export const PromptRating = ({
  promptId,
  averageRating = 0,
  ratingCount = 0,
  userRating,
  onRatingChange,
  showCount = true,
  size = "md",
  readonly = false,
}: PromptRatingProps) => {
  const { user } = useAuth();
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(userRating);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleRating = async (rating: number) => {
    if (readonly || !user) {
      if (!user) {
        toast.error("Baho berish uchun tizimga kiring");
      }
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentUserRating) {
        // Update existing rating
        const { error } = await supabase
          .from("prompt_ratings")
          .update({ rating, updated_at: new Date().toISOString() })
          .eq("prompt_id", promptId)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("prompt_ratings")
          .insert({ prompt_id: promptId, user_id: user.id, rating });

        if (error) throw error;
      }

      setCurrentUserRating(rating);
      toast.success("Bahoyingiz saqlandi!");
      onRatingChange?.();
    } catch (error: any) {
      console.error("Rating error:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || currentUserRating || averageRating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly || isSubmitting || !user}
            className={cn(
              "transition-colors",
              !readonly && user && "cursor-pointer hover:scale-110",
              (readonly || !user) && "cursor-default"
            )}
            onMouseEnter={() => !readonly && user && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRating(star)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          {ratingCount > 0 && ` (${ratingCount})`}
        </span>
      )}
    </div>
  );
};
