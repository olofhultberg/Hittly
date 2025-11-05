import { Logo } from "./Logo";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <div className="flex items-center gap-2">
          <button className="btn-ghost">Hjälp</button>
          <button className="btn-ghost">Min profil</button>
        </div>
      </div>
    </header>
  );
}