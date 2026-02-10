/**
 * File Upload Utilities for Vercel Blob Storage
 *
 * Replaces Multer local storage with Vercel Blob cloud storage
 * for serverless-compatible file uploads
 */

import { put, del, list } from '@vercel/blob';

// Allowed file types (same as original Multer config)
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/gif',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  pathname: string;
  contentType: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG, GIF`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit. File: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload a single file to Vercel Blob
 */
export async function uploadFile(
  file: File,
  userId: number,
  folder: string = 'attachments'
): Promise<UploadedFile> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create pathname with timestamp to avoid collisions
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const pathname = `${folder}/${userId}/${timestamp}-${sanitizedFilename}`;

  try {
    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true, // Adds random string to prevent collisions
    });

    return {
      url: blob.url,
      filename: file.name,
      size: file.size,
      pathname: blob.pathname,
      contentType: file.type,
    };
  } catch (error: any) {
    console.error('Blob upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

/**
 * Upload multiple files to Vercel Blob
 */
export async function uploadMultipleFiles(
  files: File[],
  userId: number,
  folder: string = 'attachments'
): Promise<UploadedFile[]> {
  // Validate file count
  if (files.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} files allowed. Received: ${files.length}`);
  }

  // Upload all files in parallel
  const uploadPromises = files.map((file) => uploadFile(file, userId, folder));

  try {
    return await Promise.all(uploadPromises);
  } catch (error: any) {
    console.error('Multiple file upload error:', error);
    throw new Error(`Failed to upload files: ${error.message}`);
  }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
    console.log(`🗑️  Deleted file: ${url}`);
  } catch (error: any) {
    console.error('Blob delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List all files for a user
 */
export async function listUserFiles(
  userId: number,
  folder: string = 'attachments'
): Promise<any[]> {
  try {
    const { blobs } = await list({
      prefix: `${folder}/${userId}/`,
    });
    return blobs;
  } catch (error: any) {
    console.error('Blob list error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

/**
 * Parse files from FormData
 * Converts FormData File objects to array
 */
export function parseFilesFromFormData(formData: FormData): File[] {
  const files: File[] = [];
  const attachments = formData.getAll('attachments');

  for (const attachment of attachments) {
    if (attachment instanceof File && attachment.size > 0) {
      files.push(attachment);
    }
  }

  return files;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
