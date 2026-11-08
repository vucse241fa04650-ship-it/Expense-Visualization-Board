import { CATEGORY_META } from './categories'
import {
  currentMonthString,
  formatINR,
  getCategoryTotals,
  getDailyTotals,
  getMonthlyExpenses,
  getTodaySpent,
  getTotalSpent,
  parseDate,
  previousMonth,
} from './expenseUtils'

const WEEKDAYS = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays']

const percent = (part, whole) => Math.round((part / whole) * 100)

/**
 * Builds up to 4 insight strings. Each check returns a string or null; the checks
 * are listed in priority order (alerts first, praise last), so slicing the first 4
 * non-null results keeps the most relevant ones.
 */
export function generateInsights(expenses, budget, activeMonth) {
  const monthExpenses = getMonthlyExpenses(expenses, activeMonth)
  const monthTotal = getTotalSpent(monthExpenses)
  const isCurrentMonth = activeMonth === currentMonthString()

  const checks = [
    // 3. Budget usage (highest priority: the user may need to act)
    () => {
      if (!(budget > 0) || monthTotal === 0) return null
      const used = percent(monthTotal, budget)
      if (monthTotal > budget) return `🚨 Monthly budget exceeded by ${formatINR(monthTotal - budget)}`
      if (used >= 80) return `⚠️ You've used ${used}% of your monthly budget`
      return null
    },

    // 1. Top category and its share of the month
    () => {
      if (monthTotal === 0) return null
      const totals = getCategoryTotals(monthExpenses)
      const [name, value] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]
      return `${CATEGORY_META[name].emoji} ${name} is your biggest expense — ${formatINR(value)} (${percent(value, monthTotal)}% of total)`
    },

    // 2. Last 7 days vs the 7 days before (rolling window ending today)
    () => {
      if (!isCurrentMonth) return null
      const days = Object.values(getDailyTotals(expenses, 14))
      const lastWeek = days.slice(0, 7).reduce((s, v) => s + v, 0)
      const thisWeek = days.slice(7).reduce((s, v) => s + v, 0)
      if (lastWeek === 0) return null
      const change = Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
      if (Math.abs(change) < 10) return null
      return change > 0
        ? `📈 Spending up ${change}% vs last week`
        : `📉 Spending down ${Math.abs(change)}% vs last week`
    },

    // 5. Category with the biggest growth vs last month (needs a non-zero baseline)
    () => {
      const prev = getCategoryTotals(getMonthlyExpenses(expenses, previousMonth(activeMonth)))
      const curr = getCategoryTotals(monthExpenses)
      let best = null
      for (const [name, value] of Object.entries(curr)) {
        if (!(prev[name] > 0)) continue
        const ratio = value / prev[name]
        if (ratio >= 1.25 && (!best || ratio > best.ratio)) best = { name, ratio }
      }
      if (!best) return null
      const text = best.ratio >= 1.9 && best.ratio <= 2.1
        ? 'doubled'
        : `grew ${Math.round((best.ratio - 1) * 100)}%`
      return `📊 ${best.name} spending ${text} vs last month`
    },

    // 4. Weekday with the highest total spend this month (needs a few data points)
    () => {
      if (monthExpenses.length < 3) return null
      const byWeekday = new Array(7).fill(0)
      for (const e of monthExpenses) byWeekday[parseDate(e.date).getDay()] += e.amount
      const top = byWeekday.indexOf(Math.max(...byWeekday))
      return `📅 You spend most on ${WEEKDAYS[top]}`
    },

    // 6. Positive nudge: under half the budget by mid-month
    () => {
      if (!isCurrentMonth || !(budget > 0)) return null
      const dayOfMonth = new Date().getDate()
      return dayOfMonth >= 15 && monthTotal < budget * 0.5
        ? "🏆 Great job! You're on track this month"
        : null
    },

    // 7. Nothing logged today
    () => (isCurrentMonth && getTodaySpent(expenses) === 0 ? '✅ No spending recorded today' : null),
  ]

  return checks
    .map((run) => run())
    .filter(Boolean)
    .slice(0, 4)
}
