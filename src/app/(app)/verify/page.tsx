import { getActiveStandards } from "@/lib/standards/get";
import { VerifyFlow } from "@/components/features/VerifyFlow";

export const metadata = { title: "Verify · alkatera verifier" };

export default async function VerifyPage() {
  const groups = await getActiveStandards();

  return (
    <div>
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Verify
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">Verify an LCA</h1>
      <p className="mt-3 max-w-xl text-body text-on-surface-muted">
        Upload your LCA and choose the standards that matter to you. We will
        check it against every one and show our working.
      </p>
      <div className="mt-6">
        <VerifyFlow groups={groups} />
      </div>
    </div>
  );
}
