// Picks a left-border color from the insight's leading emoji (alerts red/amber, praise green)
const toneFor = (text) => {
  if (text.startsWith('🚨')) return 'border-l-red-600'
  if (text.startsWith('⚠️')) return 'border-l-yellow-500'
  if (text.startsWith('🏆') || text.startsWith('✅')) return 'border-l-green-500'
  return 'border-l-brand'
}

export default function InsightsPanel({ insights }) {
  return (
    <section aria-labelledby="insights-title" className="rounded-2xl bg-surface p-5 shadow-md ring-1 ring-line">
      <h2 id="insights-title" className="mb-4 text-xl font-semibold">💡 Smart Insights</h2>
      {insights.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-4 text-center text-muted">
          Add expenses to see insights.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {insights.map((text) => (
            <li
              key={text}
              className={`animate-[fade-in_0.4s_ease-out] rounded-xl border-l-4 bg-brand-soft p-3 font-medium ${toneFor(text)}`}
            >
              {text}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
