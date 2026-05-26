'use client';

import { useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { getClientAuth, getClientApp } from '@/lib/firebase-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const EMAIL_KEY = 'upskilled:emailForSignIn';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SignInModal({ open, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Complete email link sign-in if this is the confirmation page
  useEffect(() => {
    if (!isSignInWithEmailLink(getClientAuth(), window.location.href)) return;
    const saved = localStorage.getItem(EMAIL_KEY);
    if (!saved) return;
    signInWithEmailLink(getClientAuth(), saved, window.location.href)
      .then((cred) => {
        localStorage.removeItem(EMAIL_KEY);
        return maybeCreateUserDoc(cred.user.uid, cred.user.email);
      })
      .catch((e) => setError(e.message));
  }, []);

  const signInGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
      await maybeCreateUserDoc(cred.user.uid, cred.user.email);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendLink = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await sendSignInLinkToEmail(getClientAuth(), email.trim(), {
        url: window.location.href,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email.trim());
      setSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in for unlimited generations</DialogTitle>
          <DialogDescription>
            Anonymous users get 3 generations per day. Sign in to remove the limit.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Google */}
          <button
            onClick={signInGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.08] disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <div className="h-px flex-1 bg-white/10" />
            or
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Email magic link */}
          {sent ? (
            <p className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Check your inbox — a sign-in link is on its way to <strong>{email}</strong>.
            </p>
          ) : (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendLink()}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:border-purple-500/50 focus:outline-none"
              />
              <button
                onClick={sendLink}
                disabled={loading || !email.trim()}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-40"
              >
                {loading ? 'Sending…' : 'Send sign-in link'}
              </button>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function maybeCreateUserDoc(uid: string, email: string | null) {
  try {
    const db = getFirestore(getClientApp());
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { email, createdAt: new Date() });
    }
  } catch {
    // Non-critical — user doc creation failure should not block sign-in
  }
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
