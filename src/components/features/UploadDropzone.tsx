"use client";

import { useCallback, useRef, useState } from "react";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export function UploadDropzone({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptFile = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const isPdf =
        candidate.type === "application/pdf" ||
        candidate.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setError("Only PDF files are supported. Upload your LCA report as a PDF.");
        onFileChange(null);
        return;
      }
      if (candidate.size > MAX_UPLOAD_BYTES) {
        setError("This file is larger than 20MB. Export a smaller PDF and try again.");
        onFileChange(null);
        return;
      }
      setError(null);
      onFileChange(candidate);
    },
    [onFileChange],
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload your LCA report (PDF)"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          acceptFile(event.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center outline-none transition-colors focus:border-accent-strong focus:ring-1 focus:ring-accent-strong ${
          isDragging
            ? "border-accent-strong bg-accent-subtle"
            : "border-border-strong bg-surface hover:bg-surface-sunken"
        }`}
      >
        {file ? (
          <>
            <p className="font-mono text-data text-ink">{file.name}</p>
            <p className="mt-1 text-caption text-on-surface-subtle">
              {(file.size / (1024 * 1024)).toFixed(1)}MB — ready to verify
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onFileChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="mt-3 rounded-full px-3 py-1.5 font-mono text-label uppercase text-on-surface-muted underline hover:text-ink"
            >
              Choose a different file
            </button>
          </>
        ) : (
          <>
            <p className="text-body text-ink">
              Drop your LCA report here, or click to browse.
            </p>
            <p className="mt-1 text-caption text-on-surface-subtle">
              PDF only, up to 20MB.
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-sm border-l-[3px] border-error bg-surface-sunken px-3 py-2 text-body-sm text-ink"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
