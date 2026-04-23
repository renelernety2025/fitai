export const FITNESS_FACTS: string[] = [
  'Svaly rostou behem odpocinku, ne behem treninku.',
  'Deadlift aktivuje vice nez 70% svalu v tele.',
  'Kreatin je nejprostudovanejsi suplement na svete.',
  '8 hodin spanku zvysuje testosteron o 15%.',
  'Squat zlepsuje mobilitu kycli i v pokrocilem veku.',
  'Svalova pamet umoznuje rychlejsi navrat po pauze.',
  'Bench press byl vynalezen v roce 1899.',
  'Deload tyden kazdych 4-6 tydnu snizuje riziko zraneni o 40%.',
  'Protein synteza trva 24-48 hodin po treninku.',
  'Studena sprcha po treninku zlepsuje regeneraci o 20%.',
  'Caffein zvysuje vykon o 3-5% pri silovych cvicich.',
  'Compound cviky spaluji 3x vice kalorii nez izolace.',
  'Voda tvori 75% svalove tkane.',
  'Ranni trenink zvysuje metabolismus na cely den.',
  'Progressive overload je klic k rustu — pridavej 2.5% kazdy tyden.',
  'Hip hinge je nejdulezitejsi pohybovy vzorec pro zdravi zad.',
  'Tempo 3-1-2 (eccentric-hold-concentric) maximalizuje hypertrofii.',
  'RPE 7-8 je sweet spot pro vetsinu treninkovych setu.',
  'Asymetrie sily > 15% zvysuje riziko zraneni.',
  'Magnesium zlepsuje kvalitu spanku a svalovou regeneraci.',
];

export function getRandomFact(): string {
  return FITNESS_FACTS[Math.floor(Math.random() * FITNESS_FACTS.length)];
}

export function getDailyFact(): string {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  return FITNESS_FACTS[dayOfYear % FITNESS_FACTS.length];
}
