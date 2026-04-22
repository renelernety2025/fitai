'use client';

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return <div className="skeleton-shimmer rounded" style={{ width, height }} />;
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  return <div className="skeleton-shimmer rounded-full" style={{ width: size, height: size }} />;
}

export function SkeletonCard({ lines = 3, height }: { lines?: number; height?: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6" style={height ? { height } : {}}>
      <SkeletonLine width="60%" height={20} />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} width={`${85 - i * 15}%`} />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <SkeletonLine width={200} height={16} />
        <div className="mx-auto mt-4"><SkeletonCircle size={280} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <SkeletonCard lines={1} height={100} />
        <SkeletonCard lines={1} height={100} />
        <SkeletonCard lines={1} height={100} />
      </div>
      <SkeletonCard lines={5} height={300} />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
          <div className="flex items-center gap-3 mb-3">
            <SkeletonCircle size={32} />
            <SkeletonLine width={120} height={14} />
          </div>
          <SkeletonLine width="90%" />
          <div className="mt-2"><SkeletonLine width="60%" /></div>
        </div>
      ))}
    </div>
  );
}
