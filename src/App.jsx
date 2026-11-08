import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { AlertCircle } from 'lucide-react'
import { auth, db, isFirebaseConfigured } from './firebase'
import Header from './components/Header'
import LoginScreen from './components/LoginScreen'
import BudgetTracker from './components/BudgetTracker'
import SummaryCards from './components/SummaryCards'
import ChartsSection from './components/ChartsSection'
import TrendChart from './components/TrendChart'
import InsightsPanel from './components/InsightsPanel'
import AddExpenseForm from './components/AddExpenseForm'
import FilterBar from './components/FilterBar'
import ExpenseList from './components/ExpenseList'
import { getMonthlyExpenses, getTodaySpent, getTotalSpent, currentMonthString } from './utils/expenseUtils'
import { generateInsights } from './utils/insightUtils'

const DEFAULT_BUDGET = 5000

// Dark mode is a per-device preference: saved locally, falls back to the OS setting
function loadDarkMode() {
  try {
    const saved = localStorage.getItem('ng_darkmode')
    if (saved !== null) return saved === 'true'
  } catch {
    /* storage blocked: use the OS setting */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  // undefined = still checking auth, null = signed out, object = signed in
  const [user, setUser] = useState(isFirebaseConfigured ? undefined : null)
  const [expenses, setExpenses] = useState([])
  const [monthlyBudget, setMonthlyBudget] = useState(DEFAULT_BUDGET)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(loadDarkMode)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeMonth, setActiveMonth] = useState(currentMonthString)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, setUser)
  }, [])

  // Toggle the `dark` class on <html> and remember the choice
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    try {
      localStorage.setItem('ng_darkmode', String(darkMode))
    } catch {
      /* ignore */
    }
  }, [darkMode])

  // Live-sync this user's expenses from Firestore
  useEffect(() => {
    if (!user) return
    return onSnapshot(
      collection(db, 'users', user.uid, 'expenses'),
      (snap) => {
        setExpenses(snap.docs.map((d) => d.data()))
        setLoadingData(false)
        setError('')
      },
      (e) => {
        setLoadingData(false)
        setError(`Could not load expenses (${e.code}). Check your Firestore rules.`)
      },
    )
  }, [user])

  // Live-sync the monthly budget (falls back to the default until the user sets one)
  useEffect(() => {
    if (!user) return
    return onSnapshot(
      doc(db, 'users', user.uid, 'settings', 'budget'),
      (snap) => setMonthlyBudget(snap.exists() ? Number(snap.data().monthlyBudget) || 0 : DEFAULT_BUDGET),
      (e) => setError(`Could not load your budget (${e.code}). Check your Firestore rules.`),
    )
  }, [user])

  const addExpense = async (expense) => {
    try {
      await setDoc(doc(db, 'users', user.uid, 'expenses', String(expense.id)), expense)
    } catch (e) {
      setError(`Could not save the expense (${e.code}).`)
    }
  }

  const deleteExpense = async (id) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'expenses', String(id)))
    } catch (e) {
      setError(`Could not delete the expense (${e.code}).`)
    }
  }

  const saveBudget = async (value) => {
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'budget'), { monthlyBudget: value })
    } catch (e) {
      setError(`Could not save your budget (${e.code}).`)
    }
  }

  const handleSignOut = () => {
    setExpenses([])
    setLoadingData(true)
    setActiveFilter('All')
    signOut(auth)
  }

  // Everything below depends on the selected month
  const monthExpenses = useMemo(() => getMonthlyExpenses(expenses, activeMonth), [expenses, activeMonth])
  const monthTotal = getTotalSpent(monthExpenses)
  const categoryCounts = useMemo(
    () => monthExpenses.reduce((acc, e) => ({ ...acc, [e.category]: (acc[e.category] || 0) + 1 }), {}),
    [monthExpenses],
  )
  const insights = useMemo(
    () => generateInsights(expenses, monthlyBudget, activeMonth),
    [expenses, monthlyBudget, activeMonth],
  )

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted" role="status">
        Loading…
      </div>
    )
  }
  if (!user) return <LoginScreen />

  const filteredExpenses = (
    activeFilter === 'All' ? monthExpenses : monthExpenses.filter((e) => e.category === activeFilter)
  )
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)

  return (
    <div className="min-h-screen bg-page text-ink transition-colors duration-300">
      <Header
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode((d) => !d)}
        activeMonth={activeMonth}
        setActiveMonth={setActiveMonth}
        user={user}
        onSignOut={handleSignOut}
      />
      <main className="mx-auto -mt-10 flex max-w-6xl flex-col gap-6 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] sm:px-6">
        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-2xl bg-danger-soft p-4 text-sm font-medium text-danger shadow-md">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
        <BudgetTracker
          monthlyBudget={monthlyBudget}
          onSaveBudget={saveBudget}
          currentMonthTotal={monthTotal}
          month={activeMonth}
          expenses={expenses}
        />
        <SummaryCards monthExpenses={monthExpenses} todaySpent={getTodaySpent(expenses)} />
        <ChartsSection monthExpenses={monthExpenses} expenses={expenses} />
        <TrendChart expenses={expenses} />
        <InsightsPanel insights={insights} />
        <AddExpenseForm onAdd={addExpense} />
        <section aria-labelledby="history-title" className="flex flex-col gap-4">
          <h2 id="history-title" className="text-xl font-semibold">Transactions</h2>
          <FilterBar
            activeFilter={activeFilter}
            onChange={setActiveFilter}
            counts={categoryCounts}
            total={monthExpenses.length}
          />
          {loadingData ? (
            <p role="status" className="py-8 text-center text-muted">Loading your expenses…</p>
          ) : (
            <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />
          )}
        </section>
      </main>
    </div>
  )
}
