import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ochrana soukromí — FitAI',
  description: 'Zásady ochrany osobních údajů platformy FitAI.',
};

const LIME = '#A8FF00';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 text-lg font-bold" style={{ color: LIME }}>
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-relaxed text-white/60">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Ochrana soukromí</h1>
        <p className="mb-8 text-xs text-white/30">Poslední aktualizace: 21. 4. 2026</p>

        <SectionTitle>Kdo jsme</SectionTitle>
        <Paragraph>
          FitAI je AI fitness platforma, která kombinuje personalizované tréninkové plány,
          real-time coaching a sledování výživy. Provozovatelem je tým FitAI.
        </Paragraph>

        <SectionTitle>Jaké údaje sbíráme</SectionTitle>
        <Paragraph>
          Registrační údaje (e-mail, jméno), fitness profil (věk, váha, výška, cíle, zranění),
          tréninková historie (cviky, sety, váhy, skóre formy), fotografie pokroku a jídla,
          denní check-in data (spánek, energie, nálada, stres) a údaje o výživě.
        </Paragraph>

        <SectionTitle>Proč údaje sbíráme</SectionTitle>
        <Paragraph>
          Data používáme výhradně k personalizaci vašeho tréninku, generování AI doporučení,
          sledování pokroku a zlepšování platformy. Vaše data nikdy neprodáváme třetím stranám.
        </Paragraph>

        <SectionTitle>AI zpracování</SectionTitle>
        <Paragraph>
          Claude AI (Anthropic) analyzuje vaše tréninkové a výživové údaje za účelem generování
          personalizovaných doporučení, plánů a tipů. AI výstupy nejsou lékařské rady — slouží
          pouze jako fitness orientace.
        </Paragraph>

        <SectionTitle>Ukládání fotek</SectionTitle>
        <Paragraph>
          Fotografie pokroku, jídla a journalu jsou ukládány na zabezpečených serverech
          AWS S3. Přístup k fotkám má pouze vlastník účtu. Fotky můžete kdykoliv smazat.
        </Paragraph>

        <SectionTitle>Cookies a localStorage</SectionTitle>
        <Paragraph>
          Používáme session cookies pro autentizaci a localStorage pro uživatelské preference
          (oblíbené cviky, nastavení tématu). Nepoužíváme trackingové cookies třetích stran.
        </Paragraph>

        <SectionTitle>Vaše práva (GDPR)</SectionTitle>
        <Paragraph>
          Máte právo na přístup ke svým datům, opravu nepřesností, úplné smazání účtu a všech
          souvisejících dat, export dat ve strojově čitelném formátu a vznesení námitky proti
          zpracování. Pro uplatnění práv nás kontaktujte na níže uvedeném e-mailu.
        </Paragraph>

        <SectionTitle>Kontakt</SectionTitle>
        <Paragraph>
          E-mail: privacy@fitai.bfevents.cz
        </Paragraph>
      </div>
    </>
  );
}
