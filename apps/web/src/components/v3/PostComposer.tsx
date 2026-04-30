'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, Button, Chip } from '@/components/v3';
import { createPost, getUploadUrls, searchHashtags } from '@/lib/api';

interface PostComposerProps {
  onPostCreated: () => void;
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [caption, setCaption] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<{ name: string }[]>([]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCaptionChange = useCallback(async (value: string) => {
    setCaption(value);
    const hashMatch = value.match(/#(\w{2,})$/);
    if (hashMatch) {
      const results = await searchHashtags(hashMatch[1]).catch(() => []);
      setSuggestedTags(results.slice(0, 5));
    } else {
      setSuggestedTags([]);
    }
  }, []);

  const handleTagSelect = useCallback((tagName: string) => {
    setCaption((prev) => prev.replace(/#\w*$/, `#${tagName} `));
    setSuggestedTags([]);
  }, []);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!caption.trim() && photos.length === 0) return;
    setPosting(true);

    try {
      const photoKeys: string[] = [];

      if (photos.length > 0) {
        const urls = await getUploadUrls(photos.length);
        for (let i = 0; i < photos.length; i++) {
          await fetch(urls[i].uploadUrl, {
            method: 'PUT',
            body: photos[i],
            headers: { 'Content-Type': photos[i].type },
          });
          photoKeys.push(urls[i].s3Key);
        }
      }

      await createPost({
        caption: caption.trim() || undefined,
        type: photoKeys.length > 0 ? 'PHOTO' : 'TEXT',
        photoKeys: photoKeys.length > 0 ? photoKeys : undefined,
      });

      setCaption('');
      setPhotos([]);
      setPreviews([]);
      onPostCreated();
    } finally {
      setPosting(false);
    }
  }, [caption, photos, onPostCreated]);

  return (
    <Card className="p-4 mb-6">
      <textarea
        value={caption}
        onChange={(e) => handleCaptionChange(e.target.value)}
        placeholder="Co je nového? Použij #hashtagy..."
        className="w-full bg-transparent border-none outline-none resize-none text-[var(--text-1)]"
        rows={3}
        maxLength={2000}
      />

      {suggestedTags.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {suggestedTags.map((tag) => (
            <Chip key={tag.name} onClick={() => handleTagSelect(tag.name)}>
              #{tag.name}
            </Chip>
          ))}
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex gap-2 mt-3">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20">
              <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
              <button
                onClick={() => handleRemovePhoto(i)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-1)]">
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            Fotka
          </Button>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={posting || (!caption.trim() && photos.length === 0)}
        >
          {posting ? 'Publikuji...' : 'Publikovat'}
        </Button>
      </div>
    </Card>
  );
}
