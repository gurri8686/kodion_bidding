"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, History } from "lucide-react";

const PLATFORM_NAMES: Record<number, string> = {
  1: "Upwork",
  2: "Freelancer",
  3: "Fiverr",
  4: "LinkedIn",
};

const parseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return value.replace(/"/g, "") || "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "object") return Object.values(value).join(", ") || "—";
  return String(value) || "—";
};

const getChangedFields = (oldData: any, newData: any) => {
  const changes: any[] = [];
  const skipFields = ["updated_at", "updatedAt", "createdAt", "created_at", "id", "userId", "jobId"];

  for (const key in newData) {
    if (skipFields.includes(key)) continue;

    const normalize = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    if (
      JSON.stringify(normalize(oldData[key])) !==
      JSON.stringify(normalize(newData[key]))
    ) {
      changes.push({ field: key, old: oldData[key], new: newData[key] });
    }
  }

  return changes;
};

interface UserLogsProps {
  params: {
    userId: string;
  };
}

const UserLogs = ({ params }: UserLogsProps) => {
  const { userId } = params;
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<any>(null);

  const getSelectedDate = () => {
    const start = dateRange?.[0]?.startDate;
    const end = dateRange?.[0]?.endDate;

    const formatDate = (d: Date | undefined) => {
      if (!d) return null;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
    };

    return { startDate: formatDate(start), endDate: formatDate(end) };
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      try {
        const { startDate, endDate } = getSelectedDate();

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/logs/${userId}`,
          {
            params: { startDate, endDate },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setLogs(res.data.logs);
        }
      } catch (e) {
        console.error("Error fetching logs:", e);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchLogs();
  }, [userId, dateRange]);

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      profileId: "Profile",
      platformId: "Platform",
      manualJobTitle: "Title",
      manual_job_title: "Title",
      proposalLink: "Proposal",
      proposal_link: "Proposal",
      manualJobUrl: "Job URL",
      manual_job_url: "Job URL",
      appliedAt: "Date",
      applied_at: "Date",
      connectsUsed: "Connects",
      connects_used: "Connects",
      technologies: "Tech",
      bidderName: "Bidder",
      bidder_name: "Bidder",
    };
    return labels[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const logDate = new Date(date);
    const diffMs = now.getTime() - logDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Process all logs with their changes
  const processedLogs = logs.map((log) => {
    const oldData = parseJson(log.oldData);
    const newData = parseJson(log.newData);

    const changes = getChangedFields(oldData, newData).map((c) => {
      if (c.field === "profileId") {
        return { field: "Profile", old: oldData.profile?.name || "—", new: newData.profile?.name || "—" };
      }
      if (c.field === "platformId") {
        return { field: "Platform", old: PLATFORM_NAMES[oldData.platformId] || "—", new: PLATFORM_NAMES[newData.platformId] || "—" };
      }
      if (c.field === "appliedAt" || c.field === "applied_at") {
        return { field: "Date", old: c.old ? formatDateTime(c.old) : "—", new: c.new ? formatDateTime(c.new) : "—" };
      }
      return { field: getFieldLabel(c.field), old: formatValue(c.old), new: formatValue(c.new) };
    });

    return {
      ...log,
      jobTitle: log.appliedJob?.manual_job_title || oldData.manualJobTitle || newData.manualJobTitle || "Job Application",
      changes
    };
  });

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="bg-white border border-gray-200 p-10 rounded-xl text-center">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-[#f76a00]"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white border border-gray-200 p-10 rounded-xl text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium">No changes found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different date range</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="text-sm text-gray-500 px-1">
            {logs.length} edit{logs.length !== 1 ? 's' : ''} found
          </div>

          {/* Logs List - Simple inline changes */}
          <div className="space-y-2">
            {processedLogs.map((log, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {log.jobTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeTime(log.createdAt)} • {new Date(log.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium flex-shrink-0">
                    {log.changes.length} change{log.changes.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Changes - Inline Display */}
                {log.changes.length > 0 && (
                  <div className="space-y-2">
                    {log.changes.map((change: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-3 py-2">
                        <span className="text-gray-500 font-medium min-w-[70px]">{change.field}:</span>
                        <span className="text-red-500 line-through truncate max-w-[150px]" title={String(change.old)}>
                          {String(change.old)}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-green-600 font-medium truncate max-w-[150px]" title={String(change.new)}>
                          {String(change.new)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserLogs;
