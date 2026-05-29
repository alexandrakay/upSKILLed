'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, getFirestore } from 'firebase/firestore';
import { getClientApp } from '@/lib/firebase-client';
import { useAuth } from '@/lib/auth-context';
import { OutputPanel } from '@/components/generate/OutputPanel';
import { SignInModal } from '@/components/auth/SignInModal';
import { getSourceLabel, getRelativeDate } from '@/lib/skills-utils';
import type { GenerateOutput } from '@/lib/generate-logic';

type SkillRecord = GenerateOutput & {
  id: string;
  path: string;
  input: string;
  useCase: string;
  createdAt: Date;
};

export function SkillsPage() {
  const { user, loading } = useAuth();
  const [skills, setSkills] = useState<SkillRecord[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { setSignInOpen(true); return; }

    const db = getFirestore(getClientApp());
    const q = query(
      collection(db, 'generations'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    getDocs(q)
      .then((snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            name: data.name ?? data.input ?? 'unknown',
            skillContent: data.skillContent ?? '',
            configContent: data.configContent ?? '',
            examplesContent: data.examplesContent ?? '',
            path: data.path,
            input: data.input,
            useCase: data.useCase,
            createdAt: data.createdAt?.toDate() ?? new Date(),
          } satisfies SkillRecord;
        });
        setSkills(docs);
      })
      .catch((e) => setFetchError(e?.message ?? 'Failed to load skills'));
  }, [user, loading]);

  if (loading) {
    return <PageShell><p className="text-neutral-500 text-sm">Loading…</p></PageShell>;
  }

  if (!user) {
    return (
      <>
        <PageShell>
          <p className="text-neutral-500 text-sm">Sign in to view your saved skills.</p>
        </PageShell>
        <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      </>
    );
  }

  if (fetchError) {
    return (
      <PageShell>
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {fetchError}
        </p>
      </PageShell>
    );
  }

  if (skills === null) {
    return <PageShell><p className="text-neutral-500 text-sm">Loading skills…</p></PageShell>;
  }

  return (
    <PageShell>
      {skills.length === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-neutral-400 text-sm">No skills yet.</p>
          <p className="mt-1 text-neutral-600 text-xs">
            Generate your first skill on the{' '}
            <a href="/generate" className="text-purple-400 hover:underline">generate page</a>.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <button
                onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-semibold text-neutral-100 shrink-0">
                    {skill.name}
                  </span>
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs text-purple-400 shrink-0">
                    {getSourceLabel(skill.path, skill.input)}
                  </span>
                  <span className="truncate text-xs text-neutral-600 hidden sm:block">
                    {skill.useCase}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-neutral-600">
                    {getRelativeDate(skill.createdAt)}
                  </span>
                  <span className="text-neutral-600 text-xs">
                    {expanded === skill.id ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {expanded === skill.id && (
                <div className="border-t border-white/[0.06] px-5 pb-5">
                  {skill.skillContent ? (
                    <OutputPanel output={skill} />
                  ) : (
                    <p className="pt-4 text-xs text-neutral-600">
                      Content not available — this skill was generated before history was enabled.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">My Skills</h1>
        <p className="mt-2 text-neutral-500">Your previously generated Claude skill packages.</p>
      </div>
      {children}
    </div>
  );
}
