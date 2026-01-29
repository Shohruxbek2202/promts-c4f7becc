import { useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  noIndex?: boolean;
}

const DEFAULT_OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/Tq6i61a5t3Op2BcRpxsDZkE8P723/social-images/social-1768461706421-ChatGPT Image Jan 14, 2026, 10_53_40 PM.png";
const SITE_NAME = "PromptsHub";
const TWITTER_HANDLE = "@ShohruxDigital";

export const SEOHead = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  articlePublishedTime,
  articleModifiedTime,
  noIndex = false,
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Helper to update or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Basic meta tags
    setMetaTag("description", description);
    
    if (keywords.length > 0) {
      setMetaTag("keywords", keywords.join(", "));
    }

    // Robots
    if (noIndex) {
      setMetaTag("robots", "noindex, nofollow");
    } else {
      setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    }

    // Open Graph
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:type", ogType, true);
    setMetaTag("og:image", ogImage, true);
    setMetaTag("og:site_name", SITE_NAME, true);
    setMetaTag("og:locale", "uz_UZ", true);

    // Twitter Card
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", TWITTER_HANDLE);
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      setMetaTag("og:url", canonicalUrl, true);
      setLinkTag("canonical", canonicalUrl);
    }

    // Article specific meta
    if (ogType === "article") {
      if (articlePublishedTime) {
        setMetaTag("article:published_time", articlePublishedTime, true);
      }
      if (articleModifiedTime) {
        setMetaTag("article:modified_time", articleModifiedTime, true);
      }
    }

    // Cleanup function
    return () => {
      // Reset to default on unmount (optional)
    };
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, articlePublishedTime, articleModifiedTime, noIndex]);

  return null;
};
