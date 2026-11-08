import { CATEGORIES, CATEGORY_META } from '../utils/categories'

const base =
  'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150'
const ghost = 'border-line bg-surface text-ink hover:bg-brand-soft'

// counts = { Food: 3, ... } for the selected month; total = all expenses in that month
export default function FilterBar({ activeFilter, onChange, counts, total }) {
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange('All')}
        aria-pressed={activeFilter === 'All'}
        className={`${base} ${activeFilter === 'All' ? 'border-brand bg-brand text-white dark:text-slate-950' : ghost}`}
      >
        All ({total})
      </button>
      {CATEGORIES.map((c) => {
        const m = CATEGORY_META[c]
        const active = activeFilter === c
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-pressed={active}
            className={`${base} ${active ? m.solid : ghost}`}
          >
            <span aria-hidden="true">{m.emoji}</span>
            {c} ({counts[c] || 0})
          </button>
        )
      })}
    </div>
  )
}
