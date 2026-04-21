'use client';

import { useRef, useState } from 'react';
import { getJournalPhotoUrl, type JournalPhoto } from '@/lib/api';

interface PhotoGridProps {
  photos: JournalPhoto[];
  date: string;
  onUpload: () => void;
  onDelete: (photoId: string) => void;
}

function getBasename(s3Key: string): string {
  return s3Key.split('/').pop() || s3Key;
}

export function PhotoGrid({ photos, date, onUpload, onDelete }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { uploadUrl } = await getJournalPhotoUrl(date, file.type);
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      onUpload();
    } catch {
      /* upload failed silently */
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  const slots = 4;
  const filled = photos.slice(0, slots);

  return (
    <div className="grid grid-cols-2 gap-2">
      {filled.map((photo) => (
        <div
          key={photo.id}
          className="group relative flex h-20 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5"
        >
          <span className="truncate px-2 text-[10px] text-white/40">
            {getBasename(photo.s3Key)}
          </span>
          {photo.caption && (
            <span className="absolute bottom-1 left-1 text-[9px] text-white/30">
              {photo.caption}
            </span>
          )}
          <button
            type="button"
            onClick={() => onDelete(photo.id)}
            className="absolute right-1 top-1 hidden rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-red-400 group-hover:block"
          >
            &times;
          </button>
        </div>
      ))}
      {filled.length < slots && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/30 transition hover:border-[#A8FF00]/40 hover:text-[#A8FF00]/60"
        >
          {uploading ? '...' : '+'}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic"
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
