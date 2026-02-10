'use client';

import { useState, useRef } from "react";
import { X, Upload, File, FileText, Image as ImageIcon } from "lucide-react";

interface FileObject {
  file?: File;
  originalName: string;
  size: number;
  mimetype: string;
  preview?: string;
}

interface FileUploadProps {
  files: (FileObject | string)[];
  setFiles: (files: (FileObject | string)[]) => void;
  maxFiles?: number;
}

const FileUpload = ({ files, setFiles, maxFiles = 5 }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const currentFileCount = files.length;

    if (currentFileCount + selectedFiles.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return;
    }

    // Validate file size (10MB max per file)
    const invalidFiles = selectedFiles.filter(
      (file) => file.size > 10 * 1024 * 1024
    );
    if (invalidFiles.length > 0) {
      setError("Each file must be less than 10MB");
      return;
    }

    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/gif",
      "text/plain",
    ];

    const invalidTypeFiles = selectedFiles.filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidTypeFiles.length > 0) {
      setError("Only PDF, DOC, DOCX, TXT, and image files are allowed");
      return;
    }

    setError("");

    // Create preview URLs for images
    const filesWithPreviews: FileObject[] = selectedFiles.map((file) => {
      const fileObj: FileObject = {
        file,
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
      };

      if (file.type.startsWith("image/")) {
        fileObj.preview = URL.createObjectURL(file);
      }

      return fileObj;
    });

    setFiles([...files, ...filesWithPreviews]);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles[index];

    // Revoke object URL to prevent memory leaks
    if (typeof removedFile !== 'string' && removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }

    newFiles.splice(index, 1);
    setFiles(newFiles);
    setError("");
  };

  const getFileIcon = (mimetype?: string) => {
    if (mimetype?.startsWith("image/")) {
      return <ImageIcon size={20} className="text-blue-500" />;
    } else if (mimetype === "application/pdf") {
      return <FileText size={20} className="text-red-500" />;
    } else {
      return <File size={20} className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <label className="block mb-2 font-medium text-gray-700">
        Attachments (Optional)
      </label>

      {/* Upload Button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="text-sm k-gray-600">
          Click to upload files (max {maxFiles})
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, DOC, DOCX, TXT, or Images (max 10MB each)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Selected Files ({files.length}/{maxFiles})
          </p>
          {files.map((fileObj, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview or Icon */}
              {typeof fileObj !== 'string' && fileObj.preview ? (
                <img
                  src={fileObj.preview}
                  alt={fileObj.originalName}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : typeof fileObj === 'string' ? (
                // For existing files from server (just URL strings)
                fileObj.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={`${fileObj}`}
                    alt="Attachment"
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  getFileIcon(fileObj.match(/\.pdf$/i) ? 'application/pdf' : 'application/octet-stream')
                )
              ) : (
                getFileIcon(fileObj.mimetype)
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {typeof fileObj === 'string'
                    ? fileObj.split('/').pop() // Extract filename from URL
                    : fileObj.originalName
                  }
                </p>
                <p className="text-xs text-gray-500">
                  {typeof fileObj === 'string'
                    ? 'Uploaded'
                    : formatFileSize(fileObj.size)
                  }
                </p>
              </div>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-red-100 rounded-full transition"
              >
                <X size={18} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
