'use client';

import { useEffect, useState, useRef, useCallback } from "react";
import Sidebar from "../../../components/Sidebar";
import GlobalHeader from "../../../components/GlobalHeader";
import UniversalJobCard from "../../../components/cards/UniversalJobCard";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { Loader } from "../../../utils/Loader";
import { Briefcase, Search, LayoutGrid, Table, Paperclip } from "lucide-react";
import { DateRange } from "react-date-range";
import MediaGalleryModal from "../../../modals/MediaGalleryModal";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  format,
} from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const HiredJobs = () => {
  const [hiredJobs, setHiredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const token = useSelector((state: any) => state.auth.token);
  const userId = useSelector((state: any) => state.auth.userId);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const jobsPerPage = 6;

  const [dateRange, setDateRange] = useState([
    {
      startDate: startOfWeek(new Date()),
      endDate: endOfWeek(new Date()),
      key: "selection",
    },
  ]);
  const [dateLabel, setDateLabel] = useState("This Week");
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const pickerRef = useRef(null);

  const dateFilterOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Year",
    "Last Year",
    "All",
    "Custom Range",
  ];

  useEffect(() => {
    const handleOutside = (e: any) => {
      if (pickerRef.current && !(pickerRef.current as any).contains(e.target)) {
        setShowCustomPicker(false);
      }
    };

    if (showCustomPicker) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showCustomPicker]);

  const applyDateFilter = (option: string) => {
    const now = new Date();
    let start, end;

    switch (option) {
      case "Today":
        start = end = now;
        break;

      case "Yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        start = end = yesterday;
        break;
      }

      case "This Week":
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;

      case "Last Week":
        start = startOfWeek(subWeeks(now, 1));
        end = endOfWeek(subWeeks(now, 1));
        break;

      case "This Month":
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;

      case "Last Month": {
        const prev = subMonths(now, 1);
        start = startOfMonth(prev);
        end = endOfMonth(prev);
        break;
      }

      case "This Year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;

      case "Last Year": {
        const lastYear = subYears(now, 1);
        start = startOfYear(lastYear);
        end = endOfYear(lastYear);
        break;
      }

      case "All": {
        start = subYears(now, 10);
        end = now;
        break;
      }

      case "Custom Range":
        setShowCustomPicker(true);
        return;

      default:
        return;
    }

    setDateLabel(option);
    setDateRange([{ startDate: start, endDate: end, key: "selection" }]);
    setShowCustomPicker(false);
    setIsCustomRange(false);
    setCurrentPage(0);
  };

  const handleCustomRangeChange = (item: any) => {
    setDateRange([item.selection]);
  };

  const handleApplyCustomRange = () => {
    setShowCustomPicker(false);
    const startStr = dateRange[0].startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endStr = dateRange[0].endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    setDateLabel(`${startStr} - ${endStr}`);
    setIsCustomRange(true);
    setCurrentPage(0);
  };

  const fetchHiredJobs = useCallback(
    async (page = 1) => {
      if (!userId) return;

      try {
        setLoading(true);
        const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
        const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

        const res = await axios.get(
          `/api/jobs/get-hired-jobs/${userId}`,
          {
            params: {
              page,
              limit: jobsPerPage,
              startDate,
              endDate,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        setHiredJobs(res.data.hiredJobs);
        setTotalCount(res.data.totalCount || 0);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(page - 1);
      } catch (err) {
        console.error("Failed to fetch hired jobs:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId, token, dateRange, jobsPerPage]
  );

  useEffect(() => {
    fetchHiredJobs(1);
  }, [fetchHiredJobs]);

  const handlePageChange = ({ selected }: any) => {
    fetchHiredJobs(selected + 1);
  };

  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="Hired Jobs" />
        <main className="p-8">
          {!loading && (
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-5">
                  <div className="w-full lg:flex-1 max-w-2xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search by job title, client, or profile..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => setViewMode("card")}
                        className={`flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 transition-all text-sm font-medium ${
                          viewMode === "card"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-transparent text-gray-600 hover:bg-white"
                        }`}
                        title="Card View"
                      >
                        <LayoutGrid size={18} />
                        <span>Cards</span>
                      </button>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <button
                        onClick={() => setViewMode("table")}
                        className={`flex-1 sm:flex-none px-4 py-2.5 flex items-center justify-center gap-2 transition-all text-sm font-medium ${
                          viewMode === "table"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-transparent text-gray-600 hover:bg-white"
                        }`}
                        title="Table View"
                      >
                        <Table size={18} />
                        <span>Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mb-5"></div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 sm:max-w-xs">
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Date Range
                    </label>
                    <div className="relative" ref={pickerRef}>
                      <select
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={dateLabel}
                        onChange={(e) => applyDateFilter(e.target.value)}
                      >
                        {dateFilterOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {isCustomRange && !dateFilterOptions.includes(dateLabel) && (
                          <option value={dateLabel}>{dateLabel}</option>
                        )}
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {isCustomRange && (
                        <div className="mt-1 text-xs text-blue-600 font-medium">
                          {dateLabel}
                        </div>
                      )}

                      {showCustomPicker && (
                        <div className="absolute z-50 top-[75px] left-0 bg-white shadow-2xl border border-gray-200 rounded-xl p-4">
                          <DateRange
                            editableDateInputs
                            ranges={dateRange}
                            onChange={handleCustomRangeChange}
                            maxDate={new Date()}
                          />
                          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={() => setShowCustomPicker(false)}
                              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleApplyCustomRange}
                              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <Loader />
          ) : hiredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
              <Briefcase size={48} className="text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
                No Hired Jobs Found
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                No hired jobs found for the selected date range. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Showing <span className="font-semibold text-gray-800">{currentPage * jobsPerPage + 1}-{Math.min((currentPage + 1) * jobsPerPage, totalCount)}</span> of <span className="font-semibold text-gray-800">{totalCount}</span> hired jobs
                </p>
              </div>

              {viewMode === "card" ? (
                <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                  {hiredJobs.map((job: any) => (
                    <UniversalJobCard key={job.id} job={job} type="hired" fetchJobs={() => fetchHiredJobs(currentPage + 1)} />
                  ))}
                </div>
              ) : (
                <HiredJobsTable jobs={hiredJobs} />
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <ReactPaginate
                    previousLabel={"← Previous"}
                    nextLabel={"Next →"}
                    pageCount={totalPages}
                    onPageChange={handlePageChange}
                    forcePage={currentPage}
                    containerClassName={"flex text-sm space-x-2"}
                    pageClassName="border rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white"
                    pageLinkClassName="px-4 py-2 block text-center"
                    previousClassName="border rounded-lg bg-gray-300 hover:bg-gray-400"
                    previousLinkClassName="px-4 py-2 block whitespace-nowrap"
                    nextClassName="border rounded-lg bg-gray-300 hover:bg-gray-400"
                    nextLinkClassName="px-4 py-2 block whitespace-nowrap"
                    activeClassName="bg-blue-600 border-blue-600 text-black"
                    disabledClassName="opacity-50 cursor-not-allowed"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

const HiredJobsTable = ({ jobs }: any) => {
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  const safeJsonParse = (jsonString: any, fallback = []) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleViewMedia = (attachments: any) => {
    setSelectedAttachments(attachments);
    setIsMediaGalleryOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Job Title</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Client</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Profile</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Developer</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Budget</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Hired Date</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Notes</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => {
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

                const jobTitle = jobDetails?.title || appliedJobDetails?.manualJobTitle || 'Untitled Job';
                const jobLink = jobDetails?.link || appliedJobDetails?.manualJobUrl;
                const hiredDate = new Date(hiredAt).toLocaleDateString();
                const attachments = safeJsonParse(appliedJobDetails?.attachments, []);

                return (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <div className="font-medium text-gray-900 max-w-[200px]">
                        <div className="truncate">
                          {jobLink ? (
                            <a
                              href={jobLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {jobTitle}
                            </a>
                          ) : (
                            jobTitle
                          )}
                        </div>
                        {attachments.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Paperclip size={12} />
                            <span>{attachments.length} file{attachments.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">
                      <div className="max-w-[150px] truncate">
                        {clientName || "N/A"}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">
                      <div className="max-w-[120px] truncate">
                        {profileName || "N/A"}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-700">
                      <div className="max-w-[120px] truncate">
                        {developerDetails?.name || "N/A"}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 font-medium">
                      <div className="flex flex-col items-center">
                        <span>${budgetAmount}</span>
                        <span className="text-xs text-gray-500">({budgetType})</span>
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-600 text-xs whitespace-nowrap">
                      {hiredDate}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600">
                      <div className="max-w-[200px] truncate" title={notes || ""}>
                        {notes ? (
                          <span className="italic text-xs">{notes}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      {attachments.length > 0 && (
                        <button
                          onClick={() => handleViewMedia(attachments)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-xs font-medium border border-purple-200 transition-colors"
                        >
                          <Paperclip size={13} />
                          <span>View Media</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        attachments={selectedAttachments}
      />
    </>
  );
};

export default HiredJobs;
