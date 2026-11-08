import { IndianRupee, Trophy, CalendarDays } from 'lucide-react'
import { CATEGORY_META } from '../utils/categories'
import { formatINR, getTopCategory, getTotalSpent } from '../utils/expenseUtils'

function Card({ icon: Icon, label, value, accent, iconBg }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border-l-4 bg-surface p-5 shadow-md ring-1 ring-line transition-shadow duration-200 hover:shadow-lg ${accent}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`} aria-hidden="true">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted">{label}</p>
        <p className="break-words text-xl font-bold tabular-nums lg:text-2xl">{value}</p>
      </div>
    </div>
  )
}

// monthExpenses = expenses in the selected month; todaySpent ignores the month picker
export default function SummaryCards({ monthExpenses, todaySpent }) {
  const top = getTopCategory(monthExpenses)

  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card
        icon={IndianRupee}
        label="Total spent (this month)"
        value={formatINR(getTotalSpent(monthExpenses))}
        accent="border-l-cat-food"
        iconBg="bg-cat-food/15 text-ink"
      />
      <Card
        icon={Trophy}
        label="Top category"
        value={top ? `${CATEGORY_META[top].emoji} ${top}` : 'None yet'}
        accent="border-l-cat-education"
        iconBg="bg-cat-education/15 text-ink"
      />
      <Card
        icon={CalendarDays}
        label="Today's spend"
        value={formatINR(todaySpent)}
        accent="border-l-cat-travel"
        iconBg="bg-cat-travel/15 text-ink"
      />
    </section>
  )
}
