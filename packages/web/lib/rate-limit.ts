import type { Firestore } from 'firebase-admin/firestore';

const DAILY_LIMIT = 3;

export async function checkRateLimit(
  db: Firestore,
  identifier: string
): Promise<{ allowed: boolean; resetAt: Date }> {
  return db.runTransaction(async (tx) => {
    const ref = db.collection('usage').doc(identifier);
    const snap = await tx.get(ref);

    const now = new Date();
    const midnight = new Date(now);
    midnight.setUTCHours(24, 0, 0, 0);

    if (!snap.exists) {
      tx.set(ref, { count: 1, resetAt: midnight, lastGeneratedAt: now });
      return { allowed: true, resetAt: midnight };
    }

    const data = snap.data()!;
    const resetAt: Date = data.resetAt.toDate();

    // Counter expired — reset it
    if (resetAt <= now) {
      tx.set(ref, { count: 1, resetAt: midnight, lastGeneratedAt: now });
      return { allowed: true, resetAt: midnight };
    }

    if (data.count >= DAILY_LIMIT) {
      return { allowed: false, resetAt };
    }

    tx.update(ref, { count: data.count + 1, lastGeneratedAt: now });
    return { allowed: true, resetAt };
  });
}
