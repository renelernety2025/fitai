'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold" style={{ color: 'var(--danger)' }}>Něco se pokazilo</h1>
      <p className="mt-4 text-white/50">Zkus to znovu nebo se vrať na dashboard.</p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={reset}
          className="rounded-full border border-white/20 px-6 py-3 text-sm text-white/60 transition hover:text-white"
        >
          Zkusit znovu
        </button>
        <a
          href="/dashboard"
          className="rounded-full px-6 py-3 text-sm font-semibold text-black"
          style={{ backgroundColor: 'var(--sage)' }}
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
