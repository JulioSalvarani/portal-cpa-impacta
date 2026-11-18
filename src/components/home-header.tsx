"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { ContatoInfoDialog } from "@/components/contato-info-dialog";
import { Button } from "@/components/ui/button";
import { band, size, u } from "@/lib/cpa-box";

export type PerfilCpa = "aluno" | "coordenador" | "avaliador_externo" | "admin";

const ROTULO_PERFIL: Record<PerfilCpa, string> = {
  aluno: "Aluno",
  coordenador: "Coordenador",
  avaliador_externo: "Avaliador Ext.",
  admin: "Administrador",
};

type Props = {
  nome?: string;
  role?: PerfilCpa;
  logoutAction?: () => Promise<void> | void;
  onAlternarPerfilPreview?: () => void;
};

/**
 * Cabeçalho do painel `/inicio`:
 * - Botão de logout com ícone `LogOut` (`.cpa-logout`)
 * - Botão "i" (abre o modal ContatoInfoDialog)
 * - Pílula de saudação dinâmica
 * - Indicador de perfil ativo (no protótipo, clicar alterna o perfil de preview)
 */
export function HomeHeader({
  nome = "Usuário",
  role = "admin",
  logoutAction,
  onAlternarPerfilPreview,
}: Props) {
  const botaoEstilo = size(58, 52, { borderRadius: u(26), marginRight: u(37) });

  return (
    <header className="cpa-home-header" style={band({ left: 43, right: 0, top: 21, h: 60 })}>
      {logoutAction ? (
        <form action={logoutAction} style={{ display: "contents" }}>
          <Button
            type="submit"
            className="cpa-btn cpa-logout"
            style={botaoEstilo}
            aria-label="Fazer logout"
            title="Fazer logout"
          >
            <LogOut aria-hidden style={{ width: u(24), height: u(24) }} />
          </Button>
        </form>
      ) : (
        <Button asChild className="cpa-btn cpa-logout" style={botaoEstilo}>
          <Link href="/login" aria-label="Fazer logout" title="Fazer logout">
            <LogOut aria-hidden style={{ width: u(24), height: u(24) }} />
          </Link>
        </Button>
      )}

      <ContatoInfoDialog
        trigger={
          <Button
            type="button"
            aria-label="Contato e informações da CPA"
            title="Contato e informações da CPA"
            className="cpa-btn cpa-btn--line"
            style={size(54, 44, { borderRadius: u(12), fontSize: u(22), marginRight: u(28) })}
          >
            i
          </Button>
        }
      />

      <h1
        className="cpa-pill"
        style={{
          flex: 1,
          minWidth: 0,
          height: u(60),
          borderRadius: u(30),
          fontSize: u(20),
          marginRight: u(21),
        }}
      >
        Seja bem vindo, {nome}!
      </h1>

      <button
        type="button"
        onClick={onAlternarPerfilPreview}
        title="Perfil ativo (clique no protótipo para alternar entre os 4 perfis)"
        className="cpa-profile"
        style={size(185, 60, { fontSize: u(15) })}
      >
        <span className="cpa-sr">Perfil ativo:</span>
        <span>{ROTULO_PERFIL[role]}</span>
        <span className="cpa-avatar">
          <UserRound aria-hidden style={{ width: u(26), height: u(26) }} />
        </span>
      </button>
    </header>
  );
}