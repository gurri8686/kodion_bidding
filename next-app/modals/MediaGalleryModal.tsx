'use client';

import Modal from "react-modal";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

const MediaGalleryModal = ({ isOpen, onClose, attachments = [] }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  const currentFile = attachments[currentIndex];
  const filename = currentFile.split('/').pop();
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
  const isPdf = /\.pdf$/i.test(filename);
  const fullUrl = currentFile;

  const goNext = () => setCurrentIndex((prev: number) => (prev + 1) % attachments.length);
  const goPrev = () => setCurrentIndex((prev: number) => (prev - 1 + attachments.length) % attachments.length);
  const handleClose = () => { setCurrentIndex(0); onClose(); };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Media Gallery"
      className="bg-white mx-4 lg:mx-auto p-0 rounded-xl shadow-2xl lg:w-[90vw] lg:max-w-6xl w-full outline-none z-50 max-h-[95vh] flex flex-col overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{filename}</h2>
          <p className="text-sm text-gray-500">
            {currentIndex + 1} of {attachments.length} • {isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {isPdf && (
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Open in new tab">
              <ExternalLink size={20} className="text-gray-700" />
            </a>
          )}
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-gray-200 transition-colors" title="Close">
            <X size={20} className="text-gray-700" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center bg-gray-900 relative overflow-hidden h-[600px]">
        {isImage ? (
          <img src={fullUrl} alt={filename} className="max-w-full max-h-full object-contain" />
        ) : isPdf ? (
          <div className="w-full h-full bg-white p-4">
            <iframe src={fullUrl} title={filename} className="w-full h-full rounded" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white p-8">
            <p className="text-lg mb-4">Preview not available</p>
            <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Open File
            </a>
          </div>
        )}
        {attachments.length > 1 && (
          <>
            <button onClick={goPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white flex items-center justify-center transition-all" title="Previous">
              <ChevronLeft size={28} />
            </button>
            <button onClick={goNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white flex items-center justify-center transition-all" title="Next">
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>
      {attachments.length > 1 && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {attachments.map((fileUrl: string, idx: number) => {
              const thumbFilename = fileUrl.split('/').pop();
              const thumbIsImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(thumbFilename || '');
              const thumbIsPdf = /\.pdf$/i.test(thumbFilename || '');
              return (
                <button key={idx} onClick={() => setCurrentIndex(idx)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentIndex === idx ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'}`}>
                  {thumbIsImage ? (
                    <img src={fileUrl} alt={thumbFilename} className="w-full h-full object-cover" />
                  ) : thumbIsPdf ? (
                    <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-bold text-red-600 mt-1">PDF</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center">
                      <span className="text-[8px] font-bold text-blue-600">FILE</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MediaGalleryModal;
