import type { Metadata } from "next";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Termos de Uso | Jamfy",
  description: "Termos de uso da plataforma Jamfy.",
};

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. O que é o Jamfy",
    paragraphs: [
      "O Jamfy é uma plataforma que conecta músicos e bandas a pessoas e empresas que desejam contratar artistas para eventos (casamentos, festas, eventos corporativos, entre outros). O Jamfy atua apenas como um ponto de encontro entre as partes — não somos organizadores de eventos, produtora musical, nem parte do contrato firmado entre o contratante e o artista.",
    ],
  },
  {
    title: "2. Cadastro e contas",
    paragraphs: [
      "Para usar o Jamfy você precisa criar uma conta como músico/banda ou como contratante, informando dados verdadeiros e atualizados (nome, e-mail, telefone). Você é responsável por manter a confidencialidade da sua senha e por tudo o que acontecer na sua conta.",
      "Podemos suspender ou encerrar contas que violem estes termos, que forneçam informações falsas, ou que sejam usadas de forma fraudulenta ou abusiva.",
    ],
  },
  {
    title: "3. Como funciona a contratação",
    paragraphs: [
      "O contratante envia uma solicitação de contratação para um artista, com detalhes do evento. O artista pode aceitar ou recusar. Quando aceita, o contato (telefone/WhatsApp) de ambas as partes é liberado para que combinem os detalhes diretamente.",
      "O Jamfy não participa da negociação de cachê, forma de pagamento, contrato do show ou execução do evento. Qualquer acordo financeiro, cancelamento, reagendamento ou eventual problema no dia do evento é de responsabilidade exclusiva do artista e do contratante envolvidos.",
    ],
  },
  {
    title: "4. Conteúdo enviado por você",
    paragraphs: [
      "Fotos, vídeos, biografia e demais informações de portfólio enviadas por artistas continuam de propriedade de quem as enviou. Ao publicá-las no Jamfy, você nos dá permissão para exibi-las na plataforma (perfil público, buscas, compartilhamento) com a finalidade de divulgar seu trabalho.",
      "Você é responsável pelo conteúdo que publica e garante ter os direitos necessários sobre fotos, vídeos e músicas exibidos no seu portfólio.",
    ],
  },
  {
    title: "5. Conduta esperada",
    paragraphs: [
      "Não é permitido usar o Jamfy para fraude, assédio, discriminação, cadastro de perfis falsos, ou qualquer conduta que prejudique outros usuários. Contas que descumprirem essas regras podem ser suspensas ou excluídas, a nosso critério.",
    ],
  },
  {
    title: "6. Limitação de responsabilidade",
    paragraphs: [
      "O Jamfy é fornecido \"como está\". Fazemos o possível para manter a plataforma no ar e funcionando, mas não garantimos disponibilidade ininterrupta, nem nos responsabilizamos por prejuízos decorrentes de shows cancelados, desentendimentos entre as partes, ou informações incorretas fornecidas por usuários.",
    ],
  },
  {
    title: "7. Alterações nestes termos",
    paragraphs: [
      "Podemos atualizar estes termos de tempos em tempos. Caso haja mudanças relevantes, avisaremos pelos canais da plataforma. O uso contínuo do Jamfy após uma atualização representa aceite dos novos termos.",
    ],
  },
  {
    title: "8. Contato",
    paragraphs: [
      "Dúvidas sobre estes termos podem ser enviadas para suporte@jamfy.com.br.",
    ],
  },
];

export default function TermosPage() {
  return (
    <div className={`${containerClass} flex-1 px-6 py-12 sm:py-16`}>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Termos de Uso
      </h1>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Última atualização: setembro de 2026
      </p>

      <div className="mt-10 flex max-w-2xl flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="mb-2 text-lg font-semibold tracking-tight">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
