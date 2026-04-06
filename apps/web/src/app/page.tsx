'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white px-4">
      <h1 className="text-5xl font-bold mb-4">FitAI</h1>
      <p className="text-gray-400 text-xl mb-8 text-center max-w-md">
        Cvičte s AI trenérem který vás sleduje a opravuje v reálném čase
      </p>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Začít zdarma
        </Link>
        <Link
          href="/login"
          className="border border-gray-600 hover:border-gray-400 px-6 py-3 rounded-lg transition"
        >
          Přihlásit se
        </Link>
      </div>
    </main>
  );
}
