import { cn } from "@/shared/lib/utils";

const BRAND_SERIF =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif';

interface AuthWordmarkProps {
  className?: string;
  /** true cuando se muestra sobre el panel oscuro */
  onPanel?: boolean;
}

/** Wordmark "cifratrack.01" con display serif. */
export function AuthWordmark({
  className,
  onPanel = false,
}: AuthWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 text-[22px] tracking-tight",
        onPanel ? "text-auth-panel-ink" : "text-foreground",
        className,
      )}
      style={{ fontFamily: BRAND_SERIF }}
      aria-label="cifratrack"
    >
      <b className="font-semibold">cifra</b>
      <span className="font-normal">track</span>
      <span
        className={cn(
          "-translate-y-px font-mono text-[12px]",
          onPanel ? "text-auth-panel-accent" : "text-auth-accent",
        )}
      >
        .01
      </span>
    </span>
  );
}
