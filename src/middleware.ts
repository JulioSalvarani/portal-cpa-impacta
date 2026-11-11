import { NextResponse } from "next/server";

/**
 * PROTÓTIPO VISUAL: este middleware não faz nada (deixa passar todas as rotas).
 * Substitui a versão anterior, que redirecionava por cookie de sessão.
 * Quando for implementar a autenticação, escreva a proteção de rotas aqui
 * (ou apague este arquivo se não precisar).
 */
export function middleware() {
  return NextResponse.next();
}
