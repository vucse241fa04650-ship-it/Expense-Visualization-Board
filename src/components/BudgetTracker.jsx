import { useState } from 'react'
import { Check, FileDown, Pencil, X } from 'lucide-react'
import { exportMonthlyPDF } from '../utils/exportUtils'
import { formatINR, formatMonthLabel } from '../utils/expenseUtils'

// Static class strings so Tailwind can see them. Thresholds follow the brief:
// <60 green, 60-80 yellow, 80-100 orange, 100+ red.
const BAR_STYLES = {
  green: '[&::-webkit-progress-value]:bg-green-500 [&::-moz-progress-bar]:bg-green-500',
  yellow: '[&::-webkit-progress-value]:bg-yellow-400 [&::-moz-progress-bar]:bg-yellow-400',
  orange: '[&::-webkit-progress-value]:bg-orange-500 [&::-moz-progress-bar]:bg-orange-500',
  red: '[&::-webkit-progress-value]:bg-red-600 [&::-moz-progress-bar]:bg-red-600',
}

const barTone = (pct) => (pct >= 100 ? 'red' : pct >= 80 ? 'orange' : pct >= 60 ? 'yellow' : 'green')

export default function BudgetTracker({ monthlyBudget, onSaveBudget, currentMonthTotal, month, expenses }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const hasBudget = monthlyBudget > 0
  const rawPct = hasBudget ? (currentMonthTotal / monthlyBudget) * 100 : 0
  const pct = Math.round(rawPct)
  const over = currentMonthTotal - monthlyBudget

  const startEdit = () => {
    setDraft(hasBudget ? String(monthlyBudget) : '')
    setEditing(true)
  }

  const save = (e) => {
    e.preventDefault()
    const value = Number(draft)
    if (draft === '' || !(value >= 0)) return
    onSaveBudget(value)
    setEditing(false)
  }

  const handleExport = async () => {
    setExporting(true)
    setExportError('')
    try {
      await exportMonthlyPDF(expenses, month, monthlyBudget)
    } catch {
      setExportError('Could not create the PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <section aria-labelledby="budget-title" className="rounded-2xl bg-surface p-5 shadow-md ring-1 ring-line">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="budget-title" className="text-xl font-semibold">Monthly budget</h2>
          <p className="text-sm text-muted">{formatMonthLabel(month)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {editing ? (
            <form onSubmit={save} className="flex items-center gap-2">
              <label className="sr-only" htmlFor="budget-input">Monthly budget in rupees</label>
              <input
                id="budget-input"
                type="number"
                min="0"
                step="100"
                inputMode="numeric"
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. 5000"
                className="min-h-11 w-32 rounded-xl border border-line bg-surface px-3 text-base text-ink"
              />
              <button type="submit" aria-label="Save budget" className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-strong dark:text-slate-950">
                <Check className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setEditing(false)} aria-label="Cancel editing budget" className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-muted transition-colors hover:bg-brand-soft">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <button type="button" onClick={startEdit} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold transition-colors hover:bg-brand-soft">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {hasBudget ? `Budget ${formatINR(monthlyBudget)}` : 'Set budget'}
            </button>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60 dark:text-slate-950"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            {exporting ? 'Creating PDF…' : '📄 Export PDF Report'}
          </button>
        </div>
      </div>

      {hasBudget ? (
        <div className="mt-5">
          <progress
            value={Math.min(currentMonthTotal, monthlyBudget)}
            max={monthlyBudget}
            aria-label="Budget used"
            className={`h-3 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-line [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-500 ${BAR_STYLES[barTone(rawPct)]} bg-line`}
          />
          <p className="mt-2 text-sm font-medium tabular-nums">
            {formatINR(currentMonthTotal)} spent of {formatINR(monthlyBudget)} budget ({pct}%)
          </p>

          {rawPct >= 100 ? (
            <p role="alert" className="mt-3 rounded-xl border border-red-300 bg-red-100 p-3 text-sm font-semibold text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
              🚨 Budget Exceeded! You overspent by {formatINR(over)}
            </p>
          ) : rawPct >= 80 ? (
            <p role="alert" className="mt-3 rounded-xl border border-yellow-300 bg-yellow-100 p-3 text-sm font-semibold text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-100">
              ⚠️ Warning: You've used {pct}% of your budget!
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-line p-4 text-center text-muted">
          Set a budget above to track your monthly spending.
        </p>
      )}
      {exportError && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">{exportError}</p>
      )}
    </section>
  )
}
