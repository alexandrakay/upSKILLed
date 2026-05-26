import admin from 'firebase-admin';

let app: admin.app.App;

export function getAdminApp(): admin.app.App {
  if (app) return app;

  const credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Vercel stores multiline secrets with literal \n — replace to get actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  });

  app = admin.initializeApp({ credential }, 'upskilled');
  return app;
}

export function getFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}
