import { PrismaClient } from '@prisma/client';

export async function seedPromoCards(prisma: PrismaClient) {
  const promos = [
    { type: 'FEATURE_DISCOVERY', title: 'Zkus AI Chat Coach', subtitle: 'Alex ti poradí s tréninkem', ctaText: 'Vyzkoušet', ctaUrl: '/ai-chat', targetAudience: 'ALL', priority: 8 },
    { type: 'FEATURE_DISCOVERY', title: 'Vytvoř si jídelníček', subtitle: 'AI vygeneruje 7denní plán', ctaText: 'Vytvořit', ctaUrl: '/jidelnicek', targetAudience: 'ALL', priority: 7 },
    { type: 'FEATURE_DISCOVERY', title: 'Zapiš do deníku', subtitle: 'Sleduj svůj pokrok den po dni', ctaText: 'Zapsat', ctaUrl: '/journal', targetAudience: 'ALL', priority: 6 },
    { type: 'CHALLENGE', title: 'Přidej se k výzvě', subtitle: 'Soutěž s komunitou', ctaText: 'Prozkoumat', ctaUrl: '/community', targetAudience: 'ALL', priority: 5 },
    { type: 'UPGRADE', title: 'Upgrade na Premium', subtitle: 'Odemkni vše za 399 Kč/měs', ctaText: 'Upgradovat', ctaUrl: '/pricing', targetAudience: 'ALL', priority: 9 },
    { type: 'CONTENT', title: 'Sdílej svůj trénink', subtitle: 'Ukaž komunitě co dokážeš', ctaText: 'Sdílet', ctaUrl: '/community', targetAudience: 'ALL', priority: 4 },
    { type: 'FEATURE_DISCOVERY', title: 'Zkontroluj Fitness Score', subtitle: 'Jak jsi na tom? 0-100', ctaText: 'Zjistit', ctaUrl: '/fitness-score', targetAudience: 'ALL', priority: 6 },
    { type: 'FEATURE_DISCOVERY', title: 'Pozvi kamaráda', subtitle: 'Trénink ve dvou je lepší', ctaText: 'Pozvat', ctaUrl: '/gym-buddy', targetAudience: 'ALL', priority: 3 },
  ];

  for (const promo of promos) {
    const existing = await prisma.promoCard.findFirst({ where: { title: promo.title } });
    if (!existing) {
      await prisma.promoCard.create({ data: promo as any });
    }
  }
  console.log('Seeded 8 promo cards');
}
