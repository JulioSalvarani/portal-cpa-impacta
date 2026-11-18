"use client";

import { useActionState } from "react";
import { loginAction, type EstadoLogin } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { box, u } from "@/lib/cpa-box";

const ESTADO_INICIAL: EstadoLogin = { erro: null };

export function LoginForm() {
  const [estado, formAction, pendente] = useActionState(loginAction, ESTADO_INICIAL);

  return (
    <form action={formAction} style={{ display: "contents" }}>
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
        required
        placeholder="usuario@impacta.edu.br"
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
        required
        className="cpa-field"
        style={box(198, 151, 307, 30, { fontSize: u(16) })}
      />

      {estado.erro && (
        <p
          role="alert"
          className="cpa-form-error"
          style={box(75, 190, 430, 20, { fontSize: u(12), margin: 0 })}
        >
          {estado.erro}
        </p>
      )}

      <Button
        type="submit"
        disabled={pendente}
        className="cpa-btn cpa-btn--line"
        style={box(226, 218, 131, 49, { borderRadius: u(25), fontSize: u(17) })}
      >
        {pendente ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}