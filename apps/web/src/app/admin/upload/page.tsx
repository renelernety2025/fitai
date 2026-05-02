'use client';

import { useState, FormEvent, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getUploadUrl, createVideo, getAdminVideos, startPreprocessing,
  getPreprocessingStatus, publishVideo, deleteVideo, reprocessVideo,
  type VideoData,
} from '@/lib/api';

const CATEGORIES = ['YOGA', 'PILATES', 'STRENGTH', 'CARDIO', 'MOBILITY'];
const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-gray-600 text-gray-200',
    PROCESSING: 'bg-blue-600 text-blue-100',
    COMPLETED: 'bg-green-600 text-green-100',
    FAILED: 'bg-red-600 text-red-100',
  };
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'AI processing...',
    COMPLETED: 'Done',
    FAILED: 'Failed',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.PENDING}`}>
      {status === 'PROCESSING' && <span className="inline-block h-2 w-2 animate-spin rounded-full border border-white border-t-transparent" />}
      {labels[status] || status}
    </span>
  );
}

export default function AdminUploadPage() {
  const { user, isLoading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null!);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('YOGA');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [videos, setVideos] = useState<VideoData[]>([]);

  const loadVideos = useCallback(() => {
    getAdminVideos().then(setVideos).catch(console.error);
  }, []);

  useEffect(() => {
    if (user?.isAdmin) loadVideos();
  }, [user, loadVideos]);

  // Poll processing videos
  useEffect(() => {
    const processing = videos.filter((v) => v.preprocessingStatus === 'PROCESSING');
    if (processing.length === 0) return;

    const interval = setInterval(async () => {
      let changed = false;
      for (const v of processing) {
        try {
          const st = await getPreprocessingStatus(v.id);
          if (st.preprocessingStatus !== 'PROCESSING') changed = true;
        } catch {}
      }
      if (changed) loadVideos();
    }, 5000);

    return () => clearInterval(interval);
  }, [videos, loadVideos]);

  if (isLoading) return <div className="p-8 text-gray-500">Načítání...</div>;
  if (!user?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600 text-lg">Přístup zamítnut. Vyžaduje admin oprávnění.</p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus('Vyber video soubor'); return; }

    setUploading(true);
    setProgress(0);
    setStatus('Získávám upload URL...');

    try {
      const { uploadUrl, s3Key } = await getUploadUrl(file.name, file.type || 'video/mp4');

      setStatus('Nahrávám video...');
      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status < 400 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
        xhr.send(file);
      });

      setStatus('Vytvářím záznam...');
      const video = await createVideo({
        title,
        description,
        category,
        difficulty,
        durationSeconds: durationMinutes * 60,
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/640/360`,
        s3RawKey: s3Key,
      });

      // Auto-start preprocessing
      setStatus('Spouštím AI zpracování...');
      await startPreprocessing(video.id);

      setStatus('Video nahráno, AI zpracovává choreografii...');
      setTitle('');
      setDescription('');
      if (fileRef.current) fileRef.current.value = '';
      loadVideos();
    } catch (err: any) {
      setStatus(`Chyba: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish(id: string) {
    try { await publishVideo(id); loadVideos(); } catch { setStatus('Publish failed'); }
  }

  async function handleReprocess(id: string) {
    try { await reprocessVideo(id); loadVideos(); } catch { setStatus('Reprocess failed'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this video?')) return;
    try { await deleteVideo(id); loadVideos(); } catch { setStatus('Delete failed'); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold">Admin — Správa videí</h1>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="mb-10 space-y-4 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Nahrát nové video</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Název</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Video soubor</label>
              <input ref={fileRef} type="file" accept="video/*" className="w-full rounded-lg border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Popis</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Kategorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Obtížnost</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-lg border px-3 py-2">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Délka (min)</label>
              <input type="number" min={1} required value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
            </div>
          </div>

          {uploading && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-[#16a34a] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
          )}
          {status && <p className="text-sm text-gray-600">{status}</p>}

          <button type="submit" disabled={uploading} className="rounded-lg bg-[#16a34a] px-6 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {uploading ? 'Nahrávám...' : 'Nahrát video'}
          </button>
        </form>

        {/* Videos table */}
        <h2 className="mb-4 text-lg font-semibold">Všechna videa</h2>
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-gray-600">
                <th className="px-4 py-3 font-medium">Název</th>
                <th className="px-4 py-3 font-medium">Kategorie</th>
                <th className="px-4 py-3 font-medium">Publikováno</th>
                <th className="px-4 py-3 font-medium">AI Preprocessing</th>
                <th className="px-4 py-3 font-medium">Akce</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id} className="border-b">
                  <td className="px-4 py-3 font-medium">{v.title}</td>
                  <td className="px-4 py-3 text-gray-600">{v.category}</td>
                  <td className="px-4 py-3">
                    {v.isPublished
                      ? <span className="text-green-600 text-xs font-medium">Ano</span>
                      : <span className="text-gray-400 text-xs">Ne</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.preprocessingStatus} />
                    {v.preprocessingStatus === 'COMPLETED' && (
                      <p className="mt-0.5 text-xs text-gray-400">Choreografie připravena</p>
                    )}
                    {v.preprocessingStatus === 'FAILED' && v.preprocessingError && (
                      <p className="mt-0.5 text-xs text-red-400">{v.preprocessingError}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!v.isPublished && (
                        <button onClick={() => handlePublish(v.id)} className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200">
                          Publikovat
                        </button>
                      )}
                      <button onClick={() => handleReprocess(v.id)} className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200">
                        Zpracovat
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200">
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
