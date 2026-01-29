import { Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LastUpdatedProps {
  publishDate?: string;
  updateDate: string;
  showRefreshIcon?: boolean;
  className?: string;
}

/**
 * Last Updated Component
 * Important for AI/Search freshness signals
 * Shows content is actively maintained and current
 */
export const LastUpdated = ({
  publishDate,
  updateDate,
  showRefreshIcon = true,
  className = "",
}: LastUpdatedProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Bugun";
    if (diffDays === 1) return "Kecha";
    if (diffDays < 7) return `${diffDays} kun oldin`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} oy oldin`;
    return `${Math.floor(diffDays / 365)} yil oldin`;
  };

  const isRecent = () => {
    const date = new Date(updateDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        isRecent() ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
        className
      )}
    >
      {showRefreshIcon ? (
        <RefreshCw className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      
      <span>
        {publishDate && (
          <>
            <time dateTime={publishDate} itemProp="datePublished">
              Nashr: {formatDate(publishDate)}
            </time>
            {" • "}
          </>
        )}
        <time dateTime={updateDate} itemProp="dateModified">
          Yangilangan: {getDaysAgo(updateDate)}
        </time>
      </span>

      {isRecent() && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          Yangi
        </span>
      )}
    </div>
  );
};
