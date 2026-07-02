export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="mx-auto max-w-content text-center">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          alka<span className="font-semibold">tera</span> LCA Verifier
        </p>
        <h1 className="mt-4 font-display text-display text-ink">
          Independent LCA verification that shows its working.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-body text-on-surface-muted">
          Upload your LCA and choose the standards that matter to you. We will
          check it against every one and show our working. This tool is under
          construction.
        </p>
      </div>
    </main>
  );
}
