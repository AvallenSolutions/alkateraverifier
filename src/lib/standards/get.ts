import { createClient } from "@/lib/supabase/server";
import type { Standard, StandardCategory } from "@/types/verification";

export type GroupedStandards = Record<StandardCategory, Standard[]>;

/**
 * The active standards catalogue grouped by category (FR-003, TASK-019).
 * Publicly readable via RLS; drives the Verify screen's multi-select.
 */
export async function getActiveStandards(): Promise<GroupedStandards> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("standards")
    .select("id, code, name, category, description, is_active")
    .eq("is_active", true)
    .order("code");

  if (error) {
    throw new Error(`Could not load the standards catalogue: ${error.message}`);
  }

  const groups: GroupedStandards = { iso: [], ghg: [], global: [] };
  for (const standard of (data ?? []) as Standard[]) {
    if (standard.category in groups) {
      groups[standard.category].push(standard);
    }
  }
  return groups;
}
