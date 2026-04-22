export default function sitemap() {
  const base = 'https://fitai.bfevents.cz';
  const pages = [
    '', '/login', '/register', '/dashboard', '/gym', '/vyziva', '/habity',
    '/journal', '/progress', '/ai-chat', '/calendar', '/leagues', '/season',
    '/skill-tree', '/exercises', '/community', '/lekce', '/uspechy',
    '/recepty', '/jidelnicek', '/wrapped', '/marketplace', '/boss-fights',
    '/discover-weekly', '/gym-finder', '/gym-buddy', '/body-portfolio',
    '/bloodwork', '/rehab', '/export', '/privacy', '/terms', '/ai-disclaimer',
  ];
  return pages.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
}
