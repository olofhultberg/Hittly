import React, { useEffect, useState } from "react";
import { boxesApi, spacesApi } from "../../services/api";
import type { BoxDto, CreateBoxDto, SpaceDto } from "../../types/api";
import { ApiError } from "../../services/api";

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<BoxDto[]>([]);
  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBox, setNewBox] = useState<CreateBoxDto>({
    name: "",
    spaceId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [boxesData, spacesData] = await Promise.all([
        boxesApi.getAll(),
        spacesApi.getAll(),
      ]);
      setBoxes(boxesData);
      setSpaces(spacesData);
      if (spacesData.length > 0 && newBox.spaceId === 0) {
        setNewBox({ ...newBox, spaceId: spacesData[0].id });
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newBox.name.trim() || newBox.spaceId === 0) return;

    try {
      setError(null);
      await boxesApi.create(newBox);
      setNewBox({ name: "", spaceId: spaces[0]?.id || 0 });
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid skapande av låda");
      }
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Är du säker på att du vill ta bort denna låda?")) {
      return;
    }

    try {
      setError(null);
      await boxesApi.delete(id);
      await loadData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid borttagning");
      }
    }
  }

  const getSpaceName = (spaceId: number) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space?.name || "Okänt";
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="text-slate-600">Laddar lådor...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lådor</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
          disabled={spaces.length === 0}
        >
          {showCreateForm ? "Avbryt" : "+ Ny låda"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {spaces.length === 0 && (
        <div className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          Du måste skapa minst ett utrymme innan du kan skapa lådor.
        </div>
      )}

      {showCreateForm && spaces.length > 0 && (
        <form onSubmit={handleCreate} className="mb-6 card p-4">
          <h2 className="mb-3 text-lg font-semibold">Skapa ny låda</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Namn</label>
              <input
                type="text"
                value={newBox.name}
                onChange={(e) => setNewBox({ ...newBox, name: e.target.value })}
                placeholder="Namn på låda"
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Utrymme</label>
              <select
                value={newBox.spaceId}
                onChange={(e) =>
                  setNewBox({ ...newBox, spaceId: parseInt(e.target.value) })
                }
                className="input w-full"
                required
              >
                <option value={0}>Välj utrymme</option>
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Skapa
              </button>
            </div>
          </div>
        </form>
      )}

      {boxes.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <p>Inga lådor ännu. Skapa din första låda!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boxes.map((box) => (
            <div key={box.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{box.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Utrymme: {getSpaceName(box.spaceId)}
                  </p>
                  {box.labelCode && (
                    <p className="mt-1 text-xs text-slate-400">
                      Kod: {box.labelCode}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(box.id)}
                  className="btn-ghost text-red-600 hover:text-red-700"
                  title="Ta bort"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


