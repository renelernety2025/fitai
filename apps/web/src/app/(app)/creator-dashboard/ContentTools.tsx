'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/v3';
import { setSubscriptionPrice, schedulePost, cancelScheduledPost, publishNow, bulkSubscriberOnly } from '@/lib/api';

interface PostRow { id: string; title: string; isSubscriberOnly: boolean }
interface ScheduledPost { id: string; caption: string; publishAt: string }

const INPUT_STYLE: React.CSSProperties = {
  background: 'var(--bg-3)', border: '1px solid var(--stroke-2)', borderRadius: 8,
  padding: '8px 12px', color: 'var(--text-1)', fontSize: 13, outline: 'none',
};

export function ContentTools({ posts, onRefresh }: { posts: PostRow[]; onRefresh: () => void }) {
  const [price, setPrice] = useState('');
  const [priceSaving, setPriceSaving] = useState(false);
  const [scheduled, setScheduled] = useState<ScheduledPost[]>([]);
  const [caption, setCaption] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [subscriberOnly, setSubscriberOnly] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulking, setBulking] = useState(false);

  async function handleSavePrice() {
    const n = parseInt(price, 10);
    if (!n || n < 1) return;
    setPriceSaving(true);
    try { await setSubscriptionPrice(n); } finally { setPriceSaving(false); }
  }

  async function handleSchedule() {
    if (!caption.trim() || !publishAt) return;
    setScheduling(true);
    try {
      await schedulePost({ caption, type: 'text', publishAt, isSubscriberOnly: subscriberOnly });
      setCaption(''); setPublishAt(''); setSubscriberOnly(false);
      onRefresh();
    } finally { setScheduling(false); }
  }

  async function handlePublishNow(id: string) {
    await publishNow(id);
    setScheduled((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleCancel(id: string) {
    await cancelScheduledPost(id);
    setScheduled((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleBulkToggle(isOnly: boolean) {
    if (selected.size === 0) return;
    setBulking(true);
    try {
      await bulkSubscriberOnly(Array.from(selected), isOnly);
      setSelected(new Set()); onRefresh();
    } finally { setBulking(false); }
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s; });
  }

  return (
    <section>
      <div className="v3-eyebrow" style={{ color: 'var(--text-3)', marginBottom: 16 }}>Nástroje obsahu</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card padding={20}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Cena předplatného</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="XP za měsíc" style={{ ...INPUT_STYLE, flex: 1 }} />
            <Button variant="accent" size="sm" onClick={handleSavePrice} disabled={priceSaving}>{priceSaving ? '...' : 'Uložit'}</Button>
          </div>
        </Card>

        <Card padding={20}>
          <div style={{ marginBottom: 10, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Naplánovat příspěvek</div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Text příspěvku..." rows={2}
            style={{ ...INPUT_STYLE, width: '100%', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)}
              style={{ ...INPUT_STYLE, flex: 1, minWidth: 160, fontSize: 12 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={subscriberOnly} onChange={(e) => setSubscriberOnly(e.target.checked)} />
              Jen odběratelé
            </label>
            <Button variant="accent" size="sm" onClick={handleSchedule} disabled={scheduling}>{scheduling ? '...' : 'Naplánovat'}</Button>
          </div>
        </Card>
      </div>

      {scheduled.length > 0 && (
        <Card padding={20} style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12, fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Naplánované příspěvky</div>
          {scheduled.map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 8, marginBottom: 6 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.caption || '(bez textu)'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{new Date(p.publishAt).toLocaleString('cs-CZ')}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handlePublishNow(p.id)}>Publikovat</Button>
              <Button variant="plain" size="sm" onClick={() => handleCancel(p.id)}>Zrušit</Button>
            </div>
          ))}
        </Card>
      )}

      <Card padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-1)', fontSize: 14 }}>Hromadné nastavení přístupu</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" disabled={selected.size === 0 || bulking} onClick={() => handleBulkToggle(false)}>Zdarma</Button>
            <Button variant="accent" size="sm" disabled={selected.size === 0 || bulking} onClick={() => handleBulkToggle(true)}>Jen odběratelé</Button>
          </div>
        </div>
        {posts.length === 0
          ? <div style={{ padding: '16px 0', color: 'var(--text-3)', fontSize: 13, textAlign: 'center' }}>Žádné příspěvky</div>
          : posts.map((p) => (
            <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => toggleSelect(p.id, e.target.checked)} />
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
              <span style={{ fontSize: 11, color: p.isSubscriberOnly ? 'var(--accent)' : 'var(--text-3)' }}>{p.isSubscriberOnly ? 'Placené' : 'Zdarma'}</span>
            </label>
          ))
        }
      </Card>
    </section>
  );
}
