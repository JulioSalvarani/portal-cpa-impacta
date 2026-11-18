"use client";

import { ExternalLink, MessageSquare, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { box, u } from "@/lib/cpa-box";

type Props = {
  trigger: React.ReactElement;
  chatsUrl?: string;
  meetUrl?: string;
};

/**
 * Modal de Contato e Informações da CPA, acionado pelo botão "i" em `/inicio`.
 * Contém apresentação institucional e links diretos para Google Chats e Google Meet.
 */
export function ContatoInfoDialog({
  trigger,
  chatsUrl = "https://chat.google.com",
  meetUrl = "https://meet.google.com",
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="cpa-modal translate-x-0 translate-y-0">
        <DialogTitle className="cpa-m-title" style={box(43, 15, 577, 53, { fontSize: u(18) })}>
          Contato e Informações · CPA
        </DialogTitle>
        <DialogDescription className="cpa-sr">
          Canais institucionais de atendimento da Comissão Própria de Avaliação da Faculdade Impacta.
        </DialogDescription>

        <div className="cpa-contact-box" style={box(43, 86, 577, 258)}>
          <div className="cpa-contact-desc">
            <p style={{ marginBottom: u(8) }}>
              A <strong>Comissão Própria de Avaliação (CPA)</strong> conduz os processos de
              autoavaliação institucional da Faculdade Impacta, consolidando a participação de
              alunos, docentes e corpo técnico-administrativo.
            </p>
            <p>
              Para dúvidas, sugestões ou atendimento direto com a comissão, utilize os canais
              oficiais abaixo ou envie e-mail para <strong>cpa@impacta.edu.br</strong>.
            </p>
          </div>

          <div className="cpa-contact-links">
            <a
              href={chatsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cpa-contact-btn"
            >
              <MessageSquare aria-hidden style={{ width: u(18), height: u(18) }} />
              Google Chats
              <ExternalLink aria-hidden style={{ width: u(14), height: u(14) }} />
            </a>

            <a
              href={meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cpa-contact-btn"
            >
              <Video aria-hidden style={{ width: u(18), height: u(18) }} />
              Google Meet
              <ExternalLink aria-hidden style={{ width: u(14), height: u(14) }} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}