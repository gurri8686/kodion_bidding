'use client';

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import GlobalHeader from "../../../components/GlobalHeader";
import axios from "axios";
import JobFilters from "../../../components/JobFilters";
import { useSelector } from "react-redux";
import { Loader } from "../../../utils/Loader";
import ReactPaginate from "react-paginate";
import JobCard from "../../../components/cards/JobCard";

const IgnoredJobs = () => {
  const [ignoredJobs, setIgnoredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const jobsPerPage = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

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
  const userId = useSelector((state: any) => state.auth.userId);
  const token = useSelector((state: any) => state.auth.token);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIgnoredJobs = async (page = 1) => {
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
      const response = await axios.get(
        `/api/jobs/get-ignored-jobs`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setIgnoredJobs(response.data.jobs || []);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage - 1);
      setTotalCount(response.data.totalCount);
    } catch (err: any) {
      console.error("Error fetching ignored jobs:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilter = async () => {
    setIsApplying(true);
    try {
      await fetchIgnoredJobs(1);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const clearFilters = () => {
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

  const handlePageChange = ({ selected }: any) => {
    fetchIgnoredJobs(selected + 1);
  };

  useEffect(() => {
    if (userId && token) {
      fetchIgnoredJobs(1);
    }
  }, [userId, token, filters]);

  const handleApplyJob = async (jobId: any) => {
    fetchIgnoredJobs(1);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="Ignored Jobs" />
        <main className="p-8">
          <div className="flex lg:items-center lg:flex-row flex-col justify-between mb-3">
            <p className="text-gray-700 font-medium">
              Displaying <span className="font-bold">{ignoredJobs.length}</span> job{ignoredJobs.length !== 1 ? 's' : ''} on this page — <span className="font-bold">{totalCount}</span> job{totalCount !== 1 ? 's' : ''} found in total
            </p>
          </div>
          <JobFilters
            filters={filters}
            setFilters={setFilters}
            isApplying={isApplying}
            handleApplyFilter={handleApplyFilter}
            handleClearFilter={clearFilters}
            fetchJobs={fetchIgnoredJobs}
            setIsLoading={setIsLoading}
          />
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
                {ignoredJobs.length > 0 ? (
                  ignoredJobs.map((job: any, index: number) => (
                    <JobCard
                      key={job.jobId}
                      job={job}
                      mode="ignored"
                      onApply={handleApplyJob}
                    />
                  ))
                ) : (
                  <p className="text-center text-gray-600 text-lg flex justify-center mt-[130px] mx-auto">
                    No jobs found matching your filters
                  </p>
                )}
                {ignoredJobs.length > 5 && (
                  <div className="flex justify-center mt-8">
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
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default IgnoredJobs;
