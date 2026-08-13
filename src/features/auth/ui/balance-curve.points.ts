export interface CurvePoint {
  x: number;
  y: number;
}

/**
 * Perfil base de un saldo que crece con pequeñas caídas (parece un ledger real).
 * Valores normalizados en [0,1].
 */
const BASE_PROFILE = [
  0.08, 0.05, 0.14, 0.11, 0.22, 0.19, 0.3, 0.27, 0.4, 0.37, 0.5, 0.46, 0.6,
  0.66, 0.62, 0.74, 0.8, 0.77, 0.88, 0.95,
];

/**
 * Genera `count` puntos normalizados de la curva de saldo, interpolando
 * linealmente sobre `BASE_PROFILE`. Determinista.
 *
 * @throws si `count < 2`
 */
export function generateBalanceCurve(count: number): CurvePoint[] {
  if (count < 2) {
    throw new Error("generateBalanceCurve: count debe ser >= 2");
  }
  const pts: CurvePoint[] = [];
  const lastIdx = BASE_PROFILE.length - 1;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const pos = t * lastIdx;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, lastIdx);
    const frac = pos - lo;
    const y = BASE_PROFILE[lo] + (BASE_PROFILE[hi] - BASE_PROFILE[lo]) * frac;
    pts.push({ x: t, y });
  }
  return pts;
}
