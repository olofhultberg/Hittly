import React, { useEffect, useState } from "react";
import { spacesApi } from "../../services/api";
import type { SpaceDto, CreateSpaceDto } from "../../types/api";
import { ApiError } from "../../services/api";

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");

  useEffect(() => {
    loadSpaces();
  }, []);

  async function loadSpaces() {
    try {
      setLoading(true);
      setError(null);
      const data = await spacesApi.getAll();
      setSpaces(data);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    try {
      setError(null);
      const createDto: CreateSpaceDto = { name: newSpaceName.trim() };
      await spacesApi.create(createDto);
      setNewSpaceName("");
      setShowCreateForm(false);
      await loadSpaces();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid skapande av utrymme");
      }
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Är du säker på att du vill ta bort detta utrymme?")) {
      return;
    }

    try {
      setError(null);
      await spacesApi.delete(id);
      await loadSpaces();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid borttagning");
      }
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="text-slate-600">Laddar utrymmen...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Utrymmen</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
        >
          {showCreateForm ? "Avbryt" : "+ Nytt utrymme"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreate} className="mb-6 card p-4">
          <h2 className="mb-3 text-lg font-semibold">Skapa nytt utrymme</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              placeholder="Namn på utrymme"
              className="input flex-1"
              required
              maxLength={100}
            />
            <button type="submit" className="btn-primary">
              Skapa
            </button>
          </div>
        </form>
      )}

      {spaces.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <p>Inga utrymmen ännu. Skapa ditt första utrymme!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <div key={space.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{space.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Skapad: {new Date(space.createdAt).toLocaleDateString("sv-SE")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(space.id)}
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


