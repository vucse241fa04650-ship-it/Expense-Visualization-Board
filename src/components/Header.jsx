import { LogOut, Moon, Sun, Wallet } from 'lucide-react'

const iconButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/20 px-4 text-sm font-semibold transition-colors duration-150 hover:bg-white/30 dark:bg-black/10 dark:hover:bg-black/20'

export default function Header({ darkMode, toggleDarkMode, activeMonth, setActiveMonth, user, onSignOut }) {
  return (
    <header className="bg-gradient-to-br from-brand-strong via-brand to-brand-2 pb-20 pt-8 text-white dark:text-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 dark:bg-black/10" aria-hidden="true">
            <Wallet className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Expense Tracker</h1>
            <p className="text-sm font-medium opacity-90">Track daily spending, see where it goes.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="sr-only sm:not-sr-only">Month</span>
            <input
              type="month"
              value={activeMonth}
              onChange={(e) => e.target.value && setActiveMonth(e.target.value)}
              className="min-h-11 rounded-xl bg-surface px-3 text-base text-ink"
            />
          </label>
          <button
            type="button"
            onClick={toggleDarkMode}
            aria-pressed={darkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={iconButton}
          >
            {darkMode ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full ring-2 ring-white/60" />
          )}
          <button
            type="button"
            onClick={onSignOut}
            aria-label={`Sign out ${user?.displayName ?? ''}`.trim()}
            className={iconButton}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
