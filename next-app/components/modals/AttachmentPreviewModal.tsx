'use client';

import { X } from "lucide-react";
import Image from "next/image";

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  filename?: string;
}

export default function AttachmentPreviewModal({
  isOpen,
  onClose,
  fileUrl,
  filename
}: AttachmentPreviewModalProps) {
  if (!isOpen || !fileUrl) return null;

  const lower = (filename || fileUrl || "").toLowerCase();
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(lower);
  const isPdf = /\.pdf$/i.test(lower);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-4 relative animate-fadeIn max-h-[90vh] overflow-hidden">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center justify-center overflow-auto">
            {isImage ? (
              <div className="relative max-h-[80vh] w-full">
                <Image
                  src={fileUrl}
                  alt={filename || 'Attachment'}
                  width={800}
                  height={600}
                  className="max-h-[80vh] w-auto object-contain rounded"
                  style={{ maxHeight: '80vh', width: 'auto' }}
                />
              </div>
            ) : isPdf ? (
              <embed
                src={fileUrl}
                type="application/pdf"
                className="w-full h-[70vh]"
              />
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-700">Preview not available for this file type.</p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Open / Download File
                </a>
              </div>
            )}
          </div>

          <div className="md:w-80 w-full border-l border-gray-200 md:border-l md:pl-4 pt-2 md:pt-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">{filename || 'Attachment'}</h3>
            <p className="text-sm text-gray-500 mt-2">{isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}</p>

            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
