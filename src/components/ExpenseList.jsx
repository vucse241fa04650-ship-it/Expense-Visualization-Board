import ExpenseItem from './ExpenseItem'
import { formatINR, getTotalSpent } from '../utils/expenseUtils'

export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-line bg-surface px-4 py-12 text-center">
        <p className="text-lg font-semibold">No expenses found 💸</p>
        <p className="text-muted">Try adding one above</p>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted">
        <p aria-live="polite">{expenses.length} {expenses.length === 1 ? 'Expense' : 'Expenses'}</p>
        <p className="tabular-nums">Total {formatINR(getTotalSpent(expenses))}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {expenses.map((e) => (
          <ExpenseItem key={e.id} expense={e} onDelete={onDelete} />
        ))}
      </ul>
    </div>
  )
}
