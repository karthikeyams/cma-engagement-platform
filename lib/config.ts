export type FeatureMode = "engagement" | "registration" | "both";

export function getFeatureMode(): FeatureMode {
  const raw = process.env.NEXT_PUBLIC_FEATURE_MODE;
  if (raw === "engagement" || raw === "registration") return raw;
  return "both";
}

export function showEngagement(mode: FeatureMode): boolean {
  return mode === "engagement" || mode === "both";
}

export function showRegistration(mode: FeatureMode): boolean {
  return mode === "registration" || mode === "both";
}
