import { DesktopSection } from "../components/DesktopSection";

export function HomePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-[18px] pt-4 sm:pt-5">
      <div className="mb-6">
        <div className="text-[11px] font-black uppercase tracking-[0.24em] swift-tertiary">
          Desktop Preview
        </div>
        <h1 className="swift-title mt-2 text-[34px] leading-tight sm:text-5xl">
          Play It All for Electron
        </h1>
        <p className="mt-3 max-w-2xl text-base swift-subtitle sm:text-lg">
          This is the new Electron + Vite shell. It is the first step toward a Feishin-like
          desktop app that does not need to boot an internal Next server.
        </p>
      </div>

      <DesktopSection
        title="What is already shared"
        subtitle="These pieces are already coming from the existing app code."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Playback state via Zustand",
            "Preferences and appearance handling",
            "React Query data access",
            "Mini player and now playing modal",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[20px] border border-[var(--hairline)] bg-[var(--soft-fill)] px-4 py-4 text-sm font-semibold text-[var(--foreground)]"
            >
              {item}
            </div>
          ))}
        </div>
      </DesktopSection>

      <DesktopSection
        title="Next migration steps"
        subtitle="The goal is to move one slice at a time instead of rewriting blind."
      >
        <ol className="space-y-3 text-sm leading-relaxed swift-subtitle">
          <li>1. Port login and session management UI into this renderer.</li>
          <li>2. Replace Next route pages with React Router screens.</li>
          <li>3. Move stream and lyrics helpers into Electron/local service plumbing.</li>
          <li>4. Rebuild packaging on top of the new desktop entrypoint.</li>
        </ol>
      </DesktopSection>
    </div>
  );
}
