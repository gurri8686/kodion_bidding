'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../../../components/Sidebar";
import GlobalHeader from "../../../components/GlobalHeader";
import { Loader } from "../../../utils/Loader";
import { useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import axios from "axios";
import ApplyManualJob from "../../../modals/ApplyManualJob";
import AppliedJobCard from "../../../components/cards/AppliedCard";
import JobSearch from "../../../components/JobSearch";
import { LayoutGrid, Table, Paperclip } from "lucide-react";
import HiredJobModal from "../../../modals/HiredJob";
import EditAppliedJobModal from "../../../modals/EditAppliedModal";
import MarkAsReplyModal from "../../../modals/MarkAsReplyModal";
import MarkAsInterviewModal from "../../../modals/MarkAsInterviewModal";
import ViewStageDetailsModal from "../../../modals/ViewStageDetailsModal";
import MarkAsNotHiredModal from "../../../modals/MarkAsNotHiredModal";
import MediaGalleryModal from "../../../modals/MediaGalleryModal";
import { createPortal } from "react-dom";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths, subYears } from "date-fns";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const jobsPerPage = 6;

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applyModal, setApplyModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [stageFilter, setStageFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState("card");
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
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);
  const userId = user.id;
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
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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
        setIsCustomRange(true);
        setDateLabel("Custom Range");
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

  const fetchAppliedJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      if (!isInitialLoad) {
        await new Promise((r) => setTimeout(r, 0));
      }

      try {
        const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
        const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");

        const response = await axios.get(
          `/api/jobs/applied-jobs/${userId}`,
          {
            params: {
              userId,
              page,
              limit: jobsPerPage,
              searchTerm: debouncedSearch || undefined,
              stage: stageFilter || undefined,
              startDate,
              endDate,
            },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        const data = response.data;

        setTotalCount(data.totalCount);
        setAppliedJobs(data.jobs);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage - 1);
        setIsInitialLoad(false);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, stageFilter, token, userId, isInitialLoad, dateRange]
  );

  useEffect(() => {
    fetchAppliedJobs(1);
  }, [debouncedSearch, stageFilter, fetchAppliedJobs]);

  const handlePageChange = ({ selected }: any) => {
    fetchAppliedJobs(selected + 1);
  };

  const handleClearSearch = () => setSearchTerm("");

  const handleApply = async () => {
    await fetchAppliedJobs(1);
    setApplyModal(false);
  };

  const hasActiveFilters = debouncedSearch !== "" || stageFilter !== "";

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="Applied Jobs" />
        <main className="p-3 sm:p-6 lg:p-8">
          <ApplyManualJob
            isOpen={applyModal}
            onRequestClose={() => setApplyModal(false)}
            onApplyJob={handleApply}
            fetchAppliedJobs={fetchAppliedJobs}
          />

          {!isInitialLoad && (
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-5">
                  <div className="w-full lg:flex-1 max-w-2xl">
                    <JobSearch
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      handleclearSearch={handleClearSearch}
                      onSearch={() => {
                        setDebouncedSearch(searchTerm.trim());
                        setCurrentPage(0);
                      }}
                      page="applied"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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

                    <button
                      onClick={() => setApplyModal(true)}
                      className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium text-sm w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Job
                    </button>
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
                        value={isCustomRange ? "Custom Range" : dateLabel}
                        onChange={(e) => applyDateFilter(e.target.value)}
                      >
                        {dateFilterOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
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

                  <div className="relative flex-1 sm:max-w-xs">
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                      Job Stage
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                      >
                        <option value="">All Stages</option>
                        <option value="replied">Replied</option>
                        <option value="interview">Interviewed</option>
                        <option value="hired">Hired</option>
                        <option value="not-hired">Not Hired</option>
                      </select>
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader />
            </div>
          ) : !error && totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-700">
                No Jobs Found
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                {dateLabel === "All"
                  ? "You haven't applied to any jobs yet."
                  : `No jobs applied during "${dateLabel}".`}
              </p>
              <p className="text-gray-400 mt-1 text-xs">
                Try selecting a different date range or add a new job.
              </p>
              <button
                onClick={() => setApplyModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                Add Job
              </button>
            </div>
          ) : (
            <>
              {appliedJobs.length > 0 && (
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600 font-medium">
                    Showing <span className="font-semibold text-gray-800">{currentPage * jobsPerPage + 1}-{Math.min((currentPage + 1) * jobsPerPage, totalCount)}</span> of <span className="font-semibold text-gray-800">{totalCount}</span> {hasActiveFilters ? 'filtered' : ''} jobs
                  </p>
                </div>
              )}

              {appliedJobs.length > 0 && (
                <div className="relative">
                  {loading && !isInitialLoad && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 z-10 flex items-center justify-center">
                      <Loader />
                    </div>
                  )}

                  {viewMode === "card" ? (
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
                      {appliedJobs.map((job: any) => (
                        <AppliedJobCard
                          key={job.id}
                          job={job}
                          fetchAppliedJobs={fetchAppliedJobs}
                        />
                      ))}
                    </div>
                  ) : (
                    <AppliedJobsTable
                      jobs={appliedJobs}
                      fetchAppliedJobs={fetchAppliedJobs}
                    />
                  )}
                </div>
              )}

              {appliedJobs.length > 0 && totalPages > 1 && (
                <div className="flex justify-center mt-8 overflow-x-auto pb-2">
                  <ReactPaginate
                    previousLabel={"← Prev"}
                    nextLabel={"Next →"}
                    pageCount={totalPages}
                    onPageChange={handlePageChange}
                    forcePage={currentPage}
                    containerClassName={"flex text-xs sm:text-sm space-x-1 sm:space-x-2"}
                    pageClassName="border rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white"
                    pageLinkClassName="min-w-[32px] sm:min-w-[40px] px-2 sm:px-4 py-2 block text-center"
                    previousClassName="border rounded-lg bg-gray-300 hover:bg-gray-400"
                    previousLinkClassName="px-2 sm:px-4 py-2 block whitespace-nowrap"
                    nextClassName="border rounded-lg bg-gray-300 hover:bg-gray-400"
                    nextLinkClassName="px-2 sm:px-4 py-2 block whitespace-nowrap"
                    activeClassName="bg-blue-600 border-blue-600 text-black"
                    disabledClassName="opacity-50 cursor-not-allowed"
                  />
                </div>
              )}
            </>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-red-200">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4 w-full max-w-2xl">
                <p className="font-semibold">Error loading jobs</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={() => fetchAppliedJobs(1)}
                  className="mt-3 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
              <p className="text-gray-600 mb-4">Or add a new job to get started</p>
              <button
                onClick={() => setApplyModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Add Job
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const AppliedJobsTable = ({ jobs, fetchAppliedJobs }: any) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isHiredModalOpen, setIsHiredModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNotHiredModalOpen, setIsNotHiredModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuCoords, setMenuCoords] = useState<any>(null);
  const [isMediaGalleryOpen, setIsMediaGalleryOpen] = useState(false);
  const [attachmentsToShow, setAttachmentsToShow] = useState([]);

  useEffect(() => {
    if (openMenuId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [openMenuId]);

  const safeJsonParse = (jsonString: any, fallback = []) => {
    try {
      return jsonString ? JSON.parse(jsonString) : fallback;
    } catch {
      return fallback;
    }
  };

  const getStageDisplay = (stage: string) => {
    const stages: any = {
      applied: { label: "Applied", color: "bg-gray-100 text-gray-700" },
      replied: { label: "Replied", color: "bg-blue-100 text-blue-700" },
      interview: { label: "Interview", color: "bg-purple-100 text-purple-700" },
      hired: { label: "Hired", color: "bg-green-100 text-green-700" },
      "not-hired": { label: "Not Hired", color: "bg-red-100 text-red-700" },
    };
    return stages[stage] || { label: "-", color: "bg-gray-100 text-gray-700" };
  };

  const handleStageUpdate = (job: any, stage: string) => {
    setSelectedJob(job);
    if (stage === "replied") setIsReplyModalOpen(true);
    if (stage === "interview") setIsInterviewModalOpen(true);
    if (stage === "hired") setIsHiredModalOpen(true);
    if (stage === "not-hired") setIsNotHiredModalOpen(true);
    setOpenMenuId(null);
    setMenuCoords(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Job Title</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Profile</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Technologies</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Connects</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Stage</th>
                <th className="text-left py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Applied Date</th>
                <th className="text-center py-2 md:py-3 px-2 md:px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((job: any) => {
                const title = job.manualJobTitle || job.Job?.title || "No Title";
                const jobLink = job.Job?.link || job.manualJobUrl;
                const appliedDate = new Date(job.appliedAt).toLocaleDateString();
                const technologies = safeJsonParse(job.technologies);
                const stageDisplay = getStageDisplay(job.stage);
                const attachments = safeJsonParse(job.attachments, []);

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
                              {title}
                            </a>
                          ) : (
                            title
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
                    <td className="py-2 md:py-3 px-2 md:px-4 text-w-700">
                      <div className="max-w-[120px] truncate">
                        {job?.profile?.name || "N/A"}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {technologies.length > 0 ? (
                          technologies.slice(0, 2).map((tech: string, i: number) => (
                            <span
                              key={i}
                              className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded"
                            >
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                        {technologies.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{technologies.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center text-gray-700 font-medium">
                      {job.connectsUsed}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${stageDisplay.color}`}
                      >
                        {stageDisplay.label}
                      </span>
                      {["replied", "interview", "not-hired"].includes(job.stage) && (
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setIsDetailsModalOpen(true);
                          }}
                          className="block text-[11px] text-blue-600 underline mt-1 mx-auto"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-gray-600 text-xs whitespace-nowrap">
                      {appliedDate}
                    </td>
                    <td className="py-2 md:py-3 px-2 md:px-4 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            if (openMenuId === job.id) {
                              setOpenMenuId(null);
                              setMenuCoords(null);
                            } else {
                              setOpenMenuId(job.id);
                              setMenuCoords(rect);
                            }
                          }}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg
                            className="w-4 h-4 md:w-5 md:h-5 text-gray-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {openMenuId && menuCoords && (() => {
        const job = jobs.find((j: any) => j.id === openMenuId);
        if (!job) return null;
        const jobLink = job.Job?.link || job.manualJobUrl;
        const attachments = safeJsonParse(job.attachments, []);

        return typeof window !== 'undefined' && createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${menuCoords.bottom + 6}px`,
              left: `${Math.max(8, menuCoords.right - 192)}px`,
              width: 192,
            }}
            className="bg-white border border-gray-200 rounded-md shadow-lg z-50"
            onMouseLeave={() => { setOpenMenuId(null); setMenuCoords(null); }}
          >
            <div className="flex flex-col">
              {job.proposalLink && (
                <a
                  href={job.proposalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                >
                  View Proposal
                </a>
              )}
              {jobLink && (
                <a
                  href={jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50"
                >
                  View Job
                </a>
              )}
              <div className="border-t my-1"></div>
              {attachments.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setAttachmentsToShow(attachments);
                    setIsMediaGalleryOpen(true);
                    setOpenMenuId(null);
                    setMenuCoords(null);
                  }}
                  className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                >
                  View Attachments
                </button>
              )}
              <button
                onClick={() => { handleStageUpdate(job, "replied"); }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Mark as Replied
              </button>
              <button
                onClick={() => { handleStageUpdate(job, "interview"); }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Mark as Interview
              </button>
              <button
                onClick={() => { handleStageUpdate(job, "hired"); }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Mark as Hired
              </button>
              <button
                onClick={() => { handleStageUpdate(job, "not-hired"); }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Mark as Not Hired
              </button>
              <div className="border-t my-1"></div>
              <button
                onClick={() => { setSelectedJob(job); setIsEditModalOpen(true); setOpenMenuId(null); setMenuCoords(null); }}
                className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
              >
                Edit Job
              </button>
            </div>
          </div>,
          document.body
        );
      })()}

      {selectedJob && (
        <>
          <HiredJobModal
            isOpen={isHiredModalOpen}
            onClose={() => setIsHiredModalOpen(false)}
            jobId={(selectedJob as any).id}
            job={selectedJob}
            fetchAppliedJobs={fetchAppliedJobs}
          />
          <EditAppliedJobModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            job={selectedJob}
            fetchAppliedJobs={fetchAppliedJobs}
          />
          <MarkAsReplyModal
            isOpen={isReplyModalOpen}
            onClose={() => setIsReplyModalOpen(false)}
            job={selectedJob}
            fetchAppliedJobs={fetchAppliedJobs}
          />
          <MarkAsInterviewModal
            isOpen={isInterviewModalOpen}
            onClose={() => setIsInterviewModalOpen(false)}
            job={selectedJob}
            fetchAppliedJobs={fetchAppliedJobs}
          />
          <ViewStageDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            job={selectedJob}
          />
          <MarkAsNotHiredModal
            isOpen={isNotHiredModalOpen}
            onClose={() => setIsNotHiredModalOpen(false)}
            job={selectedJob}
            fetchAppliedJobs={fetchAppliedJobs}
          />
        </>
      )}

      <MediaGalleryModal
        isOpen={isMediaGalleryOpen}
        onClose={() => setIsMediaGalleryOpen(false)}
        attachments={attachmentsToShow}
      />
    </>
  );
};

export default AppliedJobs;
