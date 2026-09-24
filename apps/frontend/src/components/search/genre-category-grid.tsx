import Link from "next/link";

const PALETTE = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

export function GenreCategoryGrid({
  genres,
}: {
  genres: { id: string; nome: string }[];
}) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {genres.slice(0, 8).map((genre, index) => (
        <Link
          key={genre.id}
          href={`/artistas?generoId=${genre.id}`}
          className={`flex h-24 items-center justify-center rounded-2xl px-4 text-center text-lg font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:h-28 ${PALETTE[index % PALETTE.length]}`}
        >
          {genre.nome}
        </Link>
      ))}
    </div>
  );
}
