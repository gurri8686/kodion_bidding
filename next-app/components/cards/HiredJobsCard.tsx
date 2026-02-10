'use client';

import {
   CalendarCheck, DollarSign, FileText, User, Mail, Phone
} from 'lucide-react';

interface HiredJobsCardProps {
  job: any;
}

const HiredJobsCard = ({ job }: HiredJobsCardProps) => {
  const {
    jobDetails,
    appliedJobDetails,
    developerDetails,
    hiredAt,
    notes,
    budgetAmount,
    budgetType,
    clientName,
    profileName
  } = job;

  // Use appliedJobDetails if jobDetails is not available
  const jobTitle = jobDetails?.title || appliedJobDetails?.manualJobTitle || 'Untitled Job';
  const jobLink = jobDetails?.link || appliedJobDetails?.manualJobUrl;

  // Get description but avoid showing it if it's the same as client name
  let jobDescription = jobDetails?.shortDescription || appliedJobDetails?.manualJobDescription;
  if (jobDescription === clientName) {
    jobDescription = null; // Don't show description if it's the same as client name
  }

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-sm space-y-3">
      {/* Job Title + Client */}
      <div className="flex justify-between items-start">
        <div>
          {jobLink ? (
            <a
              href={jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              {jobTitle}
            </a>
          ) : (
            <h2 className="text-base font-semibold text-blue-700">
              {jobTitle}
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-gray-600 -mb-2">
            <p className="font-medium"><strong>Client:</strong> {clientName}</p>
            <p className="font-medium ml-9"><strong>Profile:</strong> {profileName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600">
        <div className="flex items-center gap-2">
          <span>
            <strong>Budget:</strong> {budgetAmount} USD ({budgetType})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            <strong>Hired:</strong> {new Date(hiredAt).toLocaleDateString()}
          </span>
        </div>
        {notes && (
          <div className="sm:col-span-2 flex items-start gap-2">
            <FileText size={14} className="mt-1" />
            <span className="italic">
              <strong>Notes:</strong> {notes}
            </span>
          </div>
        )}
      </div>

      {/* Developer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 text-gray-700 border-t pt-3">
        <h2 className='font-semibold'>Assigned Developer Info</h2>
        <div className="flex items-center gap-2">
          <User size={14} />
          {developerDetails?.name || "N/A"}
        </div>
      </div>
    </div>
  );
};

export default HiredJobsCard;
