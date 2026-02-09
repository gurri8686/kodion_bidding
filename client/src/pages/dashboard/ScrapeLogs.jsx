import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import GlobalHeader from "../../components/GlobalHeader";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader } from "../../utils/Loader";
import { format } from "date-fns";
import { UnifiedDateTimePicker } from "../../components/UnifiedDateTimePicker";

const ScrapeLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // default to today
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = {
          filterType: "custom", // always custom now
          customDate: format(selectedDate, "yyyy-MM-dd"),
        };

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/jobs/scrape-logs`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
            params,
          }
        );
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token, selectedDate]);

  const groupedLogs = logs.reduce((acc, log) => {
    const dateKey = new Date(log.scrapedAt).toDateString();
    acc[dateKey] = acc[dateKey] || [];
    acc[dateKey].push(log);
    return acc;
  }, {});

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="Scrape Logs" />
        <main className="p-6">

        {/* Date Picker only */}
        <div className="bg-white p-4 rounded shadow mb-6 flex items-center gap-4">
          <label className="text-sm font-medium">Select Date:</label>
          <UnifiedDateTimePicker
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            withTime={false}
          />
        </div>

        {/* Loader or Logs */}
        {loading ? (
          <Loader />
        ) : logs.length === 0 ? (
          <p className="text-gray-600">No logs available.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([dateKey, logsForDate]) => (
              <div key={dateKey} className="bg-white rounded shadow p-4">
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
      </main>
      </div>
    </div>
  );
};

const TechnologyRow = ({ log }) => {
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

export default ScrapeLogs;
