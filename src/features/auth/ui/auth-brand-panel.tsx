import { ShieldCheck } from "lucide-react";
import { Wordmark } from "@/shared/ui/wordmark";
import { BalanceCurve } from "./balance-curve";
import { BRAND_SERIF } from "@/shared/ui/brand-fonts";

const LEDGER_ROWS = [
  {
    label: "Sueldo",
    amount: "+ 480.000",
    tone: "pos" as const,
    tag: "#3FCBA4",
  },
  {
    label: "Alquiler",
    amount: "− 210.000",
    tone: "neg" as const,
    tag: "#E9A08C",
  },
  {
    label: "Plazo fijo",
    amount: "+ 34.500",
    tone: "pos" as const,
    tag: "#7FA8D0",
  },
];

/** Panel de marca oscuro (visible en >= lg). Decorativo salvo el wordmark. */
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-auth-panel p-14 lg:flex">
      <BalanceCurve />

      <div className="relative z-10">
        <Wordmark tone="panel" />
      </div>

      <div className="relative z-10">
        <h2
          className="mb-4 max-w-[15ch] text-4xl font-medium leading-tight tracking-tight text-balance text-auth-panel-ink"
          style={{ fontFamily: BRAND_SERIF }}
        >
          Cada peso, anotado. Cada mes, entendido.
        </h2>
        <p className="max-w-[34ch] text-[15px] leading-relaxed text-auth-panel-soft">
          Transacciones, recurrentes e inversiones ordenadas para que sepas
          exactamente dónde estás parado.
        </p>

        <div className="mt-8 max-w-[320px] rounded-xl border border-auth-panel-line bg-white/[0.02] px-5 py-4">
          {LEDGER_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between py-2.5 ${
                i > 0 ? "border-t border-auth-panel-line" : ""
              }`}
            >
              <span className="flex items-center gap-2.5 text-[13.5px] text-auth-panel-soft">
                <span
                  className="h-2 w-2 rounded-sm"
                  style={{ background: row.tag }}
                />
                {row.label}
              </span>
              <span
                className={`font-mono text-sm tabular-nums ${
                  row.tone === "pos"
                    ? "text-auth-panel-accent"
                    : "text-[#E9A08C]"
                }`}
              >
                {row.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 flex items-center gap-2.5 text-[13px] text-auth-panel-soft">
        <ShieldCheck className="h-4 w-4 shrink-0 text-auth-panel-accent" />
        Cifrado de punta a punta. Nunca compartimos tu información.
      </p>
    </aside>
  );
}
