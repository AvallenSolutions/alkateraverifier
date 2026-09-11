"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "./UploadDropzone";
import { StandardsPicker } from "./StandardsPicker";
import { track } from "@/lib/analytics";
import type { Standard, StandardCategory } from "@/types/verification";

/** Stepper state for the Verify screen (TASK-020): upload → standards → submit. */
export function VerifyFlow({
  groups,
}: {
  groups: Record<StandardCategory, Standard[]>;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (nextFile: File | null) => {
    if (nextFile && !file) track("upload_started");
    setFile(nextFile);
  };

  const toggleCode = (code: string) => {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((existing) => existing !== code)
        : [...current, code],
    );
  };

  const canSubmit = file !== null && selectedCodes.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!file || selectedCodes.length === 0) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    for (const code of selectedCodes) {
      formData.append("selectedStandardCodes", code);
    }

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) {
        setError(
          typeof body.error === "string"
            ? body.error
            : "Something went wrong. Try again.",
        );
        setSubmitting(false);
        return;
      }
      track("upload_completed", { verification_id: body.id });
      track("standards_selected", { count: selectedCodes.length });
      router.push(`/verify/${body.id}`);
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-border bg-surface p-5">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Step 1 — Upload
        </p>
        <h2 className="mt-2 font-display text-h2 text-ink">Your LCA report</h2>
        <div className="mt-4">
          <UploadDropzone file={file} onFileChange={handleFileChange} />
        </div>
      </section>

      <section className="rounded-md border border-border bg-surface p-5">
        <p className="font-mono text-label uppercase text-on-surface-subtle">
          Step 2 — Standards
        </p>
        <h2 className="mt-2 font-display text-h2 text-ink">
          Choose what to verify against
        </h2>
        <p className="mt-2 text-body-sm text-on-surface-muted">
          {file
            ? "Select at least one. We will check your LCA against every standard you choose and show our working."
            : "Upload your report first, then choose your standards."}
        </p>
        <div className="mt-4">
          <StandardsPicker
            groups={groups}
            selectedCodes={selectedCodes}
            onToggle={toggleCode}
            disabled={!file}
          />
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-sm border-l-[3px] border-error bg-surface-sunken px-3 py-2 text-body-sm text-ink"
        >
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full rounded-full bg-accent px-5 py-3 font-mono text-label uppercase text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-10"
      >
        {submitting ? "Uploading…" : "Verify this LCA"}
      </button>
    </div>
  );
}
