import { updateJobMutation } from "@cograde/firebase/admin/mutations";
import { db } from "@cograde/firebase/server";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import { writeFileSync } from "fs";
import path from "path";
import sharp from "sharp";
import z from "zod";
import { job } from "../../core/job.ts";
import { imageProcessingQueue } from "../../queues/queues.ts";

export const imageProcessing = job(
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

    await updateJobMutation(db, id, {
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
        await updateJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          errorMessage: "Arquivo não é imagem",
        });
        throw new Error("Arquivo não é imagem");
      }

      const MAX_SIZE_BYTES = 10 * 1024 * 1024;
      if (imageBuffer.length > MAX_SIZE_BYTES) {
        await updateJobMutation(db, id, {
          status: "error",
          steps: { download: "error" },
          errorMessage: "Arquivo maior que 10 MB",
        });
        throw new Error("Arquivo maior que 10 MB");
      }

      await updateJobMutation(db, id, {
        steps: { download: "done", transform: "started" },
      });

      let transformer = sharp(imageBuffer).resize(1024, 1024, {
        fit: "inside",
      });
      transformer = transformer.grayscale();

      const watermarkSvg = Buffer.from(`
         <svg width="300" height="80">
           <text x="0" y="60" font-size="40" fill="white" opacity="0.6">MyWatermark</text>
         </svg>
       `);

      const transformedBuffer = await transformer
        .composite([{ input: watermarkSvg, gravity: "southeast" }])
        .jpeg({ quality: 80 })
        .toBuffer();

      await updateJobMutation(db, id, {
        steps: { transform: "done", upload: "pending" },
      });

      const outputFilePath = path.join(process.cwd(), `output-${id}.jpg`);
      writeFileSync(outputFilePath, transformedBuffer);
    } catch (error) {}
  }
);
