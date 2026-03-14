interface Props {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, description, checked, onChange }: Props) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <div>
        <span className="text-sm font-medium text-navy-700">{label}</span>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-sky-500' : 'bg-gray-300'
        }`}
        onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </label>
  );
}
