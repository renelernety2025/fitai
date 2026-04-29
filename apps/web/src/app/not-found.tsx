import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-6xl font-bold" style={{ color: 'var(--sage)' }}>404</h1>
      <p className="mt-4 text-lg text-white/50">Tato stránka neexistuje</p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-full px-6 py-3 text-sm font-semibold text-black"
        style={{ backgroundColor: 'var(--sage)' }}
      >
        Zpět na dashboard
      </Link>
    </div>
  );
}
