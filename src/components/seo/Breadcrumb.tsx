import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { SchemaMarkup, BreadcrumbSchema } from "./SchemaMarkup";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  const baseUrl = "https://mpbs.uz";
  
  // Generate schema items
  const schemaItems = [
    { name: "Bosh sahifa", url: baseUrl },
    ...items.map((item) => ({
      name: item.label,
      url: item.href ? `${baseUrl}${item.href}` : baseUrl,
    })),
  ];

  const breadcrumbSchema: BreadcrumbSchema = {
    type: "BreadcrumbList",
    items: schemaItems,
  };

  return (
    <>
      <SchemaMarkup schemas={[breadcrumbSchema]} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-1 text-sm text-muted-foreground ${className}`}
      >
        <Link 
          to="/" 
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">Bosh sahifa</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
};
