interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: JSX.Element
  color: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose'
  trend?: { value: number; label: string }
}

const colorMap = {
  blue: {
    bg: 'bg-blue-600/10',
    border: 'border-blue-600/20',
    icon: 'bg-blue-600/20 text-blue-400',
    text: 'text-blue-400',
  },
  violet: {
    bg: 'bg-violet-600/10',
    border: 'border-violet-600/20',
    icon: 'bg-violet-600/20 text-violet-400',
    text: 'text-violet-400',
  },
  emerald: {
    bg: 'bg-emerald-600/10',
    border: 'border-emerald-600/20',
    icon: 'bg-emerald-600/20 text-emerald-400',
    text: 'text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-600/10',
    border: 'border-amber-600/20',
    icon: 'bg-amber-600/20 text-amber-400',
    text: 'text-amber-400',
  },
  rose: {
    bg: 'bg-rose-600/10',
    border: 'border-rose-600/20',
    icon: 'bg-rose-600/20 text-rose-400',
    text: 'text-rose-400',
  },
}

export default function StatCard({ title, value, subtitle, icon, color, trend }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.icon} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
