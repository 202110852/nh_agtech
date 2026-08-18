interface FarmOption {
  id: string
  name: string
  count: number
}

export function FarmFilterChips({
  farms,
  selectedId,
  onSelect,
  allCount,
}: {
  farms: FarmOption[]
  selectedId: string | 'all'
  onSelect: (id: string | 'all') => void
  allCount: number
}) {
  if (farms.length <= 1) return null

  const items = [{ id: 'all' as const, name: '전체', count: allCount }, ...farms]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {items.map(({ id, name, count }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selectedId === id ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          {name}
          <span className="ml-1 text-xs opacity-70">({count})</span>
        </button>
      ))}
    </div>
  )
}
