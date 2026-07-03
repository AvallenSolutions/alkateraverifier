import type { Tier } from "@/types/verification";

/**
 * The certification verdict, typographic (docs/design.md § tier): a big
 * Space Grotesk word in its tier tone. No pill, no saturated block — the
 * word and its colour carry the meaning. Kept named TierBadge so existing
 * call sites keep working; it is no longer a badge.
 */
const TIER_STYLES: Record<Tier, { label: string; className: string }> = {
  not_certified: { label: "Not Certified", className: "text-tier-not-certified" },
  bronze: { label: "Bronze", className: "text-tier-bronze" },
  silver: { label: "Silver", className: "text-tier-silver" },
  gold: { label: "Gold", className: "text-tier-gold" },
  platinum: { label: "Platinum", className: "text-tier-platinum" },
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "text-h3",
  md: "text-h1",
  lg: "text-statement",
};

export function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}) {
  const style = TIER_STYLES[tier];
  return (
    <span className={`font-display ${SIZE_CLASSES[size]} ${style.className}`}>
      {style.label}
    </span>
  );
}
