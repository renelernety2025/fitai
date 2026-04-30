'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, Avatar, Badge } from '@/components/v3';
import { togglePostLike, addPostComment } from '@/lib/api';
import type { PostData } from '@/lib/api/posts';

interface PostCardProps {
  post: PostData;
  onUpdate?: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);

  const timeAgo = getTimeAgo(post.createdAt);

  async function handleLike() {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    await togglePostLike(post.id).catch(() => {
      setLiked(liked);
      setLikeCount(post.likeCount);
    });
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    await addPostComment(post.id, commentText);
    setCommentText('');
    onUpdate?.();
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Avatar src={post.user.avatarUrl ?? undefined} name={post.user.name} size={40} />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold text-[var(--text-1)] hover:underline"
            >
              {post.user.name}
            </Link>
            <Badge type={post.user.badgeType} size={14} />
          </div>
          <span className="text-xs text-[var(--text-3)]">{timeAgo}</span>
        </div>
      </div>

      {post.photos.length > 0 && (
        <div className="relative aspect-square bg-[var(--bg-1)]">
          <img
            src={`${process.env.NEXT_PUBLIC_CDN_URL || ''}/${post.photos[photoIndex].s3Key}`}
            alt=""
            className="w-full h-full object-cover"
          />
          {post.photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {post.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIndex(i)}
                  className={`w-2 h-2 rounded-full ${i === photoIndex ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {post.caption && (
        <div className="px-4 pt-3 text-[var(--text-1)] text-sm leading-relaxed">
          {renderCaption(post.caption)}
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-3">
        <button onClick={handleLike} className="flex items-center gap-1.5 text-sm">
          <span style={{ color: liked ? '#E85D2C' : 'var(--text-3)' }}>
            {liked ? '♥' : '♡'}
          </span>
          <span className="text-[var(--text-3)]">{likeCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-3)]"
        >
          💬 {post.commentCount}
        </button>
      </div>

      {showComments && (
        <div className="px-4 pb-4 border-t border-[var(--border-1)]">
          <div className="flex gap-2 mt-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Napsat komentář..."
              className="flex-1 bg-[var(--bg-1)] rounded-lg px-3 py-2 text-sm text-[var(--text-1)] outline-none"
            />
            <button onClick={handleComment} className="text-sm text-[var(--accent)]">
              Odeslat
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function renderCaption(text: string) {
  const parts = text.split(/(#[a-zA-Z0-9\u00C0-\u024F_]+)/g);
  return parts.map((part, i) =>
    part.startsWith('#') ? (
      <Link
        key={i}
        href={`/trending?tag=${part.slice(1).toLowerCase()}`}
        className="text-[var(--accent)] hover:underline"
      >
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}
