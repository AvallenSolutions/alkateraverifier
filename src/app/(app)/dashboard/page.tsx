export const metadata = { title: "Dashboard — alkatera LCA Verifier" };

// Placeholder — the full verification history lands in TASK-041.
export default function DashboardPage() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Dashboard
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">
        Your verifications
      </h1>
      <div className="mt-6 rounded-md border border-border bg-surface p-5">
        <p className="text-body text-on-surface-muted">
          No verifications yet. Upload your first LCA to see how it holds up.
        </p>
      </div>
    </div>
  );
}
