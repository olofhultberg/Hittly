type Props = {
    name: string;
    imageUrl?: string;
    space: string;
    box: string;
    onClick?: () => void;
  };
  
  export function ResultItem({ name, imageUrl, space, box, onClick }: Props) {
    return (
      <button onClick={onClick} className="w-full text-left card p-4 hover:shadow transition">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-100">
            {imageUrl ? <img src={imageUrl} alt={name} className="h-full w-full object-cover" /> : null}
          </div>
          <div>
            <div className="text-lg font-medium">{name}</div>
            <div className="text-sm text-slate-600">Plats <span className="font-medium">{space}</span></div>
            <div className="text-sm text-slate-600">Låda <span className="font-medium">{box}</span></div>
          </div>
        </div>
      </button>
    );
  }