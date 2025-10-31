import admin from "firebase-admin";

const raw = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);

if (raw.private_key) {
  raw.private_key = raw.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({
  credential: admin.credential.cert(raw as admin.ServiceAccount),
  databaseURL: "https://cograder-ae0cd.firebaseio.com",
});

const db = admin.firestore();
const storage = admin.storage();

export { admin, db, storage };
