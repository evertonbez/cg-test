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
//   "progress": {
//     "download": 100,
//     "transform": 100,
//     "upload": 100,
//     "overall": 100
//   },
//   "errorMessage": null
//   "createdAt": 1698600000,
//   "updatedAt": 1698601234,
// }

type StepStatus = "pending" | "started" | "done" | "error";

type SetJobMutationParams = {
  inputUrl?: string | null;
  outputUrl?: string | null;
  status?: "pending" | "started" | "done" | "error";
  steps?: {
    download?: StepStatus;
    transform?: StepStatus;
    upload?: StepStatus;
  };
  progress?: {
    download?: number;
    transform?: number;
    upload?: number;
    overall?: number;
  };
  errorMessage?: string | null;
};

export async function setJobMutation(
  db: FirebaseFirestore.Firestore,
  id: string,
  data: SetJobMutationParams,
) {
  const jobRef = db.collection("jobs").doc(id);
  const payload: Record<string, any> = {};

  if (data.inputUrl) payload.inputUrl = data.inputUrl;
  if (data.outputUrl) payload.outputUrl = data.outputUrl;
  if (data.status) payload.status = data.status;
  if (data.errorMessage) payload.errorMessage = data.errorMessage;
  if (data.steps) {
    for (const [key, value] of Object.entries(data.steps)) {
      if (value !== undefined) payload[`steps.${key}`] = value;
    }
  }
  if (data.progress) {
    for (const [key, value] of Object.entries(data.progress)) {
      if (value !== undefined) payload[`progress.${key}`] = value;
    }
  }

  payload.updatedAt = admin.firestore.Timestamp.now();

  try {
    await jobRef.update(payload);
  } catch {
    payload.createdAt = admin.firestore.Timestamp.now();
    await jobRef.set(payload, { merge: true });
  }
}
