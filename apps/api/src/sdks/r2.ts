import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { lookup as lookupMime } from "mime-types";
import { Readable } from "node:stream";

type R2Config = {
  accountId?: string; // opcional se endpoint completo for usado
  endpoint: string; // ex: https://<accountid>.r2.cloudflarestorage.com
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl?: string; // ex: https://pub-<bucket>.<account>.r2.dev ou CDN
};

let cachedClient: S3Client | null = null;
let cachedBucket: string | null = null;
let cachedPublicBaseUrl: string | undefined;

function getEnvConfig(): R2Config {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (!endpoint) throw new Error("R2_ENDPOINT não definido");
  if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID não definido");
  if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY não definido");
  if (!bucket) throw new Error("R2_BUCKET não definido");

  return { endpoint, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  const cfg = getEnvConfig();
  cachedBucket = cfg.bucket;
  cachedPublicBaseUrl = cfg.publicBaseUrl;

  cachedClient = new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return cachedClient;
}

function ensureBucket(): string {
  if (!cachedBucket) {
    const { bucket } = getEnvConfig();
    cachedBucket = bucket;
  }
  return cachedBucket!;
}

export type UploadParams = {
  key: string;
  body: Buffer | Uint8Array | Blob | string | Readable;
  contentType?: string;
  metadata?: Record<string, string>;
};

export type UploadResult = {
  etag?: string;
  key: string;
  publicUrl: string;
};

export async function uploadObject(
  params: UploadParams,
): Promise<UploadResult> {
  const client = getR2Client();
  const bucket = ensureBucket();

  let inferredType: string | undefined = params.contentType;
  if (!inferredType) {
    const lookedUp = lookupMime(params.key);
    inferredType = (lookedUp as string | false)
      ? (lookedUp as string)
      : undefined;
  }

  const input: PutObjectCommandInput = {
    Bucket: bucket,
    Key: params.key,
    Body: params.body as any,
    ContentType: inferredType,
    Metadata: params.metadata,
  };

  const res = await client.send(new PutObjectCommand(input));

  return {
    etag: res.ETag,
    key: params.key,
    publicUrl: `${cachedPublicBaseUrl}/images/${params.key}`,
  };
}

export type SignedUrlOperation = "get" | "put";
export type GetSignedUrlParams = {
  key: string;
  operation: SignedUrlOperation;
  expiresInSeconds?: number;
  contentTypeWhenPut?: string;
};

export async function getSignedUrl(
  params: GetSignedUrlParams,
): Promise<string> {
  const client = getR2Client();
  const bucket = ensureBucket();
  const expiresIn = params.expiresInSeconds ?? 900;
  if (params.operation === "get") {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: params.key });
    return awsGetSignedUrl(client, cmd, { expiresIn });
  }
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentTypeWhenPut,
  });
  return awsGetSignedUrl(client, cmd, { expiresIn });
}

export type { PutObjectCommandInput as SdkPutObjectCommandInput };
