/**
 * Temporary In-Memory Client Image Registry
 *
 * During this development phase prior to configuring cloud object storage (e.g. S3 / GCS):
 * 1. The citizen selects a real browser File object.
 * 2. An ephemeral Blob URL is created via URL.createObjectURL(file) for instant, full-resolution client preview.
 * 3. The file reference and blob URL are registered in this session cache keyed by ticketId.
 * 4. When navigating to /track/:ticketId in the same browser session, the actual local image is displayed.
 * 5. On page reload or for reports created in other sessions, the server-provided fallback mock image URL is rendered.
 * 6. NO images are converted to Base64 for database storage.
 */

interface CachedImage {
  blobUrl: string;
  fileName: string;
  fileSize: number;
}

const sessionImageCache = new Map<string, CachedImage>();

export const imageStore = {
  setTicketImage(ticketId: string, blobUrl: string, fileName: string, fileSize: number) {
    sessionImageCache.set(ticketId.trim().toUpperCase(), { blobUrl, fileName, fileSize });
  },

  getTicketImage(ticketId: string): CachedImage | undefined {
    return sessionImageCache.get(ticketId.trim().toUpperCase());
  },
};
