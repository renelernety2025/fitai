'use client';

/**
 * Bundles — curated packages purchasable with XP.
 */

import { useEffect, useState, useMemo } from 'react';
import { V2Layout, V2SectionLabel, V2Display } from '@/components/v2/V2Layout';
import { GlassCard } from '@/components/v2/GlassCard';
import { StaggerContainer, StaggerItem } from '@/components/v2/motion';
import { SkeletonCard } from '@/components/v2/Skeleton';
import { getBundles, purchaseBundle } from '@/lib/api';

type Bundle = { id: string; name: string; description?: string; items: any[]; priceXP: number; giftable: boolean; creator?: { name: string }; purchased?: boolean; creatorName?: string };

const TYPE_ICONS: Record<string, string> = {
  workout_plan: '\uD83C\uDFCB',
  meal_plan: '\uD83C\uDF5D',
  supplement: '\uD83D\uDC8A',
  challenge: '\u26A1',
  recovery: '\uD83E\uDDD8',
};

function BundleCard({
  bundle,
  onPurchase,
}: {
  bundle: Bundle;
  onPurchase: (id: string) => void;
}) {
  return (
    <GlassCard className="p-6 h-full flex flex-col" hover={false}>
      <div className="flex-1">
        <h3 className="text-lg font-bold tracking-tight text-white">
          {bundle.name}
        </h3>
        <p className="mt-2 text-sm text-white/50 line-clamp-2">
          {bundle.description}
        </p>

        {/* Items preview */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {bundle.items.slice(0, 5).map((item, i) => (
            <span
              key={i}
              className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] text-white/50"
            >
              {TYPE_ICONS[item.type] || '\u2699'} {item.name}
            </span>
          ))}
          {bundle.items.length > 5 && (
            <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[10px] text-white/40">
              +{bundle.items.length - 5}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-white/35">
          <span>by {bundle.creatorName || bundle.creator?.name || 'Unknown'}</span>
          {bundle.giftable && (
            <span className="rounded-full bg-[#BF5AF2]/15 px-2 py-0.5 text-[#BF5AF2]">
              Giftable
            </span>
          )}
        </div>
      </div>

      {/* Price + actions */}
      <div className="mt-5 flex items-center gap-3">
        <span className="text-lg font-bold text-[#FF9F0A]">
          {bundle.priceXP} XP
        </span>
        <div className="flex-1" />
        {bundle.purchased ? (
          <span className="rounded-full bg-[#A8FF00]/15 px-3 py-1.5 text-xs font-medium text-[#A8FF00]">
            Vlastnis
          </span>
        ) : (
          <>
            <button
              onClick={() => onPurchase(bundle.id)}
              className="rounded-lg bg-[#FF375F] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#FF375F]/80 transition-all"
            >
              Koupit
            </button>
            {bundle.giftable && (
              <button className="rounded-lg border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/60 hover:bg-white/10 transition-all">
                Darovat
              </button>
            )}
          </>
        )}
      </div>
    </GlassCard>
  );
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Bundles';
  }, []);

  useEffect(() => {
    getBundles()
      .then(setBundles)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  async function handlePurchase(id: string) {
    try {
      await purchaseBundle(id);
      setBundles((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, purchased: true } : b,
        ),
      );
    } catch {
      /* noop */
    }
  }

  const myBundles = useMemo(
    () => bundles.filter((b) => b.purchased),
    [bundles],
  );
  const available = useMemo(
    () => bundles.filter((b) => !b.purchased),
    [bundles],
  );

  return (
    <V2Layout>
      <section className="pt-12 pb-8">
        <V2SectionLabel>Curated Packages</V2SectionLabel>
        <V2Display size="xl">Bundles.</V2Display>
        <p className="mt-4 max-w-xl text-base text-white/55">
          Balicky cviku, jidel a vyzev od komunity. Platba XP body.
        </p>
      </section>

      {error && (
        <p className="mb-8 text-sm text-[#FF375F]">
          Nepodarilo se nacist bundles.
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-white/30">
            Zatim zadne bundles.
          </p>
        </div>
      ) : (
        <>
          {/* Available */}
          {available.length > 0 && (
            <section className="mb-10">
              <StaggerContainer>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((b) => (
                    <StaggerItem key={b.id}>
                      <BundleCard
                        bundle={b}
                        onPurchase={handlePurchase}
                      />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </section>
          )}

          {/* My bundles */}
          {myBundles.length > 0 && (
            <section className="mb-12">
              <V2SectionLabel>Moje Bundles</V2SectionLabel>
              <StaggerContainer>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myBundles.map((b) => (
                    <StaggerItem key={b.id}>
                      <BundleCard
                        bundle={b}
                        onPurchase={handlePurchase}
                      />
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            </section>
          )}
        </>
      )}
    </V2Layout>
  );
}
