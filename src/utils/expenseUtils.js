import { CATEGORIES } from './categories'

const pad = (n) => String(n).padStart(2, '0')

// Local-time YYYY-MM-DD (avoids the UTC shift of toISOString)
export const toDateString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayString = () => toDateString(new Date())

// Current month as "YYYY-MM" (local time)
export const currentMonthString = () => todayString().slice(0, 7)

// Parse "YYYY-MM-DD" as a local date
export const parseDate = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const formatINR = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// "2026-11-08" -> "08 Nov 2026"
export const formatDate = (s) => {
  const d = parseDate(s)
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// "2026-11-08" -> "08 Nov"
export const formatShortDate = (s) => formatDate(s).slice(0, 6)

// "2026-11" -> "November 2026"
export const formatMonthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS_LONG[m - 1]} ${y}`
}

// "2026-01" -> "2025-12"
export const previousMonth = (ym) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

export const getTotalSpent = (expenses) =>
  expenses.reduce((sum, e) => sum + e.amount, 0)

export const getCategoryTotals = (expenses) =>
  expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {})

export const getTopCategory = (expenses) => {
  const entries = Object.entries(getCategoryTotals(expenses))
  if (entries.length === 0) return null
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0]
}

export const getTodaySpent = (expenses) => {
  const today = todayString()
  return getTotalSpent(expenses.filter((e) => e.date === today))
}

// Expenses whose date falls in month "YYYY-MM"
export const getMonthlyExpenses = (expenses, month) =>
  expenses.filter((e) => e.date.startsWith(month))

export const getMonthlyTotal = (expenses, month) =>
  getTotalSpent(getMonthlyExpenses(expenses, month))

// Last N days (ending today), zero-filled: { "2026-11-08": 340, "2026-11-07": 0, ... }
// Keys are inserted oldest -> newest, so Object.entries keeps chronological order.
export const getDailyTotals = (expenses, days = 30) => {
  const sums = {}
  for (const e of expenses) sums[e.date] = (sums[e.date] || 0) + e.amount

  const result = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateString(d)
    result[key] = sums[key] || 0
  }
  return result
}

// Pie data: [{ name, value }] for categories with spend, in fixed category order
export const groupByCategory = (expenses) => {
  const totals = getCategoryTotals(expenses)
  return CATEGORIES.filter((c) => totals[c] > 0).map((c) => ({
    name: c,
    value: totals[c],
  }))
}

// Bar/line data: last N days as [{ date, label, total }] (oldest first)
export const groupByDate = (expenses, lastNDays = 7) =>
  Object.entries(getDailyTotals(expenses, lastNDays)).map(([date, total]) => ({
    date,
    label: formatShortDate(date),
    total,
  }))
