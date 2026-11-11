import { redirect } from "next/navigation";

export default function Raiz() {
  // Protótipo: a raiz abre a tela de login.
  redirect("/login");
}
