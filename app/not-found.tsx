import Link from 'next/link';

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-copper-500">
        404
      </p>
      <h1 className="font-sans text-display-lg font-bold text-navy-900">
        Page not found
      </h1>
      <p className="max-w-md text-body text-neutral-500">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        href="/"
        className="focus-ring rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Go to homepage
      </Link>
    </main>
  );
}