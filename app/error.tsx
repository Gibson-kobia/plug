'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="font-sans text-display-lg font-bold text-navy-900">
        Something went wrong
      </h2>
      <p className="max-w-md text-body text-neutral-500">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="focus-ring rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Try again
      </button>
    </div>
  );
}