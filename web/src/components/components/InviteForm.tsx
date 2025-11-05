import { useState } from "react";

type Invite = { name: string; email: string; role?: "viewer"|"editor" };
type Props = { onInvite: (inv: Invite) => void; };

export function InviteForm({ onInvite }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer"|"editor">("viewer");

  return (
    <form className="card p-4 space-y-3"
          onSubmit={(e)=>{ e.preventDefault(); onInvite({ name, email, role }); setName(""); setEmail(""); }}>
      <h2 className="text-lg font-semibold">Bjud in gäst</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="Namn" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="input" placeholder="E-post" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <select className="input" value={role} onChange={e=>setRole(e.target.value as any)}>
          <option value="viewer">Läs</option>
          <option value="editor">Läs & sök</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button className="btn-primary">Skicka inbjudan</button>
      </div>
    </form>
  );
}