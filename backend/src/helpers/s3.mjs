/**
 * S3 private receipt upload helper.
 * Generates short-lived presigned PUT URLs scoped strictly to the authenticated user's prefix.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const RECEIPTS_BUCKET = process.env.RECEIPTS_BUCKET || 'spendwise-receipts-bucket';
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1';
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'mockAccessKeyId',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'mockSecretAccessKey',
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

/**
 * Generate a presigned upload URL for a receipt
 */
export async function generatePresignedUploadUrl(userId, { transactionId, fileName, contentType }) {
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    throw new Error(`Unsupported content-type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`);
  }

  // Sanitize file extension
  const extension = fileName?.includes('.') ? fileName.split('.').pop().toLowerCase() : 'jpg';
  const timestamp = Date.now();
  const safeTxId = transactionId || 'draft';

  // Strict user isolation in S3 prefix: receipts/<userId>/...
  const objectKey = `receipts/${userId}/${safeTxId}-${timestamp}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: RECEIPTS_BUCKET,
    Key: objectKey,
    ContentType: contentType,
  });

  // Short-lived 5-minute URL
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    objectKey,
    expiresInSeconds: 300,
  };
}
