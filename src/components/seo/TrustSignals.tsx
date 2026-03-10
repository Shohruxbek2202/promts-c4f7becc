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

export const TrustSignals = ({
  signals,
  title,
  className = "",
}: TrustSignalsProps) => {
  return (
    <section
      className={cn("py-6 sm:py-8 bg-muted/30", className)}
      aria-label="Ishonch ko'rsatkichlari"
    >
      <div className="container mx-auto px-4">
        {title && (
          <h3 className="text-center text-xs sm:text-sm font-medium text-muted-foreground mb-4 sm:mb-6 uppercase tracking-wide">
            {title}
          </h3>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-12 max-w-2xl sm:max-w-none mx-auto">
          {signals.map((signal, index) => {
            const Icon = iconMap[signal.icon];
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center"
                itemScope
                itemType="https://schema.org/QuantitativeValue"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-1.5 sm:mb-2" />
                <span
                  className="text-xl sm:text-2xl font-bold text-foreground"
                  itemProp="value"
                >
                  {signal.value}
                </span>
                <span
                  className="text-xs sm:text-sm text-muted-foreground"
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
