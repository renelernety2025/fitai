import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Disclaimer — FitAI',
  description: 'Information about AI technologies used in the FitAI platform.',
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 text-lg font-bold" style={{ color: 'var(--accent)' }}>
      {children}
    </h2>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-relaxed text-white/60">{children}</p>;
}

export default function AiDisclaimerPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">AI Disclaimer</h1>
        <p className="mb-8 text-xs text-white/30">Poslední aktualizace: 21. 4. 2026</p>

        <SectionTitle>Claude AI v FitAI</SectionTitle>
        <Paragraph>
          FitAI využívá Claude AI od společnosti Anthropic k generování personalizovaných
          fitness doporučení, tréninkových plánů, výživových tipů, analýzy formy cvičení
          a denních briefingů. AI zpracovává vaše fitness data za účelem co nejrelevantnějších
          doporučení.
        </Paragraph>

        <SectionTitle>Nejsou to lékařské rady</SectionTitle>
        <Paragraph>
          Veškerá doporučení generovaná AI slouží pouze jako fitness orientace a informační
          podpora. Nejedná se o lékařské, fyzioterapeutické ani nutriční rady od certifikovaného
          odborníka. AI výstupy nenahrazují konzultaci s lékařem.
        </Paragraph>

        <SectionTitle>Konzultujte lékaře</SectionTitle>
        <Paragraph>
          Před zahájením nového cvičebního programu, změnou stravování nebo při jakýchkoliv
          zdravotních obtížích konzultujte svého lékaře. Zvláště pokud máte chronické
          onemocnění, zranění, těhotenství nebo jiná zdravotní omezení.
        </Paragraph>

        <SectionTitle>AI může dělat chyby</SectionTitle>
        <Paragraph>
          Umělá inteligence není bezchybná. Rozpoznání jídla z fotografií může být nepřesné,
          analýza formy cvičení má své limity, odhady tělesného tuku a svalové hmoty jsou
          orientační. Vždy používejte vlastní úsudek a zdravý rozum.
        </Paragraph>

        <SectionTitle>Vaše odpovědnost</SectionTitle>
        <Paragraph>
          Uživatel je plně zodpovědný za své zdraví a rozhodnutí o cvičení. FitAI a jeho
          AI systémy slouží jako podpůrný nástroj, nikoliv jako náhrada odborného vedení.
          Cvičte bezpečně, poslouchejte své tělo a v případě bolesti nebo nepohodlí přestaňte.
        </Paragraph>
      </div>
    </>
  );
}
