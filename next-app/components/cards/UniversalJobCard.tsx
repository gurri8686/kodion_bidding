'use client';

import {
  Clock,
  User2,
  Layers,
  Zap,
  MoreVertical,
  Image as ImageIcon,
  ExternalLink,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import MediaGalleryModal from "@/modals/MediaGalleryModal";
import HiredJobModal from "@/modals/HiredJob";
import EditAppliedJobModal from "@/modals/EditAppliedModal";
import MarkAsReplyModal from "@/modals/MarkAsReplyModal";
import MarkAsInterviewModal from "@/modals/MarkAsInterviewModal";
import ViewStageDetailsModal from "@/modals/ViewStageDetailsModal";
import MarkAsNotHiredModal from "@/modals/MarkAsNotHiredModal";

interface UniversalJobCardProps {
  job: any;
  fetchJobs: () => void;
  type?: "applied" | "hired";
}

export default function UniversalJobCard({ job, fetchJobs, type = "applied" }: UniversalJobCardProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [isHiredModalOpen, setIsHiredModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotHiredModalOpen, setIsNotHiredModalOpen] = useState(false);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);

  const safeJsonParse = (jsonString: string | null, fallback: any[] = []) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleEditJob = () => setIsEditModalOpen(true);

  const handleMarkAsHired = (jobId: string) => {
    setSelectedJobId(jobId);
    setIsHiredModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleStageUpdate = (jobId: string, stage: string) => {
    setSelectedJobId(jobId);
    if (stage === "replied") setIsReplyModalOpen(true);
    if (stage === "interview") setIsInterviewModalOpen(true);
  };

  // Calculate menu position when opened
  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192px = w-48 width
      });
    }
  }, [isMenuOpen]);

  // Handle outside click for menu
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Parse job data based on type
  const isHiredJob = type === "hired" || job.status === "hired";

  const title = isHiredJob
    ? job.jobDetails?.title || job.appliedJobDetails?.manualJobTitle || job.manualJobTitle || "No Title"
    : job.manualJobTitle || job.Job?.title || "No Title";

  const jobLink = isHiredJob
    ? job.jobDetails?.link || job.appliedJobDetails?.manualJobUrl
    : job.Job?.link || job.manualJobUrl;

  const appliedDate = new Date(isHiredJob ? (job.hiredAt || job.createdAt) : job.appliedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Get technologies - from appliedJobDetails for hired jobs, or directly from job for applied jobs
  const technologies = isHiredJob
    ? safeJsonParse(job.appliedJobDetails?.technologies)
    : safeJsonParse(job.technologies);

  // Get attachments - from appliedJobDetails for hired jobs, or directly from job for applied jobs
  const attachments = isHiredJob
    ? safeJsonParse(job.appliedJobDetails?.attachments, [])
    : safeJsonParse(job.attachments, []);

  const profileName = isHiredJob ? job.profileName : job?.profile?.name;
  const connectsOrClient = isHiredJob ? job.clientName : job.connectsUsed;
  const budgetInfo = isHiredJob ? `${job.budgetAmount} USD (${job.budgetType})` : null;

  // Get stage display for applied jobs
  const getStageStyle = () => {
    if (isHiredJob) {
      return { label: "Hired", class: "bg-green-100 text-green-700 border-green-200" };
    }
    const stages: Record<string, { label: string; class: string }> = {
      applied: { label: "Applied", class: "bg-gray-100 text-gray-700 border-gray-200" },
      replied: { label: "Replied", class: "bg-blue-100 text-blue-700 border-blue-200" },
      interview: { label: "Interview", class: "bg-purple-100 text-purple-700 border-purple-200" },
      hired: { label: "Hired", class: "bg-green-100 text-green-700 border-green-200" },
      "not-hired": { label: "Not Hired", class: "bg-red-100 text-red-700 border-red-200" },
    };
    return stages[job.stage] || stages.applied;
  };

  const stageInfo = getStageStyle();

  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-gray-300 transition-all overflow-hidden">
      {/* Header: Title & Status Badge */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-4 py-3 relative">
        <div className="flex items-center justify-between gap-3">
          {jobLink ? (
            <a
              href={jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-bold text-gray-900 truncate flex-1 hover:text-blue-600 transition-colors hover:underline cursor-pointer"
            >
              {title}
            </a>
          ) : (
            <h3 className="text-base font-bold text-gray-900 truncate flex-1">
              {title}
            </h3>
          )}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border-2 ${stageInfo.class}`}>
              {stageInfo.label}
            </span>
            {!isHiredJob && (
              <div className="relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreVertical size={16} />
                </button>

                {isMenuOpen && createPortal(
                  <div
                    ref={menuRef}
                    style={{
                      position: "absolute",
                      top: `${menuPosition.top}px`,
                      left: `${menuPosition.left}px`,
                    }}
                    className="w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
                  >
                    {job.proposalLink && (
                      <a
                        href={job.proposalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                      >
                        View Proposal
                      </a>
                    )}
                    {jobLink && (
                      <a
                        href={jobLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                      >
                        View Job
                      </a>
                    )}

                    <div className="border-t my-1"></div>

                    <button
                      onClick={() => handleStageUpdate(job.id, "replied")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Mark as Replied
                    </button>

                    <button
                      onClick={() => handleStageUpdate(job.id, "interview")}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Mark as Interview
                    </button>

                    <button
                      onClick={() => handleMarkAsHired(job.id)}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Mark as Hired
                    </button>

                    <button
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setIsNotHiredModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Mark as Not Hired
                    </button>
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleEditJob}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      Edit Job
                    </button>
                  </div>,
                  document.body
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Info Section */}
      <div className="p-4">
        <div className="space-y-2">
          {/* Profile & Connects/Client - Single Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User2 size={14} className="text-gray-400" />
              <span className="text-gray-600">{profileName || "N/A"}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md border ${
              isHiredJob
                ? "bg-blue-50 border-blue-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              {isHiredJob ? (
                <>
                  <Briefcase size={14} className="text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">{connectsOrClient}</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-yellow-600" />
                  <span className="font-semibold text-yellow-900 text-sm">{connectsOrClient}</span>
                </>
              )}
            </div>
          </div>

          {/* Budget for Hired Jobs */}
          {isHiredJob && budgetInfo && (
            <div className="bg-green-50 rounded-md px-3 py-2 border border-green-100">
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={14} className="text-green-600" />
                <span className="text-green-700 font-medium">Budget:</span>
                <span className="font-semibold text-green-900">{budgetInfo}</span>
              </div>
            </div>
          )}

          {/* Technologies - Compact Display */}
          {technologies.length > 0 && (
            <div className="bg-blue-50 rounded-md px-3 py-2 border border-blue-100">
              <div className="flex items-center gap-2 text-sm">
                <Layers size={14} className="text-blue-600 flex-shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {technologies.slice(0, 3).map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="text-blue-900 font-medium text-xs"
                    >
                      {tech}{i < Math.min(technologies.length - 1, 2) ? "," : ""}
                    </span>
                  ))}
                  {technologies.length > 3 && (
                    <span className="text-blue-700 text-xs font-medium">
                      +{technologies.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes for Hired Jobs */}
          {isHiredJob && job.notes && (
            <div className="bg-yellow-50 rounded-md px-3 py-2 border border-yellow-100">
              <div className="text-sm">
                <span className="text-yellow-700 font-medium">Notes: </span>
                <span className="text-yellow-900">{job.notes}</span>
              </div>
            </div>
          )}

          {/* Footer: Date, Links, Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>{isHiredJob ? "Hired " : "Applied "}{appliedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Media Button */}
              {attachments.length > 0 && (
                <button
                  onClick={() => setIsMediaGalleryOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200 transition-colors"
                  title="View Media Gallery"
                >
                  <ImageIcon size={13} />
                  <span>Media ({attachments.length})</span>
                </button>
              )}

              {/* View Details */}
              {!isHiredJob && ["replied", "interview", "not-hired"].includes(job.stage) && (
                <button
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                >
                  View Details
                </button>
              )}

              {/* Job Link */}
              {jobLink && (
                <a
                  href={jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
                  title="View Job Posting"
                >
                  <ExternalLink size={13} />
                  <span>View Job</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {!isHiredJob && (
        <>
          <HiredJobModal
            isOpen={isHiredModalOpen}
            onClose={() => setIsHiredModalOpen(false)}
            jobId={selectedJobId}
            job={job}
            fetchAppliedJobs={fetchJobs}
          />

          <EditAppliedJobModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            job={job}
            fetchAppliedJobs={fetchJobs}
          />

          <MarkAsReplyModal
            isOpen={isReplyModalOpen}
            onClose={() => setIsReplyModalOpen(false)}
            job={job}
            fetchAppliedJobs={fetchJobs}
          />

          <MarkAsInterviewModal
            isOpen={isInterviewModalOpen}
            onClose={() => setIsInterviewModalOpen(false)}
            job={job}
            fetchAppliedJobs={fetchJobs}
          />

          <ViewStageDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            job={job}
          />

          <MarkAsNotHiredModal
            isOpen={isNotHiredModalOpen}
            onClose={() => setIsNotHiredModalOpen(false)}
            job={job}
            fetchAppliedJobs={fetchJobs}
          />
        </>
      )}

      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        attachments={attachments}
      />
    </div>
  );
}
