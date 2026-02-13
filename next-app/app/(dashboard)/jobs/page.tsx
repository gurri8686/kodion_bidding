'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import 'react-datepicker/dist/react-datepicker.css';
import "react-day-picker/style.css";
import JobFilters from "@/components/JobFilters";
import Modal from "react-modal";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader } from "@/utils/Loader";
import JobCard from "@/components/cards/JobCard";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [ignoreReason, setIgnoreReason] = useState("");
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [jobId, setJobId] = useState(null);
  const jobsPerPage = 6;
  const [totalCount, setTotalCount] = useState(0);
  const token = useSelector((state: any) => state.auth.token);
  const userId = useSelector((state: any) => state.auth.userId);
  const [filters, setFilters] = useState({
    selectedTechnologies: [],
    rating: null,
    startDate: null,
    endDate: null,
    searchTerm: '',
    jobType: 'all',
    hourlyMinRate: '',
    hourlyMaxRate: '',
    fixedPriceRange: '',
    customFixedMin: '',
    customFixedMax: ''
  });

  const fetchJobs = async (page = 1) => {
    setIsLoading(true);
    const {
      selectedTechnologies,
      rating,
      startDate,
      endDate,
      searchTerm,
      jobType,
      hourlyMinRate,
      hourlyMaxRate,
      fixedPriceRange,
      customFixedMin,
      customFixedMax
    } = filters;

    const params: any = {
      userId,
      page,
      limit: jobsPerPage,
      rating: rating || undefined,
      tech: selectedTechnologies.length > 0 ? selectedTechnologies.map((t: any) => t.value) : undefined,
      jobType: jobType !== 'all' ? jobType : undefined,
      hourlyMinRate: jobType === 'hourly' && hourlyMinRate ? hourlyMinRate : undefined,
      hourlyMaxRate: jobType === 'hourly' && hourlyMaxRate ? hourlyMaxRate : undefined,
      fixedPriceRange: jobType === 'fixed' ? fixedPriceRange : undefined,
      customFixedMin: jobType === 'fixed' && fixedPriceRange === 'custom' ? customFixedMin : undefined,
      customFixedMax: jobType === 'fixed' && fixedPriceRange === 'custom' ? customFixedMax : undefined,
      title: typeof searchTerm === 'string' ? searchTerm.trim() : undefined,
      startDate: startDate ? (startDate as any).toLocaleDateString('en-CA') : undefined,
      endDate: endDate ? (endDate as any).toLocaleDateString('en-CA') : undefined,
    };

    try {
      const res = await axios.get(`/api/jobs/get-jobs`, {
        params,
        withCredentials: true,
      });
      setJobs(res.data.jobs);
      setTotalCount(res.data.totalCount);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage - 1);
    } catch (err: any) {
      console.error('Error fetching jobs:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchJobs(1);
  }, [filters]);

  // When user applies filters
  const handleApplyFilter = async () => {
    setIsApplying(true);
    try {
      await fetchJobs(1);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClearFilter = () => {
    setFilters({
      selectedTechnologies: [],
      rating: null,
      startDate: null,
      endDate: null,
      searchTerm: '',
      jobType: 'all',
      hourlyMinRate: '',
      hourlyMaxRate: '',
      fixedPriceRange: '',
      customFixedMin: '',
      customFixedMax: ''
    });
    setCurrentPage(0);
  };

  // When user changes page
  const handlePageChange = ({ selected }: { selected: number }) => {
    fetchJobs(selected + 1);
  };

  const openModal = (job: any) => {
    setSelectedJob(job);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIgnoreReason("");
    setModalIsOpen(false);
  };

  const handleIgnore = async () => {
    const finalReason = ignoreReason || customReason.trim();
    if (!finalReason) return toast.error("Please enter a reason.");
    try {
      const response = await axios.post(
        `/api/jobs/ignore`,
        {
          reason: finalReason,
          dropdownReason: ignoreReason || null,
          customReason: customReason.trim() || null,
          job: selectedJob,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Job ignored successfully!");
        closeModal();
        fetchJobs(currentPage + 1);
      }
    } catch (error) {
      console.error("Failed to ignore job:", error);
      toast.error("Failed to ignore job. Please try again.");
    }
  };

  const handleApply = async (jobId: any) => {
    fetchJobs();
    setJobId(jobId);
    setApplyModal(true);
  };

  return (
        <main className="p-8">
          <ToastContainer position="top-center" autoClose={2000} />
          <div className="flex lg:items-center lg:flex-row flex-col justify-between mb-6 text-left ">
            <p className="text-gray-700 font-medium">
              Displaying <span className="font-bold">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''} on this page — <span className="font-bold">{totalCount}</span> job{totalCount !== 1 ? 's' : ''} found in total
            </p>
          </div>
        <JobFilters
          filters={filters}
          setFilters={setFilters}
          isApplying={isApplying}
          handleApplyFilter={handleApplyFilter}
          handleClearFilter={handleClearFilter}
          fetchJobs={fetchJobs}
          setIsLoading={setIsLoading}
          page='jobs'
        />

        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
          {isLoading ? (
            <div className="w-full flex justify-center items-center py-20 col-span-2">
              <Loader />
            </div>
          ) : jobs.length === 0 ? (
            <p className="w-full flex justify-center items-center py-20 col-span-2">No jobs found matching your filters.</p>
          ) : (
            jobs.map((job: any) => (
              <JobCard
                key={job.jobId}
                job={job}
                mode="job"
                onApply={handleApply}
                onIgnore={openModal}
              />
            ))
          )}
        </div>

        {jobs.length > 5 && !isLoading && (
          <div className="mt-8 flex justify-center">
                <ReactPaginate
                        previousLabel={"←"}
                        nextLabel={"→"}
                        pageCount={totalPages}
                        onPageChange={handlePageChange}
                        forcePage={currentPage}
                        containerClassName="flex flex-wrap justify-center gap-2 text-sm sm:space-x-2 sm:gap-0"
                        pageClassName="border rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white text-xs sm:text-sm"
                        pageLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block text-center"
                        previousClassName="border rounded-lg bg-gray-300 hover:bg-gray-400 text-xs sm:text-sm"
                        previousLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block"
                        nextClassName="border rounded-lg bg-gray-300 hover:bg-gray-400 text-xs sm:text-sm"
                        nextLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block"
                        activeClassName="bg-blue-600 border-blue-600 text-white"
                        disabledClassName="opacity-50 cursor-not-allowed"
                      />
          </div>
        )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Ignore Reason"
        className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-20 outline-none"
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 } }}
      >
        <h2 className="text-xl font-bold mb-4">Why are you ignoring this job?</h2>

        <label className="block mb-1 font-medium">Select a reason:</label>
        <select
          value={ignoreReason}
          onChange={(e) => setIgnoreReason(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          <option value="">Select a reason</option>
          {[
            "Job not interested",
            "Poor reviews about the client",
            "Doesn't Match Skills",
            "Budget too low",
            "Not in my preferred location",
          ].map((reason, idx) => (
            <option key={idx} value={reason}>
              {reason}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or write your own reason:
        </label>

        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Tell us why you're skipping this job..."
          className="w-full p-2 border rounded-md mb-4 resize-none"
          rows={3}
        />

        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
            onClick={handleIgnore}
            disabled={!ignoreReason && !customReason.trim()}
          >
            Submit
          </button>
        </div>
      </Modal>

  </main>
  );
};

export default Jobs;
