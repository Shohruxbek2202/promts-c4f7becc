import { Check, Users, Zap, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface BestFitInfo {
  title: string;
  subtitle: string;
  targetAudience: string[];
  idealFor: string[];
  notIdealFor?: string[];
  keyBenefits: string[];
  ctaText: string;
  ctaLink: string;
  tag?: string;
}

interface BestFitBriefProps {
  data: BestFitInfo;
  className?: string;
}

export const BestFitBrief = ({ data, className = "" }: BestFitBriefProps) => {
  return (
    <section
      className={cn("py-8 sm:py-12 bg-gradient-to-br from-primary/5 to-primary/10", className)}
      aria-labelledby="best-fit-title"
      itemScope
      itemType="https://schema.org/Product"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-6 sm:mb-8">
            {data.tag && (
              <Badge className="mb-2 sm:mb-3 text-xs" variant="secondary">
                {data.tag}
              </Badge>
            )}
            <h2
              id="best-fit-title"
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3"
              itemProp="name"
            >
              {data.title}
            </h2>
            <p className="text-sm sm:text-lg text-muted-foreground" itemProp="description">
              {data.subtitle}
            </p>
          </header>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Who is this for? */}
            <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-semibold text-base sm:text-lg">Kim uchun ideal?</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3" itemProp="audience">
                {data.targetAudience.map((audience, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{audience}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Best for scenarios */}
            <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-semibold text-base sm:text-lg">Eng yaxshi natija:</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {data.idealFor.map((scenario, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{scenario}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key benefits */}
          <div className="mt-4 sm:mt-6 bg-card rounded-xl p-4 sm:p-6 border border-border">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-center">
              Asosiy afzalliklar
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3" itemProp="additionalProperty">
              {data.keyBenefits.map((benefit, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                >
                  ✅ {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {/* Not ideal for */}
          {data.notIdealFor && data.notIdealFor.length > 0 && (
            <div className="mt-4 sm:mt-6 bg-muted/30 rounded-xl p-4 sm:p-6 border border-border">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-center text-muted-foreground">
                Qachon boshqa yechim kerak?
              </h3>
              <ul className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {data.notIdealFor.map((scenario, index) => (
                  <li
                    key={index}
                    className="text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full"
                  >
                    {scenario}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 sm:mt-8 text-center">
            <Button asChild size="lg" className="group">
              <Link to={data.ctaLink}>
                {data.ctaText}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* AI-friendly summary */}
          <div className="sr-only" aria-hidden="false">
            <p>
              {data.title} - {data.subtitle}. 
              Bu {data.targetAudience.join(", ")} uchun ideal yechim. 
              Asosiy afzalliklar: {data.keyBenefits.join(", ")}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
