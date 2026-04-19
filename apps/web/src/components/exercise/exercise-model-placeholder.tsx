'use client';

/** Loading placeholder for the 3D exercise model viewer. */
export default function ExerciseModelPlaceholder() {
  return (
    <div className="relative mb-12 flex aspect-[16/10] max-h-[500px] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-black/50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-24 w-12 animate-pulse rounded-full bg-white/10" />
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/30" />
      </div>
    </div>
  );
}
