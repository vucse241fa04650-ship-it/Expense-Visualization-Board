import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import { CATEGORY_META } from '../utils/categories'
import { formatINR, getTotalSpent, groupByCategory, groupByDate } from '../utils/expenseUtils'

const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const tooltipBox = 'rounded-xl bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-lg ring-1 ring-line'

function PieTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className={tooltipBox}>
      {name}: {formatINR(value)} ({total ? Math.round((value / total) * 100) : 0}%)
    </div>
  )
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className={tooltipBox}>
      <p>{label}</p>
      <p className="tabular-nums text-muted">{formatINR(payload[0].value)}</p>
    </div>
  )
}

function Panel({ title, subtitle, className = '', children }) {
  return (
    <div className={`rounded-2xl bg-surface p-5 shadow-md ring-1 ring-line ${className}`}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mb-4 text-sm text-muted">{subtitle}</p>
      {children}
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-muted">
      {text}
    </div>
  )
}

// monthExpenses feeds the pie (selected month); expenses feeds the 7-day bar (always the last 7 days)
export default function ChartsSection({ monthExpenses, expenses }) {
  const pieData = groupByCategory(monthExpenses)
  const monthTotal = getTotalSpent(monthExpenses)
  const barData = groupByDate(expenses, 7)
  const hasWeek = barData.some((d) => d.total > 0)
  const showPie = pieData.length !== 1 // one category = a full circle says nothing, so show the bar only
  const tick = { fill: 'var(--color-muted)', fontSize: 12 }

  return (
    <section aria-label="Charts" className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {showPie && (
        <Panel title="By category" subtitle="Share of this month's spending">
          {pieData.length === 0 ? (
            <Empty text="No expenses this month yet." />
          ) : (
            <div className="relative h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="var(--color-surface)"
                    strokeWidth={2}
                    isAnimationActive={!reduceMotion}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={CATEGORY_META[d.name].cssVar} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip total={monthTotal} />} />
                  <Legend iconType="circle" formatter={(v) => <span className="text-ink">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
              <p className="pointer-events-none absolute inset-x-0 top-[calc(50%-36px)] text-center text-sm font-semibold text-muted">
                By Category
              </p>
            </div>
          )}
        </Panel>
      )}

      <Panel title="Last 7 days" subtitle="Daily spending" className={showPie ? '' : 'md:col-span-2'}>
        {!hasWeek ? (
          <Empty text="No spending in the last 7 days." />
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--color-line)" />
                <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={{ stroke: 'var(--color-line)' }} />
                <YAxis
                  tick={tick}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => '₹' + v.toLocaleString('en-IN')}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--color-brand-soft)' }} />
                <Bar
                  dataKey="total"
                  name="Spent"
                  fill="var(--color-bar)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={!reduceMotion}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </section>
  )
}
