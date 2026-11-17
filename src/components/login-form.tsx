"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { box, u } from "@/lib/cpa-box";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <form action={formAction}>
      <Label
        htmlFor="email"
        className="cpa-label"
        style={box(75, 84, 94, 30)}
      >
        E-Mail
      </Label>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        required
        className="cpa-field"
        style={box(198, 84, 307, 30)}
      />

      <Label
        htmlFor="senha"
        className="cpa-label"
        style={box(75, 151, 94, 30)}
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
        style={box(198, 151, 307, 30)}
      />

      {state?.erro && (
        <p
          role="alert"
          style={{
            ...box(75, 188, 430, 22),
            color: "#c40000",
            fontSize: u(13),
            textAlign: "center",
          }}
        >
          {state.erro}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="cpa-btn cpa-btn--line"
        style={box(226, 218, 131, 49)}
      >
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}