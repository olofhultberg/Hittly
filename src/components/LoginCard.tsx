import { useState } from "react";
import { Logo } from "./Logo";

type Props = { onSubmit: (email: string, pass: string) => void; loading?: boolean };

export function LoginCard({ onSubmit, loading }: Props) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="mx-auto max-w-md p-8 card">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo />
        <h1 className="text-2xl font-semibold">Logga in</h1>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(email, pass); }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm text-slate-700">E-postadress</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="du@exempel.se" required />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-700">Lösenord</label>
          <input className="input" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>
        <button type="button" className="btn-ghost w-full">Glömt ditt lösenord?</button>
      </form>
    </div>
  );
}