'use client';

export default function DragHandle() {
  return (
    <div className="flex flex-col gap-[3px] cursor-grab active:cursor-grabbing px-1 py-2">
      <div className="flex gap-[3px]">
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
      </div>
      <div className="flex gap-[3px]">
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
      </div>
      <div className="flex gap-[3px]">
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
        <span className="block h-[3px] w-[3px] rounded-full bg-white/25" />
      </div>
    </div>
  );
}
