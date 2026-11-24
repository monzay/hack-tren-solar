export default function FlechaNorte() {
  return (
    <div
      className="flex flex-col items-center rounded-md border bg-background/95 px-2 py-1 shadow-sm"
      role="img"
      aria-label="Norte hacia arriba"
    >
      <svg width="16" height="22" viewBox="0 0 16 22" aria-hidden="true">
        <polygon points="8,0 15,20 8,15 1,20" fill="currentColor" />
      </svg>
      <span className="text-xs font-semibold">N</span>
    </div>
  );
}
