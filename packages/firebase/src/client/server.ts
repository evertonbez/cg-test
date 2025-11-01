import admin from "firebase-admin";

const encoded = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!encoded) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT não definida");
}

const jsonString = Buffer.from(encoded, "base64").toString("utf8");

const serviceAccount = JSON.parse(jsonString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://cograder-ae0cd.firebaseio.com",
});

const db = admin.firestore();
const storage = admin.storage();

export { admin, db, storage };
