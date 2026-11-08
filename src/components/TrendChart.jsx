import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatINR, groupByDate } from '../utils/expenseUtils'

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-surface px-3 py-2 text-sm text-ink shadow-lg ring-1 ring-line">
      <p className="font-semibold">{label}</p>
      <p className="tabular-nums text-muted">{formatINR(payload[0].value)}</p>
    </div>
  )
}

export default function TrendChart({ expenses }) {
  // Last 30 days including zero-spend days, so the line shows real gaps
  const data = groupByDate(expenses, 30)
  const total = data.reduce((sum, d) => sum + d.total, 0)
  const average = Math.round(total / data.length)
  const tick = { fill: 'var(--color-muted)', fontSize: 12 }

  return (
    <section aria-labelledby="trend-title" className="rounded-2xl bg-surface p-5 shadow-md ring-1 ring-line">
      <h2 id="trend-title" className="text-xl font-semibold">30-Day Spending Trend</h2>
      <p className="mb-4 text-sm text-muted">Daily spending over the last 30 days</p>
      {total === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-muted">
          No spending in the last 30 days.
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-line)" />
              <XAxis dataKey="label" interval={4} tick={tick} tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} />
              <YAxis tick={tick} tickLine={false} axisLine={false} width={56} tickFormatter={(v) => '₹' + v.toLocaleString('en-IN')} />
              <Tooltip content={<TrendTooltip />} />
              <ReferenceLine
                y={average}
                stroke="var(--color-muted)"
                strokeDasharray="6 4"
                label={{ value: `Avg ${formatINR(average)}/day`, position: 'insideTopRight', fill: 'var(--color-muted)', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="total" stroke="var(--color-bar)" strokeWidth={2} dot={false} activeDot={{ r: 5 }} isAnimationActive={!reduceMotion} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
