'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getDrops, purchaseDrop, getMyDropPurchases } from '@/lib/api';

type Drop = {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  priceXP: number;
  totalEditions: number;
  remaining: number;
  imageUrl: string | null;
  category: string;
};

type Purchase = {
  id: string;
  dropId: string;
  dropName: string;
  editionNumber: number;
  purchasedAt: string;
};

const GOLD = '#d4af37';
const GOLD_DARK = '#8b7225';

function useCountdown(target: string): string {
  const [text, setText] = useState('');

  const compute = useCallback(() => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return 'LIVE';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m ${s}s`;
  }, [target]);

  useEffect(() => {
    setText(compute());
    const id = setInterval(() => setText(compute()), 1000);
    return () => clearInterval(id);
  }, [compute]);

  return text;
}

function CountdownBadge({ releaseDate }: { releaseDate: string }) {
  const text = useCountdown(releaseDate);
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-bold tracking-wider"
      style={{
        backgroundColor: `${GOLD}22`,
        color: GOLD,
        border: `1px solid ${GOLD}44`,
      }}
    >
      {text}
    </span>
  );
}

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'FitAI — Drops';
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDrops(), getMyDropPurchases()])
      .then(([d, p]) => {
        setDrops(d as Drop[]);
        setPurchases(p as Purchase[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handlePurchase(id: string) {
    setPurchasing(id);
    purchaseDrop(id)
      .then(() =>
        Promise.all([getDrops(), getMyDropPurchases()]).then(([d, p]) => {
          setDrops(d as Drop[]);
          setPurchases(p as Purchase[]);
        }),
      )
      .catch(() => {})
      .finally(() => setPurchasing(null));
  }

  return (
    <V2Layout>
      <Link
        href="/dashboard"
        className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40 transition hover:text-white"
      >
        &larr; Dashboard
      </Link>

      <section className="pt-8 pb-6">
        <div
          className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: GOLD }}
        >
          LIMITED EDITION
        </div>
        <V2Display size="xl">Drops</V2Display>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Exkluzivni limitovane edice. Jednou pryc, uz se nevrati.
        </p>
      </section>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : (
        <>
          <StaggerContainer className="grid gap-5 sm:grid-cols-2">
            {drops.length === 0 && (
              <p className="col-span-2 py-16 text-center text-sm text-white/30">
                Zadne dostupne dropy.
              </p>
            )}
            {drops.map((drop) => {
              const soldOut = drop.remaining <= 0;
              return (
                <StaggerItem key={drop.id}>
                  <div
                    className="overflow-hidden rounded-2xl border transition"
                    style={{
                      borderColor: soldOut
                        ? 'rgba(255,255,255,0.05)'
                        : `${GOLD}33`,
                      background: soldOut
                        ? 'rgba(255,255,255,0.02)'
                        : `linear-gradient(135deg, ${GOLD}08 0%, transparent 60%)`,
                      filter: soldOut ? 'grayscale(0.6)' : 'none',
                      opacity: soldOut ? 0.6 : 1,
                    }}
                  >
                    <div
                      className="flex h-44 items-center justify-center"
                      style={{
                        background: soldOut
                          ? 'linear-gradient(135deg, #1a1a1a, #111)'
                          : `linear-gradient(135deg, ${GOLD}11 0%, ${GOLD_DARK}11 100%)`,
                      }}
                    >
                      {soldOut ? (
                        <span className="text-2xl font-black uppercase tracking-[0.5em] text-white/20">
                          SOLD OUT
                        </span>
                      ) : (
                        <CountdownBadge releaseDate={drop.releaseDate} />
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold tracking-tight text-white">
                        {drop.name}
                      </h3>
                      <p className="mt-1 text-xs text-white/40 line-clamp-2">
                        {drop.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p
                            className="text-xl font-bold"
                            style={{ color: soldOut ? 'rgba(255,255,255,0.3)' : GOLD }}
                          >
                            {drop.priceXP.toLocaleString()} XP
                          </p>
                          <p className="text-[10px] text-white/30">
                            {drop.remaining}/{drop.totalEditions} zbyvajicich
                          </p>
                        </div>
                        <div className="w-24">
                          <div className="mb-1 h-1 rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${((drop.totalEditions - drop.remaining) / Math.max(drop.totalEditions, 1)) * 100}%`,
                                backgroundColor: soldOut ? 'rgba(255,255,255,0.1)' : GOLD,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      {!soldOut && (
                        <button
                          onClick={() => handlePurchase(drop.id)}
                          disabled={purchasing === drop.id}
                          className="mt-4 w-full rounded-xl py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:opacity-90 disabled:opacity-50"
                          style={{
                            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
                          }}
                        >
                          {purchasing === drop.id
                            ? 'Zpracovavam...'
                            : 'Secure My Edition'}
                        </button>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          {purchases.length > 0 && (
            <section className="mt-12">
              <V2SectionLabel>MY PURCHASES</V2SectionLabel>
              <div className="mt-4 space-y-2">
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl border px-5 py-4"
                    style={{ borderColor: `${GOLD}22`, background: `${GOLD}05` }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {p.dropName}
                      </p>
                      <p className="text-[10px] text-white/40">
                        Edition #{p.editionNumber} &middot;{' '}
                        {new Date(p.purchasedAt).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: GOLD, backgroundColor: `${GOLD}15` }}
                    >
                      Owned
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </V2Layout>
  );
}
