import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "@/lib/env";

/**
 * Claude powers structured extraction (TASK-016) and clause reasoning
 * (Phase 2). Model is overridable per environment so per-verification
 * cost can be tuned against quality.
 */
export const EXTRACTION_MODEL =
  process.env.CLAUDE_EXTRACTION_MODEL ?? "claude-opus-4-8";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  }
  return client;
}
