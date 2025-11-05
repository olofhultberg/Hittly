import { Logo } from "./Logo";
import { NavLink } from "react-router-dom";

const linkBase = "block rounded-md px-3 py-2 text-sm";
const linkActive = "bg-indigo-50 text-indigo-700";
const linkIdle = "text-slate-700 hover:bg-slate-100";

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 p-4">
      <div className="mb-6 px-1"><Logo /></div>
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Dashboard</NavLink>
        <NavLink to="/search" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Sök grejer</NavLink>
        <NavLink to="/invite" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Bjud in gäster</NavLink>
      </nav>
    </aside>
  );
}