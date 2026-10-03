import type { Metadata } from "next";
import { containerClass } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Política de Privacidade | Jamfy",
  description: "Como o Jamfy coleta, usa e protege seus dados pessoais.",
};

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "1. Quais dados coletamos",
    paragraphs: [
      "Ao criar uma conta, coletamos nome, e-mail, telefone/WhatsApp e tipo de conta (músico, banda ou contratante). Se você for artista, também coletamos informações de perfil que você optar por preencher: foto, foto de capa, biografia, cidade/estado, instrumentos, gêneros, cachê, portfólio (fotos e vídeos) e agenda de disponibilidade.",
      "Quando você envia ou recebe uma solicitação de contratação, guardamos os detalhes dessa solicitação (descrição do evento, data, cidade, orçamento) para que as partes envolvidas possam acompanhar o andamento.",
      "Se você publicar um anúncio de compra, venda ou aluguel de instrumento/equipamento, guardamos o título, descrição, categoria, preço, cidade/estado e as fotos que você enviar.",
    ],
  },
  {
    title: "2. Para que usamos seus dados",
    paragraphs: [
      "Usamos seus dados para: permitir a criação e o login na sua conta, exibir o perfil de artistas para contratantes (e vice-versa), viabilizar o envio e aceite de solicitações de contratação, exibir os anúncios de compra/venda/aluguel que você publicar, liberar o contato entre as partes nesses fluxos, e enviar notificações relacionadas a essas atividades.",
      "Não vendemos seus dados pessoais para terceiros.",
    ],
  },
  {
    title: "3. Quando seus dados são compartilhados",
    paragraphs: [
      "Seu telefone/WhatsApp é compartilhado com outro usuário em dois casos, nunca publicamente e nunca com visitantes não cadastrados: (1) numa solicitação de contratação, só depois que ela é aceita; (2) num anúncio de compra/venda/aluguel que você publicar, para qualquer usuário logado que visualizar a página do anúncio — diferente da contratação, aqui não existe uma etapa de aceite antes da liberação do contato.",
      "Seu nome, foto e informações de perfil público (para artistas) ficam visíveis a qualquer visitante do site, já que o objetivo da plataforma é divulgar seu trabalho. Da mesma forma, o conteúdo de um anúncio publicado (título, descrição, preço, fotos, cidade/estado) fica visível a qualquer visitante, mas sem o seu telefone/WhatsApp.",
      "Também compartilhamos dados com prestadores de serviço que operam a infraestrutura da plataforma (hospedagem, banco de dados e armazenamento de arquivos), estritamente para o funcionamento do serviço.",
    ],
  },
  {
    title: "4. Seus direitos (LGPD)",
    paragraphs: [
      "Você pode, a qualquer momento: acessar os dados que temos sobre você, corrigir informações incorretas, solicitar a exclusão da sua conta e dos seus dados, e revogar consentimentos dados anteriormente. Para exercer qualquer um desses direitos, entre em contato pelo e-mail suporte@jamfy.com.br.",
      "Informações básicas de conta (nome, e-mail, telefone) podem ser editadas diretamente na página de Configurações, sem precisar da nossa ajuda.",
    ],
  },
  {
    title: "5. Cookies e sessão",
    paragraphs: [
      "Usamos cookies estritamente necessários para manter você conectado (sessão de login). Não usamos cookies de rastreamento publicitário.",
    ],
  },
  {
    title: "6. Segurança e retenção",
    paragraphs: [
      "Adotamos medidas técnicas razoáveis para proteger seus dados contra acesso não autorizado. Mantemos seus dados enquanto sua conta estiver ativa; ao solicitar a exclusão da conta, removemos ou anonimizamos os dados pessoais associados, salvo quando a lei exigir retenção por período maior.",
    ],
  },
  {
    title: "7. Alterações nesta política",
    paragraphs: [
      "Podemos atualizar esta política periodicamente. Mudanças relevantes serão comunicadas pelos canais da plataforma.",
    ],
  },
  {
    title: "8. Contato",
    paragraphs: [
      "Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas para suporte@jamfy.com.br.",
    ],
  },
];

export default function PrivacidadePage() {
  return (
    <div className={`${containerClass} flex-1 px-6 py-12 sm:py-16`}>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Política de Privacidade
      </h1>
      <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
        Última atualização: outubro de 2026
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
