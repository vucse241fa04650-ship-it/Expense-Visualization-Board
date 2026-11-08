import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import { CATEGORIES } from '../utils/categories'
import { todayString } from '../utils/expenseUtils'

const field =
  'min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-muted transition-colors duration-150 hover:border-brand focus:border-brand'

const emptyForm = () => ({ amount: '', category: '', description: '', date: todayString() })

export default function AddExpenseForm({ onAdd }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!(amount > 0)) return setError('Enter an amount greater than ₹0.')
    if (!form.category) return setError('Choose a category.')
    if (!form.date) return setError('Pick a date.')

    onAdd({
      id: Date.now(),
      amount,
      category: form.category,
      description: form.description.trim() || form.category,
      date: form.date,
    })
    setForm(emptyForm())
    setError('')
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="add-title"
      className="rounded-2xl bg-surface p-4 shadow-md ring-1 ring-line sm:p-6"
    >
      <h2 id="add-title" className="mb-4 text-xl font-semibold">Add an expense</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr_1fr]">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Amount (₹)
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            value={form.amount}
            onChange={update('amount')}
            placeholder="e.g. 250"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <select value={form.category} onChange={update('category')} className={field}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2 lg:col-span-1">
          Description
          <input
            type="text"
            value={form.description}
            onChange={update('description')}
            placeholder="Lunch with friends"
            maxLength={80}
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2 lg:col-span-1">
          Date
          <input type="date" value={form.date} onChange={update('date')} className={field} />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="alert" className="flex min-h-6 items-center gap-2 text-sm font-medium text-danger">
          {error && (
            <>
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </>
          )}
        </p>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white transition-colors duration-150 hover:bg-brand-strong active:scale-[0.98] dark:text-slate-950"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          Add expense
        </button>
      </div>
    </form>
  )
}
