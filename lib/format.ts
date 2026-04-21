export function formatCount(value?: number) {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat().format(value);
}

export function formatDuration(seconds?: number) {
  if (!seconds || Number.isNaN(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}