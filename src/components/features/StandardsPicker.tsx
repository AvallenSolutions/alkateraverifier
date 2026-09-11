"use client";

import type { Standard, StandardCategory } from "@/types/verification";

const CATEGORY_LABELS: Record<StandardCategory, string> = {
  iso: "ISO standards",
  ghg: "GHG frameworks",
  global: "Global frameworks",
};

const CATEGORY_ORDER: StandardCategory[] = ["iso", "ghg", "global"];

export function StandardsPicker({
  groups,
  selectedCodes,
  onToggle,
  disabled = false,
}: {
  groups: Record<StandardCategory, Standard[]>;
  selectedCodes: string[];
  onToggle: (code: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-50" : ""}>
      {CATEGORY_ORDER.map((category) =>
        groups[category].length === 0 ? null : (
          <fieldset key={category} className="mt-5 first:mt-0" disabled={disabled}>
            <legend className="font-mono text-label uppercase text-on-surface-subtle">
              {CATEGORY_LABELS[category]}
            </legend>
            <div className="mt-2 space-y-2">
              {groups[category].map((standard) => {
                const checked = selectedCodes.includes(standard.code);
                return (
                  <label
                    key={standard.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 transition-colors ${
                      checked
                        ? "border-accent-strong bg-accent-subtle"
                        : "border-border bg-surface hover:bg-surface-sunken"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(standard.code)}
                      className="mt-1 h-4 w-4 accent-accent"
                    />
                    <span>
                      <span className="block text-body-sm font-medium text-ink">
                        {standard.name}
                      </span>
                      {standard.description ? (
                        <span className="mt-0.5 block text-caption text-on-surface-muted">
                          {standard.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ),
      )}
    </div>
  );
}
