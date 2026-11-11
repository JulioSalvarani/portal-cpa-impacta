import Link from "next/link";
import { Undo2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { box, u } from "@/lib/cpa-box";

/**
 * PROTÓTIPO VISUAL: nome e perfil são texto fixo.
 * TODO (implementação): receber `nome` e `perfil` da sessão e ligar o botão "i".
 */
export function HomeHeader() {
  return (
    <header style={box(0, 0, 960, 90)}>
      <Button
        asChild
        className="cpa-btn"
        style={box(43, 25, 58, 52, { borderRadius: u(26) })}
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
        style={box(138, 29, 54, 44, { borderRadius: u(12), fontSize: u(22) })}
      >
        i
      </Button>

      <h1 className="cpa-pill" style={box(220, 21, 532, 60, { borderRadius: u(30), fontSize: u(20) })}>
        Seja bem vindo, [Usuário]!
      </h1>

      <div className="cpa-profile" style={box(773, 21, 185, 60, { fontSize: u(17) })}>
        <span className="cpa-sr">Perfil ativo:</span>
        Administrador
        <span className="cpa-avatar">
          <UserRound aria-hidden style={{ width: u(26), height: u(26) }} />
        </span>
      </div>
    </header>
  );
}
