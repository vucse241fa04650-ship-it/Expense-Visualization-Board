import { Trash2 } from 'lucide-react'
import { CATEGORY_META } from '../utils/categories'
import { formatDate, formatINR } from '../utils/expenseUtils'

const MAX_DESCRIPTION = 30

export default function ExpenseItem({ expense, onDelete }) {
  const { id, amount, category, description, date } = expense
  const m = CATEGORY_META[category] ?? CATEGORY_META.Other
  const shortDescription =
    description.length > MAX_DESCRIPTION ? description.slice(0, MAX_DESCRIPTION) + '…' : description

  return (
    <li className="group flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-line transition duration-150 hover:-translate-y-0.5 hover:shadow-md sm:gap-4 sm:p-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${m.tint}`} aria-hidden="true">
        {m.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold" title={description}>{shortDescription}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-ink ${m.tint}`}>
            <span className={`h-2 w-2 rounded-full ${m.dot}`} aria-hidden="true" />
            {category}
          </span>
          <time dateTime={date}>{formatDate(date)}</time>
        </div>
      </div>
      <p className="text-right text-lg font-bold tabular-nums text-red-600 dark:text-red-400">{formatINR(amount)}</p>
      {/* Always visible on touch screens; revealed on hover/focus on desktop */}
      <button
        type="button"
        onClick={() => onDelete(id)}
        aria-label={`Delete ${description}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted transition duration-150 hover:bg-danger-soft hover:text-danger focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
      >
        <Trash2 className="h-5 w-5" aria-hidden="true" />
      </button>
    </li>
  )
}
