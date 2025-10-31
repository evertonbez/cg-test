import { setJobMutation } from "@cograde/firebase/admin/mutations";
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

    await setJobMutation(db, id, {
      inputUrl,
      status: "started",
      steps: { download: "pending", transform: "pending", upload: "pending" },
    });

    try {
      const response = await axios.get(inputUrl, {
        responseType: "arraybuffer",
        timeout: 30_000,
      });
      const imageBuffer: Buffer = Buffer.from(response.data);

      const type = await fileTypeFromBuffer(imageBuffer);
      if (!type || !type.mime.startsWith("image/")) {
        await setJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          errorMessage: "Arquivo não é imagem",
        });
        throw new Error("Arquivo não é imagem");
      }

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      if (imageBuffer.length > MAX_SIZE_BYTES) {
        await setJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          errorMessage: "Arquivo maior que 10 MB",
        });
        throw new Error("Arquivo maior que 10 MB");
      }

      await setJobMutation(db, id, {
        steps: { download: "done", transform: "started" },
      });

      let transformer = sharp(imageBuffer).resize(1024, 1024, {
        fit: "inside",
      });
      transformer = transformer.grayscale();

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

      await setJobMutation(db, id, {
        steps: { transform: "done", upload: "pending" },
      });

      const r2Result = await uploadObject({
        body: transformedBuffer,
        key: `${id}.${type.ext || "jpg"}`,
        contentType: type.mime || "image/jpeg",
      });

      await setJobMutation(db, id, {
        outputUrl: r2Result.publicUrl,
        status: "done",
        steps: { upload: "done" },
      });

      return {
        status: "done",
        outputUrl: r2Result.publicUrl,
        message: "Image processed successfully",
      };
    } catch (error) {
      await setJobMutation(db, id, {
        status: "error",
        steps: { download: "error", transform: "error", upload: "error" },
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
);
