'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ShareCard } from '@/components/workout/v3/ShareCard';
import { API_URL } from '@/lib/api';

interface ShareCardData {
  workoutName: string;
  duration: string;
  totalReps: number;
  avgForm: number;
  xpEarned: number;
  prs: { exercise: string; value: string }[];
  date: string;
  userName: string;
}

export default function SharePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<ShareCardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = 'FitAI — Workout Share';
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/gym-sessions/${sessionId}/share-card`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, [sessionId]);

  if (error) {
    return (
      <div style={wrapperStyle}>
        <div className="v3-display-3" style={{ color: '#fff' }}>
          Workout not found
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={wrapperStyle}>
        <div className="v3-eyebrow" style={{ opacity: 0.4 }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <ShareCard {...data} />
    </div>
  );
}

const wrapperStyle: React.CSSProperties = {
  background: '#000',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};
