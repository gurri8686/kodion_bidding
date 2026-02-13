'use client';

import { X } from "lucide-react";

interface ViewStageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
}

export default function ViewStageDetailsModal({ isOpen, onClose, job }: ViewStageDetailsModalProps) {
  if (!isOpen || !job) return null;

  const stage = job.stage;

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Determine what details to show based on stage
  const getStageDetails = () => {
    switch (stage) {
      case "replied":
        return {
          title: "Replied Details",
          fields: [
            { label: "Reply Date", value: formatDate(job.replyDate) },
            { label: "Reply Notes", value: job.replyNotes || "No reply notes added." },
          ],
        };

      case "interview":
        return {
          title: "Interview Details",
          fields: [
            { label: "Interview Date", value: formatDate(job.interviewDate) },
            { label: "Interview Notes", value: job.interviewNotes || "No interview notes added." },
          ],
        };

      case "hired":
        return {
          title: "Hired Details",
          fields: [
            { label: "Budget", value: job?.HiredJob?.budgetAmount || "N/A" },
            { label: "Duration", value: job?.HiredJob?.duration || "N/A" },
            { label: "Notes", value: job?.HiredJob?.notes || "No hired notes added." },
          ],
        };

      case "not-hired":
        return {
          title: "Not Hired Details",
          fields: [
            { label: "Not Hired Date", value: formatDate(job.notHiredDate) },
            { label: "Notes", value: job.notHiredNotes || "No notes added." },
          ],
        };

      default:
        return {
          title: "Stage Details",
          fields: [{ label: "Info", value: "No stage details available." }],
        };
    }
  };

  const details = getStageDetails();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative animate-fadeIn">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {details.title}
        </h2>

        {/* Details */}
        <div className="space-y-4">
          {details.fields.map((item, idx) => (
            <div key={idx}>
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-md font-medium text-gray-800">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
