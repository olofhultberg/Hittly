import React, { useEffect, useState } from "react";
import { itemsApi, boxesApi, spacesApi } from "../../services/api";
import type { ItemDto, CreateItemDto, BoxDto, SpaceDto } from "../../types/api";
import { ApiError } from "../../services/api";

export default function ItemsPage() {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [boxes, setBoxes] = useState<BoxDto[]>([]);
  const [spaces, setSpaces] = useState<SpaceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newItem, setNewItem] = useState<CreateItemDto>({
    name: "",
    description: "",
    spaceId: 0,
    boxId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [itemsData, boxesData, spacesData] = await Promise.all([
        itemsApi.getAll(),
        boxesApi.getAll(),
        spacesApi.getAll(),
      ]);
      setItems(itemsData);
      setBoxes(boxesData);
      setSpaces(spacesData);
      if (boxesData.length > 0 && newItem.boxId === 0) {
        const firstBox = boxesData[0];
        setNewItem({
          ...newItem,
          boxId: firstBox.id,
          spaceId: firstBox.spaceId,
        });
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Ett fel uppstod");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim() || newItem.boxId === 0) return;

    try {
      setError(null);
      await itemsApi.create(newItem);
      const firstBox = boxes[0];
      setNewItem({
        name: "",
        description: "",
        spaceId: firstBox?.spaceId || 0,
        boxId: firstBox?.id || 0,
      });
      setShowCreateForm(false);
      await loadData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid skapande av objekt");
      }
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Är du säker på att du vill ta bort detta objekt?")) {
      return;
    }

    try {
      setError(null);
      await itemsApi.delete(id);
      await loadData();
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ett fel uppstod vid borttagning");
      }
    }
  }

  const getBoxName = (boxId: number) => {
    const box = boxes.find((b) => b.id === boxId);
    return box?.name || "Okänt";
  };

  const getSpaceName = (spaceId: number) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space?.name || "Okänt";
  };

  // Update spaceId when box changes
  const handleBoxChange = (boxId: number) => {
    const box = boxes.find((b) => b.id === boxId);
    if (box) {
      setNewItem({
        ...newItem,
        boxId: box.id,
        spaceId: box.spaceId,
      });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <div className="text-slate-600">Laddar objekt...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Objekt</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
          disabled={boxes.length === 0}
        >
          {showCreateForm ? "Avbryt" : "+ Nytt objekt"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {boxes.length === 0 && (
        <div className="mb-4 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
          Du måste skapa minst en låda innan du kan skapa objekt.
        </div>
      )}

      {showCreateForm && boxes.length > 0 && (
        <form onSubmit={handleCreate} className="mb-6 card p-4">
          <h2 className="mb-3 text-lg font-semibold">Skapa nytt objekt</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-slate-700">Namn</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Namn på objekt"
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">
                Beskrivning
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Beskrivning (valfritt)"
                className="input w-full"
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-700">Låda</label>
              <select
                value={newItem.boxId}
                onChange={(e) => handleBoxChange(parseInt(e.target.value))}
                className="input w-full"
                required
              >
                <option value={0}>Välj låda</option>
                {boxes.map((box) => (
                  <option key={box.id} value={box.id}>
                    {box.name} ({getSpaceName(box.spaceId)})
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

      {items.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          <p>Inga objekt ännu. Skapa ditt första objekt!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-600">
                      {item.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-slate-500">
                    Låda: {getBoxName(item.boxId)}
                  </p>
                  <p className="text-sm text-slate-500">
                    Utrymme: {getSpaceName(item.spaceId)}
                  </p>
                  {item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-700"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
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


