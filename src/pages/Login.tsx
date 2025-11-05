import { LoginCard } from "../components/LoginCard";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50">
      <LoginCard onSubmit={(e,p)=>alert(`Demo login: ${e}`)} />
    </div>
  );
}