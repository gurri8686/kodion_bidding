'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Zap,
  MessageSquare,
  Video,
  CircleCheckBig,
  CircleX,
  Target,
  DollarSign,
} from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader } from '@/components/admin/Loader';
import CountUp from 'react-countup';
import DashboardFilters from '@/components/admin/DashboardFilters';
import Image from 'next/image';

const platformIcons: Record<string, string> = {
  Upwork: '/icons/upwork.svg',
  Freelancer: '/icons/freelancer.svg',
  Guru: '/icons/guru.svg',
  LinkedIn: '/icons/linkedin.svg',
};

interface Summary {
  totalAppliedJobs: number;
  totalConnectsUsed: number;
  totalConnectsCostUSD: number;
  totalConnectsCostINR: number;
  totalHiredJobs: number;
  totalReplied: number;
  totalInterviewed: number;
  totalNotHired: number;
  appliedJobsBreakdown: Record<string, number>;
  appliedPlatformBreakdown: Record<string, number>;
  connectsBreakdown: Record<string, number>;
  costBreakdown: Record<string, number>;
  appliedUserWise: Record<string, number>;
  connectsUserWise: Record<string, number>;
  costUserWise: Record<string, number>;
  appliedProfileWise: Record<string, number>;
  connectsProfileWise: Record<string, number>;
  costProfileWise: Record<string, number>;
  weeklyTarget: {
    target_amount: number;
    achieved_amount: number;
    remaining: number;
    percentage: number;
    target_range: {
      start: string;
      end: string;
    };
  };
  weeklyTargetUserWise: Record<string, any>;
  hiredPlatformWise: Record<string, number>;
  hiredUserWise: Record<string, number>;
  hiredProfileWise: Record<string, number>;
  interviewPlatformWise: Record<string, number>;
  repliedPlatformWise: Record<string, number>;
  interviewUserWise: Record<string, number>;
  repliedUserWise: Record<string, number>;
  interviewProfileWise: Record<string, number>;
  repliedProfileWise: Record<string, number>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({
    totalAppliedJobs: 0,
    totalConnectsUsed: 0,
    totalConnectsCostUSD: 0,
    totalConnectsCostINR: 0,
    totalHiredJobs: 0,
    totalReplied: 0,
    totalInterviewed: 0,
    totalNotHired: 0,
    appliedJobsBreakdown: {},
    appliedPlatformBreakdown: {},
    connectsBreakdown: {},
    costBreakdown: {},
    appliedUserWise: {},
    connectsUserWise: {},
    costUserWise: {},
    appliedProfileWise: {},
    connectsProfileWise: {},
    costProfileWise: {},
    weeklyTarget: {
      target_amount: 0,
      achieved_amount: 0,
      remaining: 0,
      percentage: 0,
      target_range: {
        start: '',
        end: '',
      },
    },
    weeklyTargetUserWise: {},
    hiredPlatformWise: {},
    hiredUserWise: {},
    hiredProfileWise: {},
    interviewPlatformWise: {},
    repliedPlatformWise: {},
    interviewUserWise: {},
    repliedUserWise: {},
    interviewProfileWise: {},
    repliedProfileWise: {},
  });

  const [filters, setFilters] = useState<any>(null);
  const token = useAppSelector((state) => state.auth.token);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
  }, []);

  const fetchJobStats = useCallback(
    async (appliedFilters: any = {}) => {
      try {
        setLoading(true);
        const { platform, userProfile, bidder, startDate, endDate } = appliedFilters || {};

        const res = await axios.get(
          `/api/admin/job-stats`,
          {
            params: {
              platform: platform || null,
              profileId: userProfile || null,
              userId: bidder || null,
              startDate,
              endDate,
            },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const apiSummary = res.data.summary || {};
        setSummary((prev) => ({
          ...prev,
          ...apiSummary,
        }));
      } catch (error) {
        console.error('Error fetching job stats:', error);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    fetchJobStats({
      startDate: startOfWeek.toISOString().slice(0, 10),
      endDate: endOfWeek.toISOString().slice(0, 10),
    });
  }, [fetchJobStats]);

  useEffect(() => {
    if (filters) fetchJobStats(filters);
  }, [filters, fetchJobStats]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        <DashboardFilters onFilterChange={handleFilterChange} />
        {loading ? (
          <Loader />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <DashboardCard
                title="Applied Jobs"
                value={summary.totalAppliedJobs}
                icon={<FileText className="text-blue-600" size={24} />}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.appliedJobsBreakdown || summary.appliedPlatformBreakdown || {},
                    icons: platformIcons,
                  },
                  {
                    label: 'User',
                    data: summary.appliedUserWise || {},
                    useInitials: true,
                    color: 'blue',
                  },
                  {
                    label: 'Profile',
                    data: summary.appliedProfileWise || {},
                    useInitials: true,
                    color: 'indigo',
                  },
                ]}
              />

              <DashboardCard
                title="Cost"
                value={summary.totalConnectsCostUSD}
                secondaryValue={summary.totalConnectsCostINR}
                icon={<DollarSign className="text-emerald-600" size={24} />}
                decimals={2}
                formatValue={(val) => `$${val.toFixed(2)}`}
                formatSecondaryValue={(val) => `₹${val.toFixed(2)}`}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.costBreakdown || {},
                    icons: platformIcons,
                    formatValue: (val: number) => `$${val.toFixed(2)}`,
                  },
                  {
                    label: 'User',
                    data: summary.costUserWise || {},
                    useInitials: true,
                    color: 'yellow',
                    formatValue: (val: number) => `$${val.toFixed(2)}`,
                  },
                  {
                    label: 'Profile',
                    data: summary.costProfileWise || {},
                    useInitials: true,
                    color: 'orange',
                    formatValue: (val: number) => `$${val.toFixed(2)}`,
                  },
                ]}
              />

              <DashboardCard
                title="Connects Used"
                value={summary.totalConnectsUsed}
                icon={<Zap className="text-amber-600" size={24} />}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.connectsBreakdown || {},
                    icons: platformIcons,
                  },
                  {
                    label: 'User',
                    data: summary.connectsUserWise || {},
                    useInitials: true,
                    color: 'teal',
                  },
                  {
                    label: 'Profile',
                    data: summary.connectsProfileWise || {},
                    useInitials: true,
                    color: 'cyan',
                  },
                ]}
              />

              {summary.weeklyTarget ? (
                <DashboardCard
                  title="Weekly Target"
                  value={summary.weeklyTarget.target_amount}
                  icon={<Target className="text-purple-600" size={24} />}
                  formatValue={(val) => `$${val}`}
                  breakdowns={[
                    {
                      label: 'User Target',
                      data: Object.entries(summary.weeklyTargetUserWise || {}).reduce(
                        (acc: Record<string, number>, [user, data]: [string, any]) => {
                          acc[user] = data.target;
                          return acc;
                        },
                        {}
                      ),
                      useInitials: true,
                      color: 'orange',
                      formatValue: (val: number) => `$${val}`,
                    },
                  ]}
                />
              ) : (
                <DashboardCard
                  title="Weekly Target"
                  value={0}
                  icon={<Target className="text-purple-600" size={24} />}
                  breakdowns={[]}
                  note="Select a user to view Weekly Target"
                />
              )}

              <DashboardCard
                title="Replied"
                value={summary.totalReplied}
                icon={<MessageSquare className="text-teal-600" size={24} />}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.repliedPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: 'User',
                    data: summary.repliedUserWise || {},
                    useInitials: true,
                    color: 'teal',
                  },
                  {
                    label: 'Profile',
                    data: summary.repliedProfileWise || {},
                    useInitials: true,
                    color: 'cyan',
                  },
                ]}
              />

              <DashboardCard
                title="Interviewed"
                value={summary.totalInterviewed}
                icon={<Video className="text-indigo-600" size={24} />}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.interviewPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: 'User',
                    data: summary.interviewUserWise || {},
                    useInitials: true,
                    color: 'purple',
                  },
                  {
                    label: 'Profile',
                    data: summary.interviewProfileWise || {},
                    useInitials: true,
                    color: 'pink',
                  },
                ]}
              />

              <DashboardCard
                title="Hired Jobs"
                value={summary.totalHiredJobs}
                icon={<CircleCheckBig className="text-green-600" size={24} />}
                breakdowns={[
                  {
                    label: 'Platform',
                    data: summary.hiredPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: 'User',
                    data: summary.hiredUserWise || {},
                    useInitials: true,
                    color: 'purple',
                  },
                  {
                    label: 'Profile',
                    data: summary.hiredProfileWise || {},
                    useInitials: true,
                    color: 'pink',
                  },
                ]}
              />

              <DashboardCard
                title="Not Hired"
                value={summary.totalNotHired}
                icon={<CircleX className="text-red-600" size={24} />}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  value: number;
  secondaryValue?: number;
  icon: React.ReactNode;
  decimals?: number;
  breakdowns?: Array<{
    label: string;
    data: Record<string, number>;
    icons?: Record<string, string>;
    useInitials?: boolean;
    color?: string;
    formatValue?: (val: number) => string;
  }>;
  formatValue?: (val: number) => string;
  formatSecondaryValue?: (val: number) => string;
  note?: string;
}

const DashboardCard = ({
  title,
  value,
  secondaryValue,
  icon,
  decimals = 0,
  breakdowns = [],
  formatValue,
  formatSecondaryValue,
  note,
}: DashboardCardProps) => {
  const getFirstLetter = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const colorClasses: Record<string, string> = {
    blue: 'bg-slate-700 text-white',
    indigo: 'bg-indigo-600 text-white',
    yellow: 'bg-slate-700 text-white',
    orange: 'bg-indigo-600 text-white',
    teal: 'bg-slate-700 text-white',
    cyan: 'bg-indigo-600 text-white',
    purple: 'bg-slate-700 text-white',
    pink: 'bg-indigo-600 text-white',
    green: 'bg-slate-700 text-white',
  };

  const userBreakdown = breakdowns.find((b) => b.label === 'User' && b.useInitials);
  const userEntries =
    userBreakdown?.data && typeof userBreakdown.data === 'object'
      ? Object.entries(userBreakdown.data).filter(([, val]) => val > 0)
      : [];

  const otherBreakdowns = breakdowns.filter((b) => b.label !== 'User');

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-md bg-gray-100 shrink-0">{icon}</div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                {title}
              </h3>

              <div className="flex flex-col gap-0.5">
                <p className="text-3xl font-bold text-gray-900 truncate">
                  {formatValue ? (
                    formatValue(value || 0)
                  ) : (
                    <CountUp end={value || 0} duration={2} decimals={decimals} />
                  )}
                </p>

                {secondaryValue !== undefined && formatSecondaryValue && (
                  <p className="text-lg font-medium text-gray-600 truncate">
                    {formatSecondaryValue(secondaryValue || 0)}
                  </p>
                )}
              </div>

              {note && <p className="text-xs text-gray-500 mt-1 italic">{note}</p>}
            </div>
          </div>

          {userEntries.length > 0 && (
            <div className="shrink-0 max-w-[140px]">
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider text-right">
                User
              </p>
              <div className="flex flex-wrap flex-col gap-1.5">
                {userEntries.map(([name, val]) => (
                  <div
                    key={name}
                    className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60"
                    title={name}
                  >
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                        colorClasses[userBreakdown?.color || 'blue']
                      } text-[10px] font-semibold`}
                    >
                      {getFirstLetter(name)}
                    </span>

                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {userBreakdown?.formatValue ? userBreakdown.formatValue(val) : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {otherBreakdowns.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {otherBreakdowns.map((breakdown, index) => {
            const entries =
              breakdown.data && typeof breakdown.data === 'object'
                ? Object.entries(breakdown.data).filter(([, val]) => val > 0)
                : [];

            if (entries.length === 0) return null;

            return (
              <div key={index}>
                {breakdown.label && (
                  <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">
                    {breakdown.label}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {entries.map(([name, val]) => (
                    <div
                      key={name}
                      className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60 hover:bg-gray-100 transition-colors"
                      title={name}
                    >
                      {breakdown.icons && breakdown.icons[name] && (
                        <Image
                          src={breakdown.icons[name]}
                          alt={name}
                          width={24}
                          height={24}
                          className="object-contain rounded-full"
                        />
                      )}

                      {breakdown.useInitials && !breakdown.icons?.[name] && (
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-full ${
                            colorClasses[breakdown.color || 'blue']
                          } text-[10px] font-semibold`}
                        >
                          {getFirstLetter(name)}
                        </span>
                      )}

                      <span className="text-sm font-semibold text-gray-700">
                        {breakdown.formatValue ? breakdown.formatValue(val) : val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
