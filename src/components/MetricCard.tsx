interface Props {
  label: string;
  value: string;
  sublabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export function MetricCard({ label, value, sublabel, variant = 'default' }: Props) {
  const borderColors = {
    default: 'border-gray-200',
    success: 'border-emerald-300',
    warning: 'border-amber-300',
    info: 'border-sky-300',
  };
  return (
    <div className={`bg-white rounded-lg border-2 ${borderColors[variant]} p-4`}>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-navy-800 font-mono">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}
