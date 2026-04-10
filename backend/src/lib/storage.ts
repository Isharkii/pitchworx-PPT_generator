import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.S3_BUCKET ?? "pitchworx-presentations";

// Upload a PPTX buffer to S3 and return the public URL
export async function uploadPptx(
  key: string,
  buffer: Buffer
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    })
  );

  return `https://${BUCKET}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
}

// Generate a pre-signed download URL (valid 1 hour)
export async function getDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn: 3600 }
  );
}

// Download a file from a URL and return a Buffer (used to grab Gamma's exportUrl)
export async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch file from ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
