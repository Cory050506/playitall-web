import { cn } from "@/lib/utils";

type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  dark?: boolean;
};

export function GlassPanel({
  className,
  dark = false,
  ...props
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-[28px]",
        dark ? "glass-dark" : "glass",
        className
      )}
      {...props}
    />
  );
}