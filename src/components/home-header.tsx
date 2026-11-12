import Link from "next/link";
import { Undo2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { band, size, u } from "@/lib/cpa-box";

/**
 * PROTÓTIPO VISUAL: nome e perfil são texto fixo.
 * Distâncias entre os itens (em px do mockup): voltar → i = 37, i → saudação = 28, saudação → perfil = 21.
 * TODO (implementação): receber `nome` e `perfil` da sessão e ligar o botão "i".
 */
export function HomeHeader() {
  return (
    <header className="cpa-home-header" style={band({ left: 43, right: 0, top: 21, h: 60 })}>
      <Button
        asChild
        className="cpa-btn"
        style={size(58, 52, { borderRadius: u(26), marginRight: u(37) })}
      >
        <Link href="/login" aria-label="Voltar" title="Voltar">
          <Undo2 aria-hidden style={{ width: u(26), height: u(26) }} />
        </Link>
      </Button>

      <Button
        type="button"
        aria-label="Informações"
        title="Informações"
        className="cpa-btn cpa-btn--line"
        style={size(54, 44, { borderRadius: u(12), fontSize: u(22), marginRight: u(28) })}
      >
        i
      </Button>

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
        Seja bem vindo, [Usuário]!
      </h1>

      <div className="cpa-profile" style={size(185, 60, { fontSize: u(17) })}>
        <span className="cpa-sr">Perfil ativo:</span>
        Administrador
        <span className="cpa-avatar">
          <UserRound aria-hidden style={{ width: u(26), height: u(26) }} />
        </span>
      </div>
    </header>
  );
}
