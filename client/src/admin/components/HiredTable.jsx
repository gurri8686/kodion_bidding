import { useState } from "react";
import { Paperclip } from "lucide-react";
import MediaGalleryModal from "../../modals/MediaGalleryModal";

export default function HiredTable({ jobs }) {
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  const safeJsonParse = (jsonString, fallback = []) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleViewMedia = (attachments) => {
    setSelectedAttachments(attachments);
    setIsMediaGalleryOpen(true);
  };

  return (
    <>
      <table className="min-w-full bg-white border shadow-xl rounded-lg overflow-hidden">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr className="text-left text-sm font-bold text-gray-700">
            <th className="p-4 w-[18rem]">Job Title</th>
            <th className="p-4">Client</th>
            <th className="p-4">Profile Used</th>
            <th className="p-4">Developer Hired</th>
            <th className="p-4">Budget</th>
            <th className="p-4">Job Link</th>
            <th className="p-4">Hired Date</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {jobs.length > 0 ? (
            jobs.map((job, idx) => {
              const attachments = safeJsonParse(job.appliedJobDetails?.attachments, []);

              return (
                <tr
                  key={job.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-4">
                    <div>
                      <div>
                        {job.jobDetails?.title || job.appliedJobDetails?.manualJobTitle || "—"}
                      </div>
                      {attachments.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Paperclip size={12} />
                          <span>{attachments.length} file{attachments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{job.clientName || "—"}</td>
                  <td className="p-4">{job.profileName || "—"}</td>
                  <td className="p-4">{job.developerDetails?.name || "—"}</td>
                  <td className="p-4">
                    {job.budgetAmount
                      ? `${job.budgetType} - $${job.budgetAmount}`
                      : "—"}
                  </td>
                  <td className="p-4">
                    {job.jobDetails?.link || job.appliedJobDetails?.manualJobUrl ? (
                      <a
                        href={job.jobDetails?.link || job.appliedJobDetails?.manualJobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        View Job
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    {job.hiredAt
                      ? new Date(job.hiredAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {attachments.length > 0 && (
                      <button
                        onClick={() => handleViewMedia(attachments)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200 transition-colors"
                      >
                        <Paperclip size={13} />
                        <span>View Media</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" className="p-4 text-center text-gray-500">
                No hired jobs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        attachments={selectedAttachments}
      />
    </>
  );
}
