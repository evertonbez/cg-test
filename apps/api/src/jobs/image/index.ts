import {
  createJobMutation,
  updateJobMutation,
} from "@cograde/firebase/admin/mutations";
import { db } from "@cograde/firebase/server";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import z from "zod";
import { job } from "../../core/job.ts";
import { imageProcessingQueue } from "../../queues/queues.ts";
import { uploadObject } from "../../sdks/r2.ts";

export const imageProcessingJob = job(
  "image-processing",
  z.object({
    id: z.string(),
    inputUrl: z.url(),
  }),
  {
    queue: imageProcessingQueue,
  },
  async (data) => {
    const { id, inputUrl } = data;

    await createJobMutation(db, id, {
      inputUrl,
      status: "started",
      steps: { download: "pending", transform: "pending", upload: "pending" },
      progress: { download: 0, transform: 0, upload: 0, overall: 0 },
    });

    try {
      // ===== ETAPA 1: DOWNLOAD =====
      await updateJobMutation(db, id, {
        steps: { download: "started" },
        progress: { download: 10, overall: 10 },
      });

      const response = await axios.get(inputUrl, {
        responseType: "arraybuffer",
        timeout: 30_000,
      });
      const imageBuffer: Buffer = Buffer.from(response.data);

      await updateJobMutation(db, id, {
        progress: { download: 30, overall: 30 },
      });

      const type = await fileTypeFromBuffer(imageBuffer);
      if (!type || !type.mime.startsWith("image/")) {
        await updateJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          progress: { download: 0, overall: 0 },
          errorMessage: "Arquivo não é imagem",
        });
        throw new Error("Arquivo não é imagem");
      }

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      if (imageBuffer.length > MAX_SIZE_BYTES) {
        await updateJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          progress: { download: 0, overall: 0 },
          errorMessage: "Arquivo maior que 10 MB",
        });
        throw new Error("Arquivo maior que 10 MB");
      }

      await updateJobMutation(db, id, {
        steps: { download: "done", transform: "started" },
        progress: { download: 100, transform: 10, overall: 35 },
      });

      // ===== ETAPA 2: TRANSFORMAÇÃO =====
      let transformer = sharp(imageBuffer).resize(1024, 1024, {
        fit: "inside",
      });

      await updateJobMutation(db, id, {
        progress: { transform: 25, overall: 45 },
      });

      transformer = transformer.grayscale();

      await updateJobMutation(db, id, {
        progress: { transform: 50, overall: 55 },
      });

      const watermarkSvg = Buffer.from(`
         <svg width="300" height="80">
           <rect width="100%" height="100%" fill="red" />
           <text x="10" y="60" font-size="40" fill="white" opacity="0.6">evertonbez</text>
         </svg>
       `);

      const transformedBuffer = await transformer
        .composite([{ input: watermarkSvg, gravity: "southeast" }])
        .jpeg({ quality: 80 })
        .toBuffer();

      await updateJobMutation(db, id, {
        steps: { transform: "done", upload: "started" },
        progress: { transform: 100, upload: 10, overall: 65 },
      });

      // ===== ETAPA 3: UPLOAD =====
      await updateJobMutation(db, id, {
        progress: { upload: 30, overall: 75 },
      });

      const r2Result = await uploadObject({
        body: transformedBuffer,
        key: `${id}.${type.ext || "jpg"}`,
        contentType: type.mime || "image/jpeg",
      });

      await updateJobMutation(db, id, {
        progress: { upload: 80, overall: 85 },
      });

      await updateJobMutation(db, id, {
        outputUrl: r2Result.publicUrl,
        status: "done",
        steps: { upload: "done" },
        progress: { download: 100, transform: 100, upload: 100, overall: 100 },
      });

      return {
        status: "done",
        outputUrl: r2Result.publicUrl,
        message: "Image processed successfully",
      };
    } catch (error) {
      await updateJobMutation(db, id, {
        status: "error",
        steps: { download: "error", transform: "error", upload: "error" },
        progress: { download: 0, transform: 0, upload: 0, overall: 0 },
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
);
