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
//   "errorMessage": null
//   "createdAt": 1698600000,
//   "updatedAt": 1698601234,
// }

type SetJobMutationParams = {
  status?: "pending" | "started" | "done" | "error";
  steps?: {
    download?: "pending" | "started" | "done" | "error";
    transform?: "pending" | "started" | "done" | "error";
    upload?: "pending" | "started" | "done" | "error";
  };
  errorMessage?: string | null;
};

export async function setJobMutation(
  db: FirebaseFirestore.Firestore,
  id: string,
  data: SetJobMutationParams
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
    payload.createdAt = admin.firestore.Timestamp.now();
    await jobRef.set(payload);
  }
}
