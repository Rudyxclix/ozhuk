import mongoose from 'mongoose';
import { Readable } from 'node:stream';
import { isDatabaseConnected } from '../config/database.js';

const BUCKET_NAME = 'ozhukEvidence';
let gridFSBucket: mongoose.mongo.GridFSBucket | null = null;

export function getGridFSBucket(): mongoose.mongo.GridFSBucket {
  if (!isDatabaseConnected() || !mongoose.connection.db) {
    const err = new Error('Database service unavailable. MongoDB Atlas is not connected.');
    (err as unknown as { statusCode: number }).statusCode = 503;
    throw err;
  }

  if (!gridFSBucket) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: BUCKET_NAME,
    });
  }
  return gridFSBucket;
}

export interface UploadFileResult {
  fileId: string;
  url: string;
  fileName: string;
  contentType: string;
}

export const gridFSService = {
  /**
   * Directly stream an upload into MongoDB GridFS bucket 'ozhukEvidence'
   */
  async uploadStream(
    fileStream: Readable,
    fileName: string,
    contentType: string
  ): Promise<UploadFileResult> {
    const bucket = getGridFSBucket();

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(fileName, {
        contentType,
        metadata: {
          originalName: fileName,
          contentType,
          uploadedAt: new Date(),
        },
      });

      fileStream
        .pipe(uploadStream)
        .on('error', (err: Error) => {
          reject(err);
        })
        .on('finish', () => {
          const fileId = uploadStream.id.toString();
          resolve({
            fileId,
            url: `/api/uploads/${fileId}`,
            fileName,
            contentType,
          });
        });
    });
  },

  /**
   * Find file metadata and open a download stream from GridFS
   */
  async getFileStream(fileIdString: string) {
    if (!mongoose.Types.ObjectId.isValid(fileIdString)) {
      const err = new Error('Invalid file identifier');
      (err as unknown as { statusCode: number }).statusCode = 400;
      throw err;
    }

    const bucket = getGridFSBucket();
    const objectId = new mongoose.Types.ObjectId(fileIdString);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      const err = new Error('Photo not found');
      (err as unknown as { statusCode: number }).statusCode = 404;
      throw err;
    }

    const fileDoc = files[0];
    const contentType =
      (fileDoc.metadata as { contentType?: string })?.contentType ||
      fileDoc.contentType ||
      'application/octet-stream';

    const downloadStream = bucket.openDownloadStream(objectId);

    return {
      stream: downloadStream,
      fileName: fileDoc.filename,
      contentType,
      length: fileDoc.length,
      uploadDate: fileDoc.uploadDate,
    };
  },
};
