import { prisma } from "../src/config/prisma.js";

const INSTRUMENTOS = [
  "Violão",
  "Guitarra",
  "Baixo",
  "Bateria",
  "Teclado",
  "Piano",
  "Cavaquinho",
  "Violino",
  "Viola Caipira",
  "Acordeon/Sanfona",
  "Saxofone",
  "Trompete",
  "Trombone",
  "Flauta",
  "Percussão",
  "Cajón",
  "Ukulele",
  "Harmônica/Gaita",
  "Violoncelo",
  "Equipamento de DJ",
];

const GENEROS = [
  "Rock",
  "Sertanejo",
  "Samba",
  "Gospel",
  "MPB",
  "Pop",
  "Forró",
  "Pagode",
  "Axé",
  "Funk",
  "Reggae",
  "Rap/Hip Hop",
  "Eletrônica",
  "Jazz",
  "Blues",
  "Bossa Nova",
  "Pisadinha",
  "Brega",
  "Música Country",
];

async function main() {
  const { count: instrumentosCriados } = await prisma.instrumento.createMany({
    data: INSTRUMENTOS.map((nome) => ({ nome })),
    skipDuplicates: true,
  });

  const { count: generosCriados } = await prisma.generoMusical.createMany({
    data: GENEROS.map((nome) => ({ nome })),
    skipDuplicates: true,
  });

  console.log(`Instrumentos novos: ${instrumentosCriados}`);
  console.log(`Gêneros novos: ${generosCriados}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
