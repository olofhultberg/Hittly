import { Logo } from "./logo";
import { NavLink } from "react-router-dom";

const linkBase = "block rounded-md px-3 py-2 text-sm";
const linkActive = "bg-purple-50 text-purple-700";
const linkIdle = "text-slate-700 hover:bg-slate-100";

export function SideBar() {
  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 p-4">
     
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Dashboard</NavLink>
        <NavLink to="/spaces" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Utrymmen</NavLink>
        <NavLink to="/boxes" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Lådor</NavLink>
        <NavLink to="/items" className={({isActive}) => `${linkBase} ${isActive?linkActive:linkIdle}`}>Objekt</NavLink>
      </nav>
    </aside>
  );
}