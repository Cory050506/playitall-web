import { AppShell } from "@/components/app-shell";

type SettingsShellProps = {
  title: string;
  children: React.ReactNode;
};

export function SettingsShell({ title, children }: SettingsShellProps) {
  return (
    <AppShell>
      <div className="mx-auto max-w-[760px] px-[18px] pt-5">
        <h1 className="swift-title mb-6 text-4xl">{title}</h1>

        {children}
      </div>
    </AppShell>
  );
}
