// Curated ordering so the most commonly booked genres/instruments show up
// first in category grids and filter chips, instead of the database's
// alphabetical order (which buries things like Sertanejo and Violão under
// Axé and Acordeon). Anything not in these lists keeps falling back to
// alphabetical order, so new or less common entries still show up.
const GENRE_PRIORITY = [
  "Sertanejo",
  "Pagode",
  "Samba",
  "MPB",
  "Pop",
  "Forró",
  "Axé",
  "Funk",
  "Rock",
  "Reggae",
  "Gospel",
  "Bossa Nova",
  "Jazz",
  "Blues",
  "Eletrônica",
  "Pisadinha",
  "Brega",
  "Rap/Hip Hop",
  "Música Country",
];

const INSTRUMENT_PRIORITY = [
  "Violão",
  "Guitarra",
  "Bateria",
  "Baixo",
  "Teclado",
  "Piano",
  "Saxofone",
  "Violino",
  "Acordeon/Sanfona",
  "Cavaquinho",
  "Percussão",
  "Equipamento de DJ",
  "Trompete",
  "Trombone",
  "Flauta",
  "Harmônica/Gaita",
  "Viola Caipira",
  "Violoncelo",
  "Ukulele",
  "Cajón",
];

function sortByPriority<T extends { nome: string }>(
  items: T[],
  priority: string[],
): T[] {
  const rank = new Map(priority.map((nome, index) => [nome, index]));

  return [...items].sort((a, b) => {
    const rankA = rank.get(a.nome) ?? priority.length;
    const rankB = rank.get(b.nome) ?? priority.length;

    if (rankA !== rankB) return rankA - rankB;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
}

export function sortGenresByPopularity<T extends { nome: string }>(
  genres: T[],
): T[] {
  return sortByPriority(genres, GENRE_PRIORITY);
}

export function sortInstrumentsByPopularity<T extends { nome: string }>(
  instruments: T[],
): T[] {
  return sortByPriority(instruments, INSTRUMENT_PRIORITY);
}
