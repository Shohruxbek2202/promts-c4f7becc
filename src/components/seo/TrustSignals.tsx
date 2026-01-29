import { Shield, Award, Users, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrustSignal {
  icon: "shield" | "award" | "users" | "star" | "check";
  value: string;
  label: string;
}

interface TrustSignalsProps {
  signals: TrustSignal[];
  title?: string;
  className?: string;
}

const iconMap = {
  shield: Shield,
  award: Award,
  users: Users,
  star: Star,
  check: CheckCircle,
};

/**
 * Trust Signals Component
 * Displays E-E-A-T (Experience, Expertise, Authority, Trust) indicators
 * Important for both Google ranking and AI recommendations
 */
export const TrustSignals = ({
  signals,
  title,
  className = "",
}: TrustSignalsProps) => {
  return (
    <section
      className={cn("py-8 bg-muted/30", className)}
      aria-label="Ishonch ko'rsatkichlari"
    >
      <div className="container mx-auto px-4">
        {title && (
          <h3 className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wide">
            {title}
          </h3>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {signals.map((signal, index) => {
            const Icon = iconMap[signal.icon];
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
                itemScope
                itemType="https://schema.org/QuantitativeValue"
              >
                <Icon className="w-6 h-6 text-primary mb-2" />
                <span
                  className="text-2xl font-bold text-foreground"
                  itemProp="value"
                >
                  {signal.value}
                </span>
                <span
                  className="text-sm text-muted-foreground"
                  itemProp="name"
                >
                  {signal.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
