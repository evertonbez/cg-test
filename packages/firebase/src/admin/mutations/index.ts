import { Timestamp } from "firebase-admin/firestore";
import { admin } from "../../client/server.ts";

// {
//   "inputUrl": "https://example.com/image.jpg",
//   "outputUrl": "https://storage.googleapis.com/app-bucket/jobs/abc123/result.jpg",
//   "status": "done",
//   "steps": {
//     "download": "done",
//     "transform": "done",
//     "upload": "done"
//   },
//   "transformations": ["resize", "grayscale", "watermark"],
//   "createdAt": 1698600000,
//   "updatedAt": 1698601234,
//   "error": null
// }

export type CreateJobMutationParams = {
  id: string;
  url: string;
};

export async function createJobMutation(
  db: FirebaseFirestore.Firestore,
  data: CreateJobMutationParams
) {
  const jobCollection = db.collection("jobs");

  const { id, url } = data;

  const jobCreated = await jobCollection.doc(id).set(
    {
      inputUrl: url,
      outputUrl: null,
      status: "running",
      steps: {
        download: "running",
        transform: "pending",
        upload: "pending",
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

type UpdateJobMutationParams = {
  status?: "pending" | "started" | "done" | "error";
  steps?: {
    download?: "pending" | "started" | "done" | "error";
    transform?: "pending" | "started" | "done" | "error";
    upload?: "pending" | "started" | "done" | "error";
  };
  errorMessage?: string | null;
};

export async function updateJobMutation(
  db: FirebaseFirestore.Firestore,
  id: string,
  data: UpdateJobMutationParams
) {
  const jobRef = db.collection("jobs").doc(id);
  const payload: Record<string, any> = {};

  if (data.status) payload.status = data.status;
  if (data.errorMessage) payload.errorMessage = data.errorMessage;
  if (data.steps) {
    for (const [key, value] of Object.entries(data.steps)) {
      if (value !== undefined) payload[`steps.${key}`] = value;
    }
  }

  payload.updatedAt = admin.firestore.Timestamp.now();

  try {
    await jobRef.update(payload);
  } catch {
    await jobRef.set(payload, { merge: true });
  }
}
