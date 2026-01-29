import { useEffect } from "react";

// Organization Schema
export interface OrganizationSchema {
  type: "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone: string;
    contactType: string;
    email?: string;
  };
}

// WebSite Schema with SearchAction
export interface WebSiteSchema {
  type: "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

// Product Schema
export interface ProductSchema {
  type: "Product";
  name: string;
  description: string;
  image?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability: "InStock" | "OutOfStock";
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

// Article Schema
export interface ArticleSchema {
  type: "Article";
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
}

// FAQ Schema
export interface FAQSchema {
  type: "FAQPage";
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

// BreadcrumbList Schema
export interface BreadcrumbSchema {
  type: "BreadcrumbList";
  items: Array<{
    name: string;
    url: string;
  }>;
}

// ItemList Schema (for category pages)
export interface ItemListSchema {
  type: "ItemList";
  name: string;
  numberOfItems: number;
  itemListElement?: Array<{
    position: number;
    name: string;
    url: string;
  }>;
}

// VideoObject Schema
export interface VideoSchema {
  type: "VideoObject";
  name: string;
  description: string;
  thumbnailUrl?: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

// SoftwareApplication Schema (SaaS SEO 2026)
export interface SoftwareApplicationSchema {
  type: "SoftwareApplication";
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem?: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
  };
  author?: {
    name: string;
    url?: string;
  };
  featureList?: string[];
  screenshot?: string;
  softwareVersion?: string;
  releaseNotes?: string;
  datePublished?: string;
  dateModified?: string;
}

// HowTo Schema (for tutorials and guides)
export interface HowToSchema {
  type: "HowTo";
  name: string;
  description: string;
  totalTime?: string;
  estimatedCost?: {
    currency: string;
    value: string;
  };
  step: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
}

// Review Schema (for testimonials and E-E-A-T)
export interface ReviewSchema {
  type: "Review";
  itemReviewed: {
    type: string;
    name: string;
  };
  reviewRating: {
    ratingValue: number;
    bestRating: number;
  };
  author: {
    name: string;
    jobTitle?: string;
  };
  reviewBody: string;
  datePublished: string;
}

// Person Schema (for E-E-A-T author credibility)
export interface PersonSchema {
  type: "Person";
  name: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  sameAs?: string[];
  worksFor?: {
    name: string;
    url?: string;
  };
  knowsAbout?: string[];
}

export type SchemaType = 
  | OrganizationSchema 
  | WebSiteSchema 
  | ProductSchema 
  | ArticleSchema 
  | FAQSchema 
  | BreadcrumbSchema
  | ItemListSchema
  | VideoSchema
  | SoftwareApplicationSchema
  | HowToSchema
  | ReviewSchema
  | PersonSchema;

interface SchemaMarkupProps {
  schemas: SchemaType[];
}

const generateSchema = (schema: SchemaType): object => {
  const baseContext = "https://schema.org";

  switch (schema.type) {
    case "Organization":
      return {
        "@context": baseContext,
        "@type": "Organization",
        name: schema.name,
        url: schema.url,
        logo: schema.logo,
        description: schema.description,
        sameAs: schema.sameAs,
        contactPoint: schema.contactPoint ? {
          "@type": "ContactPoint",
          telephone: schema.contactPoint.telephone,
          contactType: schema.contactPoint.contactType,
          email: schema.contactPoint.email,
        } : undefined,
      };

    case "WebSite":
      return {
        "@context": baseContext,
        "@type": "WebSite",
        name: schema.name,
        url: schema.url,
        potentialAction: schema.potentialAction ? {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: schema.potentialAction.target,
          },
          "query-input": schema.potentialAction.queryInput,
        } : undefined,
      };

    case "Product":
      return {
        "@context": baseContext,
        "@type": "Product",
        name: schema.name,
        description: schema.description,
        image: schema.image,
        offers: schema.offers ? {
          "@type": "Offer",
          price: schema.offers.price,
          priceCurrency: schema.offers.priceCurrency,
          availability: `https://schema.org/${schema.offers.availability}`,
        } : undefined,
        aggregateRating: schema.aggregateRating ? {
          "@type": "AggregateRating",
          ratingValue: schema.aggregateRating.ratingValue,
          reviewCount: schema.aggregateRating.reviewCount,
        } : undefined,
      };

    case "Article":
      return {
        "@context": baseContext,
        "@type": "Article",
        headline: schema.headline,
        description: schema.description,
        image: schema.image,
        datePublished: schema.datePublished,
        dateModified: schema.dateModified,
        author: schema.author ? {
          "@type": "Person",
          name: schema.author.name,
          url: schema.author.url,
        } : undefined,
      };

    case "FAQPage":
      return {
        "@context": baseContext,
        "@type": "FAQPage",
        mainEntity: schema.questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: q.answer,
          },
        })),
      };

    case "BreadcrumbList":
      return {
        "@context": baseContext,
        "@type": "BreadcrumbList",
        itemListElement: schema.items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      };

    case "ItemList":
      return {
        "@context": baseContext,
        "@type": "ItemList",
        name: schema.name,
        numberOfItems: schema.numberOfItems,
        itemListElement: schema.itemListElement?.map((item) => ({
          "@type": "ListItem",
          position: item.position,
          name: item.name,
          url: item.url,
        })),
      };

    case "VideoObject":
      return {
        "@context": baseContext,
        "@type": "VideoObject",
        name: schema.name,
        description: schema.description,
        thumbnailUrl: schema.thumbnailUrl,
        uploadDate: schema.uploadDate,
        duration: schema.duration,
        contentUrl: schema.contentUrl,
        embedUrl: schema.embedUrl,
      };

    case "SoftwareApplication":
      return {
        "@context": baseContext,
        "@type": "SoftwareApplication",
        name: schema.name,
        description: schema.description,
        applicationCategory: schema.applicationCategory,
        operatingSystem: schema.operatingSystem || "Web",
        offers: schema.offers ? {
          "@type": "Offer",
          price: schema.offers.price,
          priceCurrency: schema.offers.priceCurrency,
          priceValidUntil: schema.offers.priceValidUntil,
        } : undefined,
        aggregateRating: schema.aggregateRating ? {
          "@type": "AggregateRating",
          ratingValue: schema.aggregateRating.ratingValue,
          reviewCount: schema.aggregateRating.reviewCount,
          bestRating: schema.aggregateRating.bestRating || 5,
        } : undefined,
        author: schema.author ? {
          "@type": "Organization",
          name: schema.author.name,
          url: schema.author.url,
        } : undefined,
        featureList: schema.featureList,
        screenshot: schema.screenshot,
        softwareVersion: schema.softwareVersion,
        releaseNotes: schema.releaseNotes,
        datePublished: schema.datePublished,
        dateModified: schema.dateModified,
      };

    case "HowTo":
      return {
        "@context": baseContext,
        "@type": "HowTo",
        name: schema.name,
        description: schema.description,
        totalTime: schema.totalTime,
        estimatedCost: schema.estimatedCost ? {
          "@type": "MonetaryAmount",
          currency: schema.estimatedCost.currency,
          value: schema.estimatedCost.value,
        } : undefined,
        step: schema.step.map((s, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: s.name,
          text: s.text,
          image: s.image,
          url: s.url,
        })),
      };

    case "Review":
      return {
        "@context": baseContext,
        "@type": "Review",
        itemReviewed: {
          "@type": schema.itemReviewed.type,
          name: schema.itemReviewed.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: schema.reviewRating.ratingValue,
          bestRating: schema.reviewRating.bestRating,
        },
        author: {
          "@type": "Person",
          name: schema.author.name,
          jobTitle: schema.author.jobTitle,
        },
        reviewBody: schema.reviewBody,
        datePublished: schema.datePublished,
      };

    case "Person":
      return {
        "@context": baseContext,
        "@type": "Person",
        name: schema.name,
        jobTitle: schema.jobTitle,
        description: schema.description,
        image: schema.image,
        url: schema.url,
        sameAs: schema.sameAs,
        worksFor: schema.worksFor ? {
          "@type": "Organization",
          name: schema.worksFor.name,
          url: schema.worksFor.url,
        } : undefined,
        knowsAbout: schema.knowsAbout,
      };

    default:
      return {};
  }
};

export const SchemaMarkup = ({ schemas }: SchemaMarkupProps) => {
  useEffect(() => {
    // Remove existing schema scripts first
    const existingScripts = document.querySelectorAll('script[data-schema-markup="true"]');
    existingScripts.forEach((script) => script.remove());

    // Add new schema scripts
    schemas.forEach((schema, index) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-schema-markup", "true");
      script.setAttribute("data-schema-index", String(index));
      script.textContent = JSON.stringify(generateSchema(schema), null, 0);
      document.head.appendChild(script);
    });

    // Cleanup on unmount
    return () => {
      const scripts = document.querySelectorAll('script[data-schema-markup="true"]');
      scripts.forEach((script) => script.remove());
    };
  }, [schemas]);

  return null;
};
