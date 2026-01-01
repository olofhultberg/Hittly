import { StatCard } from "../../components/components/StatCard";
import React, { useEffect, useState } from "react";
import { spacesApi, boxesApi, itemsApi } from "../../services/api";
import type { SpaceDto, BoxDto, ItemDto } from "../../types/api";

export default function DashboardPage() {
  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [boxes, setBoxes] = useState<BoxDto[]>([]);
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [spacesData, boxesData, itemsData] = await Promise.all([
          spacesApi.getAll(),
          boxesApi.getAll(),
          itemsApi.getAll(),
        ]);
        setSpaces(spacesData);
        setBoxes(boxesData);
        setItems(itemsData);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Ett fel uppstod");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="text-slate-600">Laddar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="rounded bg-red-50 p-3 text-red-700">{error}</div>
      </div>
    );
  }

  // Get recent items (last 10)
  const recentItems = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // Helper to get box name by id
  const getBoxName = (boxId: number) => {
    const box = boxes.find(b => b.id === boxId);
    return box?.name || "-";
  };

  // Helper to get space name by id
  const getSpaceName = (spaceId: number) => {
    const space = spaces.find(s => s.id === spaceId);
    return space?.name || "-";
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lådor" value={boxes.length} tone="purple" />
        <StatCard label="Utrymmen" value={spaces.length} tone="blue" />
        <StatCard label="Objekt" value={items.length} tone="green" />
        <StatCard label="Taggar" value={new Set(items.flatMap(i => i.tags.map(t => t.id))).size} tone="amber" />
      </div>

      <div className="mt-6 card p-4">
        <h2 className="mb-3 text-lg font-semibold">Senast tillagda objekt</h2>
        <div className="overflow-x-auto">
          {recentItems.length === 0 ? (
            <p className="text-slate-500">Inga objekt ännu</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Namn</th>
                  <th>Låda</th>
                  <th>Utrymme</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="py-2">{item.name || "-"}</td>
                    <td>{getBoxName(item.boxId)}</td>
                    <td>{getSpaceName(item.spaceId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}