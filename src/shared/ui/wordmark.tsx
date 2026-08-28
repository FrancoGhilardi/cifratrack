import { cn } from "@/shared/lib/utils";
import { BRAND_SERIF } from "./brand-fonts";

type WordmarkTone = "default" | "panel" | "nav";

interface WordmarkProps {
  className?: string;
  /** Superficie sobre la que se muestra el wordmark. */
  tone?: WordmarkTone;
}

const TONE_TEXT: Record<WordmarkTone, string> = {
  default: "text-foreground",
  panel: "text-auth-panel-ink",
  nav: "text-app-nav-ink",
};

const TONE_SUFFIX: Record<WordmarkTone, string> = {
  default: "text-auth-accent",
  panel: "text-auth-panel-accent",
  nav: "text-app-nav-accent",
};

/** Wordmark "cifratrack.01" con display serif. */
export function Wordmark({ className, tone = "default" }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0.5 text-[22px] tracking-tight",
        TONE_TEXT[tone],
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
          TONE_SUFFIX[tone],
        )}
      >
        .01
      </span>
    </span>
  );
}
