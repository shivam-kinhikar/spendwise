import { success, badRequest } from '../helpers/response.mjs';
import { generatePresignedUploadUrl } from '../helpers/s3.mjs';

/**
 * POST /uploads/presign
 * Generates a short-lived presigned upload URL scoped strictly to the authenticated user.
 */
export async function handlePresignUpload(userId, body) {
  if (!body || typeof body !== 'object') {
    return badRequest('Request body must be a JSON object');
  }

  const { fileName, contentType, transactionId } = body;

  if (!contentType) {
    return badRequest('contentType is required (e.g. image/jpeg, image/png, application/pdf)');
  }

  try {
    const result = await generatePresignedUploadUrl(userId, {
      transactionId,
      fileName,
      contentType,
    });
    return success(result);
  } catch (err) {
    return badRequest(err.message);
  }
}
