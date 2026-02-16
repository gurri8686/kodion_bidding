'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader } from "@/utils/Loader";
import { format } from "date-fns";
import { UnifiedDateTimePicker } from "@/components/UnifiedDateTimePicker";
import { FileText } from "lucide-react";
import GlobalHeader from '@/components/GlobalHeader';

interface TechCount {
  technology: string;
  count: number;
}

interface ScrapeLogEntry {
  scrapeLogId: number;
  totalJobCount: number;
  scrapedAt: string;
  technologies: TechCount[];
}

const TechnologyRow = ({ log }: { log: ScrapeLogEntry }) => {
  const [showAll, setShowAll] = useState(false);
  const shownTechs = showAll
    ? log.technologies
    : log.technologies.slice(0, 5);

  return (
    <tr>
      <td className="px-4 py-2">
        {new Date(log.scrapedAt).toLocaleTimeString()}
      </td>
      <td className="px-4 py-2">{log.totalJobCount}</td>
      <td className="px-4 py-2">
        <div className="flex flex-wrap gap-2 items-start">
          {shownTechs.map(({ technology, count }) => (
            <span
              key={technology}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
            >
              {technology}: {count}
            </span>
          ))}
          {log.technologies.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showAll
                ? "Show less"
                : `+${log.technologies.length - 5} more`}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const ScrapeLogs = () => {
  const [logs, setLogs] = useState<ScrapeLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = {
          filterType: "custom",
          customDate: format(selectedDate, "yyyy-MM-dd"),
        };

        const { data } = await axios.get(`/api/jobs/scrape-logs`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          params,
        });
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLogs();
    }
  }, [token, selectedDate]);

  const groupedLogs = logs.reduce<Record<string, ScrapeLogEntry[]>>((acc, log) => {
    const dateKey = new Date(log.scrapedAt).toDateString();
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 bg-gray-50">
        <GlobalHeader title="Scrape Logs" />
        <div className="p-8">

      {/* Date Picker */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Date:</label>
        <div className="w-64">
          <UnifiedDateTimePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            withTime={false}
          />
        </div>
      </div>

      {/* Loader or Logs */}
      {loading ? (
        <Loader />
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
          <FileText size={48} className="text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">No Logs Found</h2>
          <p className="text-gray-500 mt-2 text-sm">
            No scrape logs available for the selected date.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([dateKey, logsForDate]) => (
            <div key={dateKey} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                {dateKey}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Time
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Total Jobs
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Technologies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logsForDate.map((log) => (
                      <TechnologyRow key={log.scrapeLogId} log={log} />
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
    </div>
  );
};

export default ScrapeLogs;
