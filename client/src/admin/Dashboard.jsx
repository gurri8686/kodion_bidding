import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Zap,
  MessageSquare,
  Video,
  CircleCheckBig,
  CircleX,
  Target,
  DollarSign,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader } from "../utils/Loader";
import CountUp from "react-countup";
import DashboardFilters from "./components/DashboardFilters";
import GlobalHeader from "../components/GlobalHeader";

// ---- Platform Icons ----
import upworkIcon from "../assets/upwork-icon.png";
import freelancerIcon from "../assets/freelancer-icon.png";
import guruIcon from "../assets/guru-icon.png";
import linkedInIcon from "../assets/linkedIn-icon.png";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
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
        start: "",
        end: "",
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

  const [filters, setFilters] = useState(null);
  const token = useSelector((state) => state.auth.token);

  // Memoize setFilters to prevent unnecessary re-renders
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const fetchJobStats = useCallback(async (appliedFilters = {}) => {
    try {
      setLoading(true);
      const { platform, userProfile, bidder, startDate, endDate } =
        appliedFilters || {};

      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/job-stats`,
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
      console.error("Error fetching job stats:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const platformIcons = {
    Upwork: upworkIcon,
    Freelancer: freelancerIcon,
    Guru: guruIcon,
    LinkedIn: linkedInIcon,
  };
 

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Global Header with Page Title and Notification Bell */}
        <GlobalHeader title="Dashboard" />

        <DashboardFilters onFilterChange={handleFilterChange} />
        {loading ? (
          <Loader />
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {/* Applied Jobs */}
              <DashboardCard
                title="Applied Jobs"
                value={summary.totalAppliedJobs}
                icon={<FileText className="text-blue-600" size={24} />}
                breakdowns={[
                  {
                    label: "Platform",
                    data:
                      summary.appliedJobsBreakdown ||
                      summary.appliedPlatformBreakdown ||
                      {},
                    icons: platformIcons,
                  },
                  {
                    label: "User",
                    data: summary.appliedUserWise || {},
                    useInitials: true,
                    color: "blue",
                  },
                  {
                    label: "Profile",
                    data: summary.appliedProfileWise || {},
                    useInitials: true,
                    color: "indigo",
                  },
                ]}
              />

              {/* Cost */}
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
                    label: "Platform",
                    data: summary.costBreakdown || {},
                    icons: platformIcons,
                    formatValue: (val) => `$${val.toFixed(2)}`,
                  },
                  {
                    label: "User",
                    data: summary.costUserWise || {},
                    useInitials: true,
                    color: "yellow",
                    formatValue: (val) => `$${val.toFixed(2)}`,
                  },
                  {
                    label: "Profile",
                    data: summary.costProfileWise || {},
                    useInitials: true,
                    color: "orange",
                    formatValue: (val) => `$${val.toFixed(2)}`,
                  },
                ]}
              />

              {/* Connects Used */}
              <DashboardCard
                title="Connects Used"
                value={summary.totalConnectsUsed}
                icon={<Zap className="text-amber-600" size={24} />}
                breakdowns={[
                  {
                    label: "Platform",
                    data: summary.connectsBreakdown || {},
                    icons: platformIcons,
                  },
                  {
                    label: "User",
                    data: summary.connectsUserWise || {},
                    useInitials: true,
                    color: "teal",
                  },
                  {
                    label: "Profile",
                    data: summary.connectsProfileWise || {},
                    useInitials: true,
                    color: "cyan",
                  },
                ]}
              />

              {/* Weekly Target */}
              {summary.weeklyTarget ? (
                <DashboardCard
                  title="Weekly Target"
                  value={summary.weeklyTarget.target_amount}
                  icon={<Target className="text-purple-600" size={24} />}
                  formatValue={(val) => `$${val}`}
                  breakdowns={[
                    {
                      label: "User Target",
                      data: Object.entries(
                        summary.weeklyTargetUserWise || {}
                      ).reduce((acc, [user, data]) => {
                        acc[user] = data.target;
                        return acc;
                      }, {}),
                      useInitials: true,
                      color: "orange",
                      formatValue: (val) => `$${val}`,
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
                    label: "Platform",
                    data: summary.repliedPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: "User",
                    data: summary.repliedUserWise || {},
                    useInitials: true,
                    color: "teal",
                  },
                  {
                    label: "Profile",
                    data: summary.repliedProfileWise || {},
                    useInitials: true,
                    color: "cyan",
                  },
                ]}
              />

              {/* Interviewed */}
              <DashboardCard
                title="Interviewed"
                value={summary.totalInterviewed}
                icon={<Video className="text-indigo-600" size={24} />}
                breakdowns={[
                  {
                    label: "Platform",
                    data: summary.interviewPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: "User",
                    data: summary.interviewUserWise || {},
                    useInitials: true,
                    color: "purple",
                  },
                  {
                    label: "Profile",
                    data: summary.interviewProfileWise || {},
                    useInitials: true,
                    color: "pink",
                  },
                ]}
              />

              {/* Hired Jobs */}
              <DashboardCard
                title="Hired Jobs"
                value={summary.totalHiredJobs}
                icon={<CircleCheckBig className="text-green-600" size={24} />}
                breakdowns={[
                  {
                    label: "Platform",
                    data: summary.hiredPlatformWise || {},
                    icons: platformIcons,
                  },
                  {
                    label: "User",
                    data: summary.hiredUserWise || {},
                    useInitials: true,
                    color: "purple",
                  },
                  {
                    label: "Profile",
                    data: summary.hiredProfileWise || {},
                    useInitials: true,
                    color: "pink",
                  },
                ]}
              />

              {/* Not Hired */}
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
};

export default Dashboard;

// ---------------------------------------------
// Dashboard Card Component
// ---------------------------------------------
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
}) => {
  // Helper function to get first letter from name
  const getFirstLetter = (name) => {
    return name.charAt(0).toUpperCase();
  };

  // Color mapping for user/profile badges - single color for each type
  const colorClasses = {
    blue: "bg-slate-700 text-white", // Users
    indigo: "bg-indigo-600 text-white", // Profiles
    yellow: "bg-slate-700 text-white", // Users (Cost)
    orange: "bg-indigo-600 text-white", // Profiles (Cost)
    teal: "bg-slate-700 text-white", // Users (Connects)
    cyan: "bg-indigo-600 text-white", // Profiles (Connects)
    purple: "bg-slate-700 text-white", // Users
    pink: "bg-indigo-600 text-white", // Profiles
    green: "bg-slate-700 text-white", // Users
  };

  // Get user breakdown data
  const userBreakdown = breakdowns.find(
    (b) => b.label === "User" && b.useInitials
  );
  const userEntries =
    userBreakdown?.data && typeof userBreakdown.data === "object"
      ? Object.entries(userBreakdown.data).filter(([, val]) => val > 0)
      : [];

  // Get non-user breakdowns for the bottom section
  const otherBreakdowns = breakdowns.filter((b) => b.label !== "User");

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200`}
    >
      {/* Header Section */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-2 rounded-md bg-gray-100 shrink-0">{icon}</div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">
                {title}
              </h3>

              {/* Main Value */}
              <div className="flex flex-col gap-0.5">
                <p className="text-3xl font-bold text-gray-900 truncate">
                  {formatValue ? (
                    formatValue(value || 0)
                  ) : (
                    <CountUp
                      end={value || 0}
                      duration={2}
                      decimals={decimals}
                    />
                  )}
                </p>

                {/* Secondary Value (INR) */}
                {secondaryValue !== undefined && formatSecondaryValue && (
                  <p className="text-lg font-medium text-gray-600 truncate">
                    {formatSecondaryValue(secondaryValue || 0)}
                  </p>
                )}
              </div>

              {note && (
                <p className="text-xs text-gray-500 mt-1 italic">{note}</p>
              )}
            </div>
          </div>

          {/* User Breakdown in Top Right */}
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
                    {/* User Initial */}
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                        colorClasses[userBreakdown.color] || colorClasses.blue
                      } text-[10px] font-semibold`}
                    >
                      {getFirstLetter(name)}
                    </span>

                    {/* Value */}
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {userBreakdown.formatValue
                        ? userBreakdown.formatValue(val)
                        : val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breakdowns Section (Platform and Profile only) */}
      {otherBreakdowns.length > 0 && (
        <div className="px-4 pb-4 space-y-3">
          {otherBreakdowns.map((breakdown, index) => {
            const entries =
              breakdown.data && typeof breakdown.data === "object"
                ? Object.entries(breakdown.data).filter(([, val]) => val > 0)
                : [];

            if (entries.length === 0) return null;

            return (
              <div key={index}>
                {breakdown.label && (
                  <p className="text-[10px]  text-gray-500 mb-1.5 uppercase tracking-wider">
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
                      {/* Platform Icon */}
                      {breakdown.icons && breakdown.icons[name] && (
                        <img
                          src={breakdown.icons[name]}
                          alt={name}
                          className="w-6 h-6 object-contain rounded-full"
                        />
                      )}

                      {/* User/Profile Initial */}
                      {breakdown.useInitials && !breakdown.icons?.[name] && (
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-full ${
                            colorClasses[breakdown.color] || colorClasses.blue
                          } text-[10px] font-semibold`}
                        >
                          {getFirstLetter(name)}
                        </span>
                      )}

                      {/* Value */}
                      <span className="text-sm font-semibold text-gray-700">
                        {breakdown.formatValue
                          ? breakdown.formatValue(val)
                          : val}
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
