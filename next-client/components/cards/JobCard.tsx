"use client";

import {
  MapPin,
  DollarSign,
  Clock,
  Star,
  ClipboardList,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import Rating from 'react-rating';
import moment from "moment";
import ApplyModal from '../modals/ApplyModal";
import { useSelector } from "react-redux";

const JobCard = ({ job, mode = "job", onIgnore, onApply }) => {
  const [applyModal, setApplyModal] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const role = user.role;

  const safeJsonParse = (jsonString, fallback = []) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch {
      return fallback;
    }
  };

  const technologies = safeJsonParse(job.techStack);
  const isApplied = job?.isAppliedByOtherUser;
  const jobRate =
    job.jobType === "Hourly" ? `${job.hourlyRate}/hr` : job.fixedPrice;

  return (
    <div className="relative group bg-white border rounded-md shadow-sm px-4 py-3 hover:shadow-md transition-all text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          {mode === "job" && isApplied && (
            <div className="flex items-center mb-1 space-x-1 text-yellow-800 text-xs">
              <CheckCircle className="w-4 h-4 text-yellow-500" />
              <span className="bg-yellow-100 px-2 py-0.5 rounded-full">
                Already applied
              </span>
            </div>
          )}
          <h3 className="font-semibold leading-snug text-base text-gray-800 hover:underline">
            <a href={job.link || "#"} target="_blank" rel="noopener noreferrer">
              {job.title || "No Title"}
            </a>
          </h3>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
          {mode === "ignored"
            ? `Ignored At: ${moment(job.ignoredAt).format("MMM D, YYYY")}`
            : job.exactDateTime}
        </span>
      </div>

      {/* Tech Stack */}
      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {technologies.map((tech, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-4 gap-y-1 text-gray-600 mb-2">
        <div className="flex items-center gap-1">
          <CreditCard size={14} className="text-green-600" />
          <span className="font-medium">Client Spent:</span>{" "}
          {job.clientSpent}
        </div>

        {job.clientLocation && (
          <div className="flex items-center gap-1">
            <MapPin size={14} /> {job.clientLocation}
          </div>
        )}
        {jobRate && (
          <div className="flex items-center gap-1">
            <DollarSign size={14} /> {jobRate}
          </div>
        )}
        {job.estimatedDuration && (
          <div className="flex items-center gap-1">
            <Clock size={14} /> {job.estimatedDuration}
          </div>
        )}
        {job.rating && parseFloat(job.rating) > 0 && (
          <div className="flex items-center gap-1">
            <Rating
              readonly
              initialRating={parseFloat(job.rating)}
              emptySymbol={<Star size={14} className="text-gray-300" />}
              fullSymbol={<Star size={14} className="text-yellow-500 fill-yellow-500" />}
            />
            <span className="text-gray-600 text-xs ml-1">{job.rating}</span>
          </div>
        )}
        {job.proposals && (
          <div className="flex items-center gap-1">
            <ClipboardList size={14} /> {job.proposals} Proposals
          </div>
        )}
      </div>

      {/* Posted Time */}
      <div className="text-xs text-gray-400">
        Posted {moment(job.exactDateTime, "DD/MM/YYYY, hh:mm:ss a").fromNow()}
      </div>

      {/* Hover Actions */}
      {mode === "job" ? (
        <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out flex gap-3 text-xs">
          <button
            className={`text-green-600 underline ${isApplied ? "pointer-events-none text-gray-400" : ""
              }`}
            onClick={() => setApplyModal(true)}
          >
            Mark as Applied
          </button>
          <button className="text-red-600 underline" onClick={() => onIgnore(job)}>
            Ignore
          </button>
          {job.link && (
            <a
              href={job.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              View Job
            </a>
          )}
        </div>
      ) : (
        <div className="mt-3 flex justify-between items-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-xs text-yellow-800 mb-2">
            <p>
              <strong>Reason:</strong> {job.reason || "No reason provided."}
            </p>
            {job.customReason && (
              <p className="mt-1">
                <strong>Bidder's Note:</strong> {job.customReason}
              </p>
            )}
          </div>
          {mode === "ignored" && (
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out flex gap-3">
              <button
                className={`text-green-600 text-sm underline ${isApplied ? "pointer-events-none text-gray-400" : ""
                  }`}
                onClick={() => setApplyModal(true)}
                disabled={isApplied}
              >
                Mark as Applied
              </button>
           
            </div>
          )}
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyModal}
        onRequestClose={() => setApplyModal(false)}
        jobId={job.jobId}
        job={job}
        onApplyJob={(jobId) => {
          onApply(jobId);
          setApplyModal(false);
        }}
      />
      
    </div>
  );
};

export default JobCard;
