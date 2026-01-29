import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComparisonFeature {
  name: string;
  description?: string;
  values: Record<string, boolean | string | "partial">;
}

export interface ComparisonProduct {
  name: string;
  isHighlighted?: boolean;
  description?: string;
  price?: string;
  url?: string;
}

interface ComparisonTableProps {
  title: string;
  description?: string;
  products: ComparisonProduct[];
  features: ComparisonFeature[];
  className?: string;
}

/**
 * AI-Friendly Comparison Table Component
 * Optimized for AI crawlers (ChatGPT, Perplexity) with structured data
 * and semantic HTML for better visibility in AI search results
 */
export const ComparisonTable = ({
  title,
  description,
  products,
  features,
  className = "",
}: ComparisonTableProps) => {
  const renderValue = (value: boolean | string | "partial") => {
    if (value === true) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full">
          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span className="sr-only">Ha</span>
        </span>
      );
    }
    if (value === false) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full">
          <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="sr-only">Yo'q</span>
        </span>
      );
    }
    if (value === "partial") {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <Minus className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span className="sr-only">Qisman</span>
        </span>
      );
    }
    return <span className="text-sm text-muted-foreground">{value}</span>;
  };

  return (
    <section 
      className={cn("py-12", className)}
      aria-labelledby="comparison-title"
      itemScope
      itemType="https://schema.org/ItemList"
    >
      <div className="container mx-auto px-4">
        {/* SEO-friendly header */}
        <header className="text-center mb-8">
          <h2 
            id="comparison-title" 
            className="text-2xl md:text-3xl font-bold mb-3"
            itemProp="name"
          >
            {title}
          </h2>
          {description && (
            <p 
              className="text-muted-foreground max-w-2xl mx-auto"
              itemProp="description"
            >
              {description}
            </p>
          )}
        </header>

        {/* Responsive table wrapper */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table 
            className="w-full min-w-[600px] bg-card"
            role="grid"
            aria-label={title}
          >
            {/* Table header with product names */}
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th 
                  scope="col" 
                  className="text-left p-4 font-semibold text-foreground"
                >
                  Xususiyatlar
                </th>
                {products.map((product, index) => (
                  <th
                    key={product.name}
                    scope="col"
                    className={cn(
                      "p-4 text-center font-semibold",
                      product.isHighlighted && "bg-primary/10"
                    )}
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                  >
                    <meta itemProp="position" content={String(index + 1)} />
                    <span itemProp="name">{product.name}</span>
                    {product.isHighlighted && (
                      <span className="block text-xs text-primary font-medium mt-1">
                        ⭐ Tavsiya etiladi
                      </span>
                    )}
                    {product.price && (
                      <span className="block text-sm text-muted-foreground mt-1">
                        {product.price}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table body with features */}
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={feature.name}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    index % 2 === 0 ? "bg-card" : "bg-muted/20"
                  )}
                >
                  <td className="p-4">
                    <span className="font-medium text-foreground">
                      {feature.name}
                    </span>
                    {feature.description && (
                      <span className="block text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </span>
                    )}
                  </td>
                  {products.map((product) => (
                    <td
                      key={`${feature.name}-${product.name}`}
                      className={cn(
                        "p-4 text-center",
                        product.isHighlighted && "bg-primary/5"
                      )}
                    >
                      {renderValue(feature.values[product.name])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI-friendly summary (hidden visually but accessible to crawlers) */}
        <div className="sr-only" aria-hidden="false">
          <h3>Taqqoslash xulosasi</h3>
          <p>
            {title}: {products.map(p => p.name).join(", ")} platformalari 
            {features.length} ta xususiyat bo'yicha taqqoslandi. 
            {products.find(p => p.isHighlighted)?.name} tavsiya etiladi.
          </p>
        </div>
      </div>
    </section>
  );
};
