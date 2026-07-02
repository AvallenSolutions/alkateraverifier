export const metadata = { title: "Settings — alkatera LCA Verifier" };

// Placeholder — the profile + payment history screen lands in TASK-042.
export default function SettingsPage() {
  return (
    <div>
      <p className="font-mono text-label uppercase text-on-surface-subtle">
        Settings
      </p>
      <h1 className="mt-2 font-display text-h1 text-ink">Account</h1>
      <div className="mt-6 rounded-md border border-border bg-surface p-5">
        <p className="text-body text-on-surface-muted">
          Profile and payment settings are not ready yet. They arrive in a
          later phase of the build.
        </p>
      </div>
    </div>
  );
}
