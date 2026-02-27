import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

const rules = [
  { label: "Kamida 8 ta belgi", test: (p: string) => p.length >= 8 },
  { label: "Katta harf (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Raqam (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "Maxsus belgi (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const passwordSchema = {
  validate: (password: string) => rules.every((r) => r.test(password)),
  message: "Parol kamida 8 ta belgi, katta harf, raqam va maxsus belgi bo'lishi kerak",
};

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const passed = useMemo(() => rules.filter((r) => r.test(password)).length, [password]);
  const percentage = (passed / rules.length) * 100;

  const color = percentage <= 25 ? "bg-destructive" : percentage <= 50 ? "bg-orange-500" : percentage <= 75 ? "bg-yellow-500" : "bg-green-500";

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all duration-300 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map((rule) => {
          const ok = rule.test(password);
          return (
            <div key={rule.label} className="flex items-center gap-1.5 text-xs">
              {ok ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
              <span className={ok ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
