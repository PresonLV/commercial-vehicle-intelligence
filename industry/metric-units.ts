// 万辆 and 万台 become 辆 and 台 by ×10000. The published value stays on the row.
// 114.5万辆 becomes 1,145,000 only as that product; the source did not print the integer.

const SCALE: Record<string, { factor: number; unit: string }> = {
  万辆: { factor: 10000, unit: "辆" },
  万台: { factor: 10000, unit: "台" },
};

export function scaleWan(value: number): number {
  const text = String(value);
  const negative = text.startsWith("-");
  const body = negative ? text.slice(1) : text;
  const [whole, frac = ""] = body.split(".");
  if (frac.length > 4) return Math.round(value * 10000);
  const digits = `${whole}${frac}` || "0";
  const scaled = Number(digits + "0".repeat(4 - frac.length));
  return negative ? -scaled : scaled;
}

export interface NormalizedValue {
  value: number;
  unit: string;
  converted: boolean;
}

export function normalizeUnit(value: number, unit: string): NormalizedValue {
  const scale = SCALE[unit];
  if (!scale) return { value, unit, converted: false };
  return { value: scaleWan(value), unit: scale.unit, converted: true };
}
