import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { box, u } from "@/lib/cpa-box";

/**
 * PROTÓTIPO VISUAL: sem validação e sem envio.
 * As coordenadas são relativas ao cartão cinza do login (que está em x=187, y=128 no mockup).
 * TODO (implementação): envolver em <form>, ligar a autenticação e trocar o Link do
 * botão "Entrar" por type="submit".
 */
export function LoginForm() {
  return (
    <>
      <Label
        htmlFor="email"
        className="cpa-label"
        style={box(75, 84, 94, 30, { fontSize: u(18), lineHeight: u(30) })}
      >
        E-Mail
      </Label>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        className="cpa-field"
        style={box(198, 84, 307, 30, { fontSize: u(16) })}
      />

      <Label
        htmlFor="senha"
        className="cpa-label"
        style={box(75, 151, 94, 30, { fontSize: u(18), lineHeight: u(30) })}
      >
        Senha
      </Label>
      <Input
        id="senha"
        name="senha"
        type="password"
        autoComplete="current-password"
        className="cpa-field"
        style={box(198, 151, 307, 30, { fontSize: u(16) })}
      />

      <Button
        asChild
        className="cpa-btn cpa-btn--line"
        style={box(226, 218, 131, 49, { borderRadius: u(25), fontSize: u(17) })}
      >
        <Link href="/inicio">Entrar</Link>
      </Button>
    </>
  );
}
