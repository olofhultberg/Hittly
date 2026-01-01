import { useNavigate } from "react-router-dom";
import { Logo } from "./logo";
import { useAuth } from "../../contexts/AuthContext";

export function Topbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      // Error handled by AuthContext
    }
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo withText={false} />
        <div className="flex items-center gap-2">
          <button className="btn-ghost">Hjälp</button>
          <button className="btn-ghost">Min profil</button>
          <button onClick={handleLogout} className="btn-ghost">Logga ut</button>
        </div>
      </div>
    </header>
  );
}