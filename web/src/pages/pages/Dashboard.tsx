import { StatCard } from "../../components/components/StatCard";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lådor" value={14} tone="purple" />
        <StatCard label="Platser" value={5} tone="blue" />
        <StatCard label="Saker" value={32} tone="green" />
        <StatCard label="Gäster" value={3} tone="amber" />
      </div>

      <div className="mt-6 card p-4">
        <h2 className="mb-3 text-lg font-semibold">Senast tillagda</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-2">Namn</th><th>Låda</th><th>Plats</th>
              </tr>
            </thead>
            <tbody>
              {[
                {name:"Julljus", box:"Låda 1", space:"Förråd"},
                {name:"Skruvdragare", box:"Låda 2", space:"Garage"},
              ].map((r,i)=>(
                <tr key={i} className="border-t">
                  <td className="py-2">{r.name ? r.name : "-"}</td>
                  <td>{r.box ? r.box : "-"}</td>
                  <td>{r.space ? r.space : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}