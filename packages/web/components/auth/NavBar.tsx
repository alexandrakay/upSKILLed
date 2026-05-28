'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { SignInModal } from './SignInModal';

export function NavBar() {
  const { user, loading, signOut } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0a0a0a]/80 px-6 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold text-neutral-100 tracking-tight">
          up<span className="text-purple-400">SKILLED</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/how-it-works"
            className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
          >
            How it works
          </Link>
          {!loading && (
            user ? (
              <>
                <Link
                  href="/skills"
                  className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
                >
                  My Skills
                </Link>
                <span className="hidden text-xs text-neutral-500 sm:block">
                  {user.email ?? user.displayName}
                </span>
                <button
                  onClick={() => signOut()}
                  className="rounded-md px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.08]"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </nav>

      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
