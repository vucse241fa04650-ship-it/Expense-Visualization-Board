import { useEffect, useState } from 'react'
import { getRedirectResult, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { AlertCircle, Wallet } from 'lucide-react'
import { auth, googleProvider, isFirebaseConfigured } from '../firebase'

const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export default function LoginScreen() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Report a failed sign-in that came back from a redirect (phones)
  useEffect(() => {
    if (!isFirebaseConfigured) return
    getRedirectResult(auth).catch((e) =>
      setError(`Sign-in failed (${e.code ?? 'unknown error'}). Check that Google sign-in is enabled in Firebase.`),
    )
  }, [])

  const handleSignIn = async () => {
    setError('')
    setBusy(true)
    try {
      // Popups are unreliable on phones (blocked, or lost in in-app browsers), so redirect there
      if (IS_MOBILE) {
        await signInWithRedirect(auth, googleProvider)
        return // the page navigates away
      }
      await signInWithPopup(auth, googleProvider)
    } catch (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request') {
        setError(`Sign-in failed (${e.code ?? 'unknown error'}). Check that Google sign-in is enabled in Firebase.`)
      }
    }
    setBusy(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-strong via-brand to-brand-2 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-6 text-center shadow-md ring-1 ring-line sm:p-8">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand" aria-hidden="true">
          <Wallet className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Expense Board</h1>
        <p className="mt-1 mb-6 text-muted">Sign in to keep your expenses saved to your account.</p>

        {!isFirebaseConfigured ? (
          <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft p-3 text-left text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Firebase keys are missing. Add them to the .env file (see .env.example) and restart the dev server.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            disabled={busy}
            className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-4 font-semibold text-ink transition-colors duration-150 hover:bg-brand-soft disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
              <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            {busy ? 'Signing in…' : 'Continue with Google'}
          </button>
        )}
        {error && (
          <p role="alert" className="mt-4 flex items-start gap-2 text-left text-sm font-medium text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
