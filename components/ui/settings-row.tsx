import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsRowProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SettingsRow({
  title,
  subtitle,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between border-b border-[var(--hairline)] px-4 py-4 text-left transition hover:bg-[var(--soft-fill)] last:border-b-0",
        className
      )}
    >
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-[var(--foreground)]">{title}</div>
        {subtitle ? (
          <div className="mt-1 text-sm swift-subtitle">{subtitle}</div>
        ) : null}
      </div>

      <ChevronRight size={18} className="shrink-0 swift-tertiary" />
    </div>
  );
}
