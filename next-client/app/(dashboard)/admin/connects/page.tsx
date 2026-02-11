"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

interface Log {
  total_connects: string | number;
  profile?: {
    name?: string;
  };
  User?: {
    firstname?: string;
  };
}

interface GroupedData {
  totalConnects: number;
  users: Record<string, number>;
}

const Connects = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const fetchConnectsLogs = async () => {
    try {
      setLoading(true);
      const params = { date: format(selectedDate, "yyyy-MM-dd") };
      const res = await axios.get(
        `/api/connects/all`,
        {
          withCredentials: true,
          params,
        }
      );
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching connects logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnectsLogs();
  }, [selectedDate]);

  // Group logs by profile
  const groupedByProfile = logs.reduce((acc: Record<string, GroupedData>, log) => {
    const profileName = log.profile?.name || "No Profile";
    const userName = log.User?.firstname || "Unknown User";
    const connects = Number(log.total_connects) || 0;
    if (!acc[profileName]) {
      acc[profileName] = {
        totalConnects: 0,
        users: {},
      };
    }

    acc[profileName].totalConnects += connects;
    // Sum connects per user if the same user appears multiple times
    if (acc[profileName].users[userName]) {
      acc[profileName].users[userName] += connects;
    } else {
      acc[profileName].users[userName] = connects;
    }

    return acc;
  }, {});

  // Calculate total connects across all profiles
  const totalConnects = Object.values(groupedByProfile).reduce(
    (sum, profile) => sum + profile.totalConnects,
    0
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-3 md:p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Connects Logs</h1>
        </div>

        {/* Compact Header with inline date picker */}
        <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {Object.keys(groupedByProfile).length} profiles • {totalConnects} total connects
              </p>
            </div>
            <div className="flex-shrink-0">
              <input
                type="date"
                value={format(selectedDate, "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f76a00] focus:border-[#f76a00] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f76a00]"></div>
          </div>
        ) : Object.entries(groupedByProfile).length === 0 ? (
          <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-lg text-center">
            <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm md:text-base text-gray-500">No connects logs found</p>
            <p className="text-gray-400 text-xs md:text-sm mt-1">Try selecting a different date</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
            {Object.entries(groupedByProfile).map(([profileName, data], idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Compact Profile Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-3 md:px-4 py-2 md:py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#f76a00] text-white flex items-center justify-center text-xs md:text-sm font-semibold flex-shrink-0">
                        {profileName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs md:text-sm font-semibold text-gray-900 truncate">
                          {profileName}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {Object.keys(data.users).length} user{Object.keys(data.users).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-600">Total</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900">
                        {data.totalConnects}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-1.5 md:py-2 px-3 md:px-4 text-xs font-medium text-gray-600 uppercase">
                          User
                        </th>
                        <th className="text-right py-1.5 md:py-2 px-3 md:px-4 text-xs font-medium text-gray-600 uppercase">
                          Connects
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(data.users).map(([userName, connects], i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-1.5 md:py-2 px-3 md:px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                {userName.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-900 truncate">
                                {userName}
                              </span>
                            </div>
                          </td>
                          <td className="py-1.5 md:py-2 px-3 md:px-4 text-right">
                            <span className="font-semibold text-gray-900">
                              {connects}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connects;
