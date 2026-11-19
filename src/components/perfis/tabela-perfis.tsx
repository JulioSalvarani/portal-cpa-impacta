"use client";

import { useActionState, useRef, useState } from "react";
import { Check, Trash2, UserRound } from "lucide-react";
import {
  criarUsuarioAction,
  editarUsuarioAction,
  excluirUsuarioAction,
  type EstadoCriarUsuario,
} from "@/app/actions/perfis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PerfilCpa } from "@/lib/auth";
import { u } from "@/lib/cpa-box";
import {
  emailValidoParaPerfil,
  MENSAGEM_EMAIL_IMPACTA,
  OPCOES_PERFIL,
  type UsuarioPerfilItem,
} from "@/lib/perfis-data";

type Props = {
  usuariosIniciais?: UsuarioPerfilItem[];
};

type EdicaoUsuario = {
  nome?: string;
  role?: PerfilCpa;
};

export function TabelaPerfis({ usuariosIniciais = [] }: Props) {
  const [edicoes, setEdicoes] = useState<Record<string, EdicaoUsuario>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [salvoId, setSalvoId] = useState<string | null>(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState<string | null>(null);
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const usuarios: UsuarioPerfilItem[] = usuariosIniciais.map((item) => {
    const edicao = edicoes[item.user_id];
    if (!edicao) return item;

    return {
      ...item,
      nome: edicao.nome ?? item.nome,
      role: edicao.role ?? item.role,
    };
  });

  const [estadoCriacao, formAction, criando] = useActionState<
    EstadoCriarUsuario,
    FormData
  >(async (prevState, formData) => {
    // Validação preventiva (a regra definitiva continua no servidor).
    const emailInformado = String(formData.get("email") ?? "");
    const cargoInformado = String(formData.get("role") ?? "") as PerfilCpa;
    if (!emailValidoParaPerfil(emailInformado, cargoInformado)) {
      return { ok: false, mensagem: MENSAGEM_EMAIL_IMPACTA };
    }

    const res = await criarUsuarioAction(prevState, formData);
    if (res?.ok) {
      formRef.current?.reset();
    }
    return res;
  }, null);

  function alterarNome(userId: string, novoNome: string) {
    setErroMensagem(null);
    setEdicoes((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], nome: novoNome },
    }));
  }

  function alterarRole(userId: string, novoRole: PerfilCpa) {
    setErroMensagem(null);
    setEdicoes((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], role: novoRole },
    }));
  }

  async function confirmarSalvamento(usuario: UsuarioPerfilItem) {
    setSalvandoId(usuario.user_id);
    setErroMensagem(null);

    const res = await editarUsuarioAction(
      usuario.user_id,
      usuario.nome,
      usuario.role,
    );
    setSalvandoId(null);

    if (!res.ok) {
      setErroMensagem(res.mensagem);
      return;
    }

    setEdicoes((prev) => {
      const proximo = { ...prev };
      delete proximo[usuario.user_id];
      return proximo;
    });

    setSalvoId(usuario.user_id);
    setTimeout(() => setSalvoId((atual) => (atual === usuario.user_id ? null : atual)), 1800);
  }

  async function handleExcluir(userId: string) {
    if (confirmarExclusaoId !== userId) {
      setConfirmarExclusaoId(userId);
      return;
    }

    setConfirmarExclusaoId(null);
    setSalvandoId(userId);
    setErroMensagem(null);

    const res = await excluirUsuarioAction(userId);
    setSalvandoId(null);

    if (!res.ok) {
      setErroMensagem(res.mensagem);
      return;
    }

    setEdicoes((prev) => {
      const proximo = { ...prev };
      delete proximo[userId];
      return proximo;
    });
  }

  return (
    <div className="cpa-perfis-container">
      <form
        ref={formRef}
        action={formAction}
        className="cpa-perfis-upload"
        aria-label="Cadastrar novo usuário"
      >
        <Input
          name="nome"
          type="text"
          required
          placeholder="Nome completo do usuário"
          className="cpa-field"
        />

        <Input
          name="email"
          type="email"
          required
          placeholder="E-mail institucional"
          className="cpa-field"
        />

        <Input
          name="senha"
          type="password"
          minLength={6}
          required
          placeholder="Senha inicial (mín. 6)"
          className="cpa-field"
        />

        <select
          name="role"
          defaultValue="aluno"
          aria-label="Cargo do novo usuário"
          className="cpa-field cpa-select"
        >
          {OPCOES_PERFIL.map((op) => (
            <option key={op.valor} value={op.valor}>
              {op.rotulo}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          disabled={criando}
          className="cpa-btn cpa-btn--line"
          style={{ height: u(34), borderRadius: u(17), fontSize: u(13) }}
        >
          {criando ? "Criando..." : "Criar Usuário"}
        </Button>
      </form>

      {estadoCriacao && (
        <p
          role="status"
          style={{
            fontSize: u(13),
            marginTop: u(-4),
            color: estadoCriacao.ok ? "#0a6b0a" : "#b00000",
          }}
        >
          {estadoCriacao.mensagem}
        </p>
      )}

      <div className="cpa-perfis-head">
        <span>Usuários cadastrados no portal ({usuarios.length})</span>
        <span>
          {erroMensagem ? (
            <strong style={{ color: "#b00000", fontWeight: 400 }}>{erroMensagem}</strong>
          ) : (
            "Controle de acesso por perfil (RBAC)"
          )}
        </span>
      </div>

      <div className="cpa-perfis-list">
        {usuarios.map((usuario) => {
          const foiSalvo = salvoId === usuario.user_id;
          const estaSalvando = salvandoId === usuario.user_id;
          const confirmandoExclusao = confirmarExclusaoId === usuario.user_id;

          return (
            <div key={usuario.user_id} className="cpa-perfil-row cpa-perfil-row--crud">
              <div style={{ display: "flex", alignItems: "center", gap: u(8), minWidth: 0 }}>
                <UserRound aria-hidden style={{ width: u(18), height: u(18), flex: "none" }} />
                <Input
                  aria-label={`Nome de ${usuario.email}`}
                  value={usuario.nome}
                  onChange={(e) => alterarNome(usuario.user_id, e.target.value)}
                  className="cpa-field"
                  style={{ height: u(32), fontSize: u(13) }}
                />
              </div>

              <span
                title={usuario.email}
                style={{
                  color: "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: u(13),
                }}
              >
                {usuario.email}
              </span>

              <select
                aria-label={`Perfil de ${usuario.nome}`}
                value={usuario.role}
                onChange={(e) => alterarRole(usuario.user_id, e.target.value as PerfilCpa)}
                className="cpa-field cpa-select"
              >
                {OPCOES_PERFIL.map((op) => (
                  <option key={op.valor} value={op.valor}>
                    {op.rotulo}
                  </option>
                ))}
              </select>

              <Button
                type="button"
                disabled={estaSalvando}
                onClick={() => confirmarSalvamento(usuario)}
                className="cpa-btn cpa-btn--line"
                style={{ height: u(32), borderRadius: u(16), fontSize: u(12), gap: u(5) }}
              >
                {estaSalvando ? (
                  "..."
                ) : foiSalvo ? (
                  <>
                    <Check aria-hidden style={{ width: u(14), height: u(14) }} />
                    Salvo
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>

              <Button
                type="button"
                disabled={estaSalvando}
                onClick={() => handleExcluir(usuario.user_id)}
                className="cpa-btn cpa-btn--ghost"
                style={{
                  height: u(32),
                  borderRadius: u(16),
                  fontSize: u(12),
                  color: "#b00000",
                  gap: u(4),
                }}
                title="Excluir usuário"
              >
                <Trash2 aria-hidden style={{ width: u(14), height: u(14) }} />
                {confirmandoExclusao ? "Confirmar?" : "Excluir"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}