import { prisma } from "../src/config/prisma.js";
import { UF_SIGLAS } from "@jamfy/shared";

type IbgeMunicipio = {
  nome: string;
};

async function fetchMunicipios(uf: string): Promise<IbgeMunicipio[]> {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
  );

  if (!response.ok) {
    throw new Error(`IBGE request failed for ${uf}: ${response.status}`);
  }

  return response.json();
}

async function main() {
  for (const uf of UF_SIGLAS) {
    const municipios = await fetchMunicipios(uf);

    await prisma.cidade.createMany({
      data: municipios.map((municipio) => ({
        nome: municipio.nome,
        uf,
      })),
      skipDuplicates: true,
    });

    console.log(`${uf}: ${municipios.length} cidades salvas.`);
  }

  const total = await prisma.cidade.count();
  console.log(`Concluído. Total de cidades no banco: ${total}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
