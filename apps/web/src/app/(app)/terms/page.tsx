import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podmínky používání — FitAI',
  description: 'Obchodní podmínky a pravidla používání platformy FitAI.',
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

export default function TermsPage() {
  return (
    <>
      <div className="mx-auto max-w-3xl py-12">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Podmínky používání</h1>
        <p className="mb-8 text-xs text-white/30">Poslední aktualizace: 21. 4. 2026</p>

        <SectionTitle>Popis služby</SectionTitle>
        <Paragraph>
          FitAI je AI fitness platforma nabízející personalizované tréninkové plány,
          real-time koučink, sledování výživy, denní check-iny, vzdělávací obsah
          a komunitní funkce. Služba je dostupná přes webový prohlížeč a mobilní aplikaci.
        </Paragraph>

        <SectionTitle>Registrace a účet</SectionTitle>
        <Paragraph>
          Pro používání služby je nutná registrace s platným e-mailem. Jste odpovědní za
          zabezpečení svého hesla a veškerou aktivitu pod vaším účtem. Účet můžete kdykoliv
          smazat — všechna vaše data budou trvale odstraněna.
        </Paragraph>

        <SectionTitle>AI disclaimer</SectionTitle>
        <Paragraph>
          Doporučení generovaná umělou inteligencí (Claude AI) nejsou lékařské rady.
          Slouží pouze jako fitness orientace. Před zahájením nového cvičebního programu
          nebo změnou stravování konzultujte svého lékaře, zejména pokud máte zdravotní
          omezení.
        </Paragraph>

        <SectionTitle>Uživatelský obsah</SectionTitle>
        <Paragraph>
          Fotografie, příspěvky a data, která nahrajete, zůstávají vaším vlastnictvím.
          Udělujete nám licenci k jejich zpracování za účelem poskytování služby (AI analýza,
          zobrazení v aplikaci). Veřejně sdílený obsah (komunitní příspěvky) mohou vidět
          ostatní uživatelé.
        </Paragraph>

        <SectionTitle>Zakázané chování</SectionTitle>
        <Paragraph>
          Je zakázáno: sdílet nevhodný nebo urážlivý obsah, pokoušet se o neoprávněný přístup
          k datům jiných uživatelů, automatizovaně stahovat data z platformy, zneužívat AI
          funkce k generování obsahu nesouvisejícího s fitness, vydávat se za jinou osobu.
        </Paragraph>

        <SectionTitle>Omezení odpovědnosti</SectionTitle>
        <Paragraph>
          FitAI nepřebírá odpovědnost za zranění vzniklá při cvičení podle AI doporučení.
          Platforma je poskytována &quot;tak jak je&quot; bez záruky dostupnosti. Neručíme za
          přesnost AI analýz (rozpoznání jídla, hodnocení formy, odhad tělesného tuku).
        </Paragraph>

        <SectionTitle>Změny podmínek</SectionTitle>
        <Paragraph>
          Vyhrazujeme si právo tyto podmínky upravit. O významných změnách vás budeme
          informovat e-mailem nebo oznámením v aplikaci. Pokračováním v používání služby
          po změně podmínek vyjadřujete souhlas s novým zněním.
        </Paragraph>
      </div>
    </>
  );
}
