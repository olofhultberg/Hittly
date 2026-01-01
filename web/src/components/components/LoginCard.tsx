import { useState } from "react";
import { Logo } from "./logo";

type Props = { 
  onSubmit: (email: string, pass: string) => void; 
  onRegister?: (email: string, pass: string) => void;
  loading?: boolean;
  error?: string | null;
  errorMessages?: string[];
};

export function LoginCard({ onSubmit, onRegister, loading, error, errorMessages = [] }: Props) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Show errorMessages if available, otherwise fall back to error string
  const displayErrors = errorMessages.length > 0 ? errorMessages : (error ? [error] : []);

  return (
    <div className="mx-auto max-w-md p-8 card">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo />
        <h1 className="text-2xl font-semibold">{isRegisterMode ? "Registrera" : "Logga in"}</h1>
      </div>
      {displayErrors.length > 0 && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {displayErrors.length === 1 ? (
            <div>{displayErrors[0]}</div>
          ) : (
            <ul className="list-disc list-inside space-y-1">
              {displayErrors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <form
        onSubmit={(e) => { 
          e.preventDefault(); 
          if (isRegisterMode && onRegister) {
            onRegister(email, pass);
          } else {
            onSubmit(email, pass);
          }
        }}
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
          {loading 
            ? (isRegisterMode ? "Registrerar..." : "Loggar in...") 
            : (isRegisterMode ? "Registrera" : "Logga in")}
        </button>
        {!isRegisterMode && (
          <button type="button" className="btn-ghost w-full">Glömt ditt lösenord?</button>
        )}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {isRegisterMode 
              ? "Har du redan ett konto? Logga in" 
              : "Har du inget konto? Registrera"}
          </button>
        </div>
      </form>
    </div>
  );
}