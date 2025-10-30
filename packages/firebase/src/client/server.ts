import admin from "firebase-admin";
import serviceAccount from "../credentials/serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://cograder-ae0cd.firebaseio.com",
});

const db = admin.firestore();
const storage = admin.storage();

export { admin, db, storage };
