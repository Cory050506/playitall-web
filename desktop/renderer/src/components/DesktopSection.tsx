import { GlassPanel } from "@/components/glass/glass-panel";

export function DesktopSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="text-2xl font-black text-[var(--foreground)]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm swift-subtitle">{subtitle}</p> : null}
      </div>
      <GlassPanel className="rounded-[28px] p-4 sm:p-5">{children}</GlassPanel>
    </section>
  );
}
