'use client';

import { X, Download, ExternalLink } from "lucide-react";
import Image from "next/image";

interface AttachmentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  filename: string;
}

const AttachmentViewerModal = ({ isOpen, onClose, fileUrl, filename }: AttachmentViewerModalProps) => {
  if (!isOpen) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);
  const isPdf = /\.pdf$/i.test(filename);
  const fullUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${fileUrl}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white mx-4 lg:mx-auto p-0 rounded-lg shadow-2xl lg:w-[90vw] lg:max-w-6xl w-full outline-none z-50 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {filename}
            </h2>
            <p className="text-sm text-gray-500">
              {isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Download Button */}
            <a
              href={fullUrl}
              download
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Download"
            >
              <Download size={20} className="text-gray-700" />
            </a>

            {/* Open in New Tab Button */}
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} className="text-gray-700" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Close"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {isImage ? (
            // Image Viewer
            <div className="flex items-center justify-center min-h-full">
              <Image
                src={fullUrl}
                alt={filename}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg bg-white"
                style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
              />
            </div>
          ) : isPdf ? (
            // PDF Viewer
            <div className="h-full min-h-[600px]">
              <iframe
                src={fullUrl}
                title={filename}
                className="w-full h-full rounded-lg shadow-lg bg-white"
                style={{ minHeight: '600px' }}
              />
            </div>
          ) : (
            // Other File Types - Preview not available
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Preview not available
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                This file type cannot be previewed in the browser. You can download it or open it in a new tab.
              </p>
              <div className="flex gap-3">
                <a
                  href={fullUrl}
                  download
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Download File
                </a>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttachmentViewerModal;
