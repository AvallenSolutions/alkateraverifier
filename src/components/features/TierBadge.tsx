import type { Tier } from "@/types/verification";

/**
 * The five certification bands as stamp-like metallic pills
 * (design.md § Components, badge-tier-*).
 */
const TIER_STYLES: Record<Tier, { label: string; className: string }> = {
  not_certified: {
    label: "Not Certified",
    className: "bg-tier-not-certified text-on-metal-light",
  },
  bronze: { label: "Bronze", className: "bg-tier-bronze text-on-metal-light" },
  silver: { label: "Silver", className: "bg-tier-silver text-on-metal-dark" },
  gold: { label: "Gold", className: "bg-tier-gold text-on-metal-dark" },
  platinum: {
    label: "Platinum",
    className: "bg-tier-platinum text-on-metal-light",
  },
};

export function TierBadge({
  tier,
  size = "md",
}: {
  tier: Tier;
  size?: "md" | "lg";
}) {
  const style = TIER_STYLES[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono uppercase ${style.className} ${
        size === "lg" ? "px-6 py-2.5 text-body-sm tracking-[0.08em]" : "px-4 py-1.5 text-label"
      }`}
    >
      {style.label}
    </span>
  );
}
