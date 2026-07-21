import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProfileCompletion({
  value,
  label = "Complétion du profil",
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{clamped}%</span>
      </div>
      <Progress value={clamped} aria-label={`${label} : ${clamped}%`} />
    </div>
  );
}
