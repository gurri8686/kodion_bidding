'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useAppSelector } from '@/lib/store/hooks';
import { ArrowRight, History } from 'lucide-react';

type Tab = 'applied' | 'ignored' | 'hired' | 'logs';

const PLATFORM_NAMES: Record<number, string> = {
  1: 'Upwork',
  2: 'Freelancer',
  3: 'Fiverr',
  4: 'LinkedIn',
};

const parseJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '\u2014';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value.replace(/"/g, '') || '\u2014';
  if (Array.isArray(value)) return value.join(', ') || '\u2014';
  if (typeof value === 'object') return Object.values(value).join(', ') || '\u2014';
  return String(value) || '\u2014';
};

const getChangedFields = (oldData: any, newData: any) => {
  const changes: Array<{ field: string; old: any; new: any }> = [];
  const skipFields = ['updated_at', 'updatedAt', 'createdAt', 'created_at', 'id', 'userId', 'jobId'];
  for (const key in newData) {
    if (skipFields.includes(key)) continue;
    const normalize = (val: any) => {
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return val; }
      }
      return val;
    };
    if (JSON.stringify(normalize(oldData[key])) !== JSON.stringify(normalize(newData[key]))) {
      changes.push({ field: key, old: oldData[key], new: newData[key] });
    }
  }
  return changes;
};

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    profileId: 'Profile', platformId: 'Platform', manualJobTitle: 'Title',
    manual_job_title: 'Title', proposalLink: 'Proposal', proposal_link: 'Proposal',
    manualJobUrl: 'Job URL', manual_job_url: 'Job URL', appliedAt: 'Date',
    applied_at: 'Date', connectsUsed: 'Connects', connects_used: 'Connects',
    technologies: 'Tech', bidderName: 'Bidder', bidder_name: 'Bidder',
  };
  return labels[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim();
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

export default function UserJobDetails() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>('applied');

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logDateRange, setLogDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        setError('');
        const url = `/api/admin/user/${userId}/jobs`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        if (!cancelled) setData(res.data);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Failed to load.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (userId && token) run();
    else { setLoading(false); setError('Missing userId.'); }
    return () => { cancelled = true; };
  }, [userId, token]);

  const fetchLogs = useCallback(async () => {
    if (!userId || !token) return;
    setLogsLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/logs/${userId}?startDate=${logDateRange.startDate}&endDate=${logDateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setLogs(res.data.logs);
    } catch (e) {
      console.error('Error fetching logs:', e);
    } finally {
      setLogsLoading(false);
    }
  }, [userId, token, logDateRange]);

  useEffect(() => {
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab, fetchLogs]);

  const userName = data?.user?.name || 'User';
  const userEmail = data?.user?.email || '';
  const summary = data?.summary || { totalApplied: 0, totalIgnored: 0, totalHired: 0, totalReplied: 0, totalInterviewed: 0, totalNotHired: 0 };

  const formatDate = (d: string | null) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (d: string | null) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const processedLogs = logs.map((log) => {
    const oldData = typeof log.oldData === 'string' ? parseJson(log.oldData) : log.oldData || {};
    const newData = typeof log.newData === 'string' ? parseJson(log.newData) : log.newData || {};
    const changes = getChangedFields(oldData, newData).map((c) => {
      if (c.field === 'profileId') {
        return { field: 'Profile', old: oldData.profile?.name || '\u2014', new: newData.profile?.name || '\u2014' };
      }
      if (c.field === 'platformId') {
        return { field: 'Platform', old: PLATFORM_NAMES[oldData.platformId] || '\u2014', new: PLATFORM_NAMES[newData.platformId] || '\u2014' };
      }
      return { field: getFieldLabel(c.field), old: formatValue(c.old), new: formatValue(c.new) };
    });
    return {
      ...log,
      jobTitle: log.appliedJob?.manual_job_title || oldData.manualJobTitle || newData.manualJobTitle || 'Job Application',
      changes,
    };
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'applied', label: 'Applied Jobs' },
    { key: 'ignored', label: 'Ignored Jobs' },
    { key: 'hired', label: 'Hired Jobs' },
    { key: 'logs', label: 'Logs' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/activity')}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${userName}'s Job Details`}
              </h1>
            </div>
            {!loading && data?.user && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {loading && (
            <div className="bg-white border border-gray-200 p-10 rounded-xl text-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Summary Cards */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
                <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="text-center bg-gray-50 rounded py-1.5 hover:bg-gray-100 transition-colors">
                    <p className="text-lg font-bold text-gray-900">{summary.totalApplied}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Applied</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded py-1.5 hover:bg-gray-100 transition-colors">
                    <p className="text-lg font-bold text-gray-900">{summary.totalIgnored}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Ignored</p>
                  </div>
                  <div className="text-center bg-green-50 rounded py-1.5 hover:bg-green-100 transition-colors">
                    <p className="text-lg font-bold text-green-700">{summary.totalHired}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Hired</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center py-1.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                    <p className="text-lg font-bold text-blue-600">{summary.totalReplied || 0}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Replied</p>
                  </div>
                  <div className="text-center py-1.5 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                    <p className="text-lg font-bold text-purple-600">{summary.totalInterviewed || 0}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Interview</p>
                  </div>
                  <div className="text-center py-1.5 bg-red-50 rounded hover:bg-red-100 transition-colors">
                    <p className="text-lg font-bold text-red-600">{summary.totalNotHired || 0}</p>
                    <p className="text-[13px] mt-0.5 font-medium">Rejected</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {tabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Applied Jobs Tab */}
                {activeTab === 'applied' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profile Used</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Connects Used</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Technology Applied</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Proposal Link</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Link</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applied At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.appliedJobs?.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                              No applied jobs found.
                            </td>
                          </tr>
                        ) : (
                          data.appliedJobs?.map((job: any) => {
                            const title = job.manualJobTitle || job.manual_job_title || job.Job?.title || '\u2014';
                            const profileName = job.profile?.name || job.profileName || job.profile_name || '\u2014';
                            const connects = job.connectsUsed ?? job.connects_used ?? '\u2014';
                            const techs = job.technologies
                              ? (Array.isArray(job.technologies) ? job.technologies.join(', ') : job.technologies)
                              : '\u2014';
                            const proposalLink = job.proposalLink || job.proposal_link || '';
                            const jobLink = job.manualJobUrl || job.manual_job_url || job.Job?.link || '';
                            const appliedAt = job.appliedAt || job.applied_at || job.created_at;

                            return (
                              <tr key={job.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={title}>{title}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{profileName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{connects}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={techs}>{techs}</td>
                                <td className="px-4 py-3 text-sm">
                                  {proposalLink ? (
                                    <a href={proposalLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[120px]">
                                      View
                                    </a>
                                  ) : '\u2014'}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {jobLink ? (
                                    <a href={jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[120px]">
                                      View
                                    </a>
                                  ) : '\u2014'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(appliedAt)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Ignored Jobs Tab */}
                {activeTab === 'ignored' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Type</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Link</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ignored Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.ignoredJobs?.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                              No ignored jobs found.
                            </td>
                          </tr>
                        ) : (
                          data.ignoredJobs?.map((ij: any) => {
                            const job = ij.Job;
                            const title = job?.title || '\u2014';
                            const location = job?.clientLocation || '\u2014';
                            const jobType = job?.jobType || '\u2014';
                            const price = job?.fixedPrice || job?.hourlyRate || '\u2014';
                            const reason = ij.customReason || ij.reason || '\u2014';
                            const jobLink = job?.link || '';
                            const ignoredTime = ij.createdAt;

                            return (
                              <tr key={ij.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={title}>{title}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{location}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{jobType}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{price}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate" title={reason}>{reason}</td>
                                <td className="px-4 py-3 text-sm">
                                  {jobLink ? (
                                    <a href={jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      View
                                    </a>
                                  ) : '\u2014'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDateTime(ignoredTime)}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Hired Jobs Tab */}
                {activeTab === 'hired' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Title</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Profile Used</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Developer Hired</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job Link</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hired Date</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {data.hiredJobs?.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                              No hired jobs found.
                            </td>
                          </tr>
                        ) : (
                          data.hiredJobs?.map((hj: any) => {
                            const applied = hj.appliedJobDetails;
                            const job = applied?.Job;
                            const title = applied?.manualJobTitle || applied?.manual_job_title || job?.title || '\u2014';
                            const client = hj.clientName || '\u2014';
                            const profileName = hj.profileName || applied?.profile?.name || '\u2014';
                            const developer = hj.developerDetails?.name || '\u2014';
                            const budget = hj.budgetAmount
                              ? `$${hj.budgetAmount} (${hj.budgetType})`
                              : '\u2014';
                            const jobLink = applied?.manualJobUrl || applied?.manual_job_url || job?.link || '';
                            const hiredDate = hj.hiredDate || hj.hired_date || hj.hiredAt;

                            return (
                              <tr key={hj.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={title}>{title}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{client}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{profileName}</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{developer}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{budget}</td>
                                <td className="px-4 py-3 text-sm">
                                  {jobLink ? (
                                    <a href={jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      View
                                    </a>
                                  ) : '\u2014'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(hiredDate)}</td>
                                <td className="px-4 py-3 text-sm">
                                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Logs Tab */}
                {activeTab === 'logs' && (
                  <div className="p-4">
                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                        <input
                          type="date"
                          value={logDateRange.startDate}
                          onChange={(e) => setLogDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="text-sm bg-transparent border-none outline-none text-gray-700"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                          type="date"
                          value={logDateRange.endDate}
                          onChange={(e) => setLogDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="text-sm bg-transparent border-none outline-none text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Logs Content */}
                    {logsLoading ? (
                      <div className="bg-gray-50 border border-gray-200 p-10 rounded-xl text-center">
                        <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600"></div>
                        <p className="mt-3 text-sm text-gray-500">Loading logs...</p>
                      </div>
                    ) : processedLogs.length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 p-10 rounded-xl text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <History className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium">No changes found</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different date range</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500 px-1 mb-2">
                          {processedLogs.length} edit{processedLogs.length !== 1 ? 's' : ''} found
                        </div>
                        {processedLogs.map((log: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{log.jobTitle}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {formatRelativeTime(log.createdAt)} &bull;{' '}
                                  {new Date(log.createdAt).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium flex-shrink-0">
                                {log.changes.length} change{log.changes.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {log.changes.length > 0 && (
                              <div className="space-y-2">
                                {log.changes.map((change: any, i: number) => (
                                  <div key={i} className="flex items-center gap-2 text-sm bg-white rounded-md px-3 py-2">
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
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
