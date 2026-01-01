import { useState } from "react";

export type SearchFilter = {
  q?: string; spaceId?: string; boxId?: string; tags?: string[];
};

type Props = {
  spaces: {id:string; name:string}[];
  boxes: {id:string; name:string}[];
  allTags: string[];
  onChange: (f: SearchFilter) => void;
};

export function SearchFilters({ spaces, boxes, allTags, onChange }: Props) {
  const [q, setQ] = useState("");
  const [spaceId, setSpace] = useState<string|undefined>();
  const [boxId, setBox] = useState<string|undefined>();
  const [tags, setTags] = useState<string[]>([]);

  function toggleTag(t: string) {
    const next = tags.includes(t) ? tags.filter(x=>x!==t) : [...tags, t];
    setTags(next); onChange({ q, spaceId, boxId, tags: next });
  }

  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Sök..." value={q}
               onChange={e=>{ setQ(e.target.value); onChange({ q: e.target.value, spaceId, boxId, tags }); }} />
        <select className="input" value={spaceId||""}
                onChange={e=>{ const v=e.target.value||undefined; setSpace(v); onChange({ q, spaceId:v, boxId, tags }); }}>
          <option value="">Plats</option>
          {spaces.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="input" value={boxId||""}
                onChange={e=>{ const v=e.target.value||undefined; setBox(v); onChange({ q, spaceId, boxId:v, tags }); }}>
          <option value="">Låda</option>
          {boxes.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div className="flex flex-wrap gap-2">
          {allTags.map(t=> (
            <button key={t}
              onClick={()=>toggleTag(t)}
              className={`chip ${tags.includes(t) ? "bg-purple-500 text-white" : ""}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}