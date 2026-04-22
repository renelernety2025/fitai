export default function sitemap() {
  const base = 'https://fitai.bfevents.cz';
  // Only include publicly accessible pages (no auth required)
  const pages = [
    '', '/login', '/register', '/privacy', '/terms', '/ai-disclaimer',
  ];
  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
}
