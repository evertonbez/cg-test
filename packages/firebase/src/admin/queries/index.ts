import { type Query } from "firebase-admin/firestore";
import { type DocumentData } from "firebase/firestore/lite";

type GetJobsParams = {
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
};

export async function getJobsQuery(
  db: FirebaseFirestore.Firestore,
  params: GetJobsParams = {
    limit: 10,
  }
) {
  const jobsCollection = db.collection("jobs");
  let query: Query<DocumentData> = jobsCollection;

  if (params.orderBy) {
    query = query.orderBy(params.orderBy, params.orderDirection || "desc");
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    data: doc.data(),
  }));
}

export async function getJobByIdQuery(
  db: FirebaseFirestore.Firestore,
  id: string
) {
  const jobCollection = db.collection("jobs");
  const job = await jobCollection.doc(id).get();

  if (!job.exists) {
    return null;
  }

  return {
    id: job.id,
    data: job.data(),
  };
}
