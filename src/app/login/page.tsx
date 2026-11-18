import type { Metadata } from "next";
import "@/app/cpa.css";
import { LoginForm } from "@/components/login-form";
import { box, size, u } from "@/lib/cpa-box";
export const metadata: Metadata = { title: "Login · Portal CPA" };

export default function PaginaLogin() {
  return (
    <div className="cpa-root cpa-root--login">
      <div className="cpa-stage">
        <main className="cpa-card cpa-center" style={size(583, 300)}>
          <h1
            style={box(181, 21, 221, 56, {
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: u(32),
              fontWeight: 400,
              color: "#000000",
            })}
          >
            Login - CPA
          </h1>

          <LoginForm />
        </main>
      </div>
    </div>
  );
}
