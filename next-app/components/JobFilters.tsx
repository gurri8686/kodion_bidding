'use client';

import Select from "react-select";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import JobSearch from "./JobSearch";
import { Filter, ChevronDown, X } from "lucide-react";
import { DateRangePickerInput } from "./DateRange";

interface JobFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  fetchJobs: () => void;
  handleClearFilter: () => void;
  isApplying?: boolean;
  handleApplyFilter?: () => void;
  setIsLoading?: (loading: boolean) => void;
  page?: string;
}

const JobFilters = ({
  filters,
  setFilters,
  fetchJobs,
  handleClearFilter,
}: JobFiltersProps) => {
  const userId = useSelector((state: any) => state.auth.userId);
  const token = useSelector((state: any) => state.auth.token);
  const role = useSelector((state: any) => state.auth.user.role);

  const [techOptions, setTechOptions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [errors, setErrors] = useState({
    hourlyRate: "",
  });

  // Date range state for react-date-range
  const [dateRange, setDateRange] = useState([
    {
      startDate: filters.startDate || new Date(),
      endDate: filters.endDate || new Date(),
      key: "selection",
    },
  ]);

  const fixedPriceOptions = [
    { value: "less-than-100", label: "Less than $100" },
    { value: "100-500", label: "$100 to $500" },
    { value: "500-1k", label: "$500 - $1K" },
    { value: "1k-5k", label: "$1K - $5K" },
    { value: "5k-20k", label: "$5K - $20K" },
    { value: "20k-plus", label: "$20K+" },
  ];

  useEffect(() => {
    setLocalFilters(filters);
    if (filters.startDate && filters.endDate) {
      setDateRange([
        {
          startDate: new Date(filters.startDate),
          endDate: new Date(filters.endDate),
          key: "selection",
        },
      ]);
    }
  }, [filters]);

  useEffect(() => {
    const fetchTechOptions = async () => {
      try {
        const endpoint =
          role === "admin"
            ? `/api/jobs/all-technology-names`
            : `/api/jobs/active/${userId}`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        let formatted;

        if (role === "admin") {
          formatted = data.technologies.map((name: string) => ({
            value: name,
            label: name,
          }));
        } else {
          const techList = data.technologies || [];
          formatted = techList
            .filter((t: any) => t.is_active)
            .map((t: any) => ({
              value: t.name,
              label: t.name,
            }));
        }

        setTechOptions(formatted);
      } catch (error) {
        console.error("Failed to load technologies:", error);
      }
    };

    fetchTechOptions();
  }, [role, token, userId]);

  const handleLocalClear = () => {
    const cleared = {
      selectedTechnologies: [],
      rating: null,
      startDate: null,
      endDate: null,
      searchTerm: "",
      jobType: "all",
      hourlyMinRate: "",
      hourlyMaxRate: "",
      fixedPriceRange: "",
      customFixedMin: "",
      customFixedMax: "",
    };
    setLocalFilters(cleared);
    setFilters(cleared);
    setDateRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    handleClearFilter();
    fetchJobs();
  };

  const handleclearSearch = () => {
    setFilters((prev: any) => ({ ...prev, searchTerm: "" }));
    fetchJobs();
  };

  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => {
      const updated = { ...prev, [key]: value };
      if (key === "hourlyMinRate" || key === "hourlyMaxRate") {
        const min = key === "hourlyMinRate" ? value : updated.hourlyMinRate;
        const max = key === "hourlyMaxRate" ? value : updated.hourlyMaxRate;
        if (min && max && Number(min) > Number(max)) {
          setErrors((prev) => ({
            ...prev,
            hourlyRate: "Min rate cannot be more than max rate",
          }));
        } else {
          setErrors((prev) => ({ ...prev, hourlyRate: "" }));
        }
      }
      setFilters(updated);
      return updated;
    });
  };

  const handleDateRangeChange = (range: any) => {
    setDateRange([range.selection]);
    handleChange("startDate", range.selection.startDate);
    handleChange("endDate", range.selection.endDate);
    fetchJobs();
  };

  return (
    <div className="mb-4 bg-white rounded-lg shadow-sm border">
      {/* Header with Search and Filter Toggle */}
      <div className="p-3 border-b">
        <div className="flex gap-3 items-center lg:flex-row flex-col ">
          <div className="flex-1">
            <JobSearch
              searchTerm={localFilters?.searchTerm}
              setSearchTerm={(val: string) => handleChange("searchTerm", val)}
              handleclearSearch={handleclearSearch}
              page='jobs'
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="p-4 space-y-4 bg-gray-50">
          {/* Job Type & Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <div className="flex gap-3">
                {["all", "hourly", "fixed"].map((type) => (
                  <label key={type} className="flex items-center text-sm">
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={localFilters.jobType === type}
                      onChange={(e) => handleChange("jobType", e.target.value)}
                      className="mr-1.5 w-4 h-4"
                    />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Section */}
            <div>
              {localFilters.jobType === "hourly" && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={localFilters.hourlyMinRate}
                      onChange={(e) =>
                        handleChange("hourlyMinRate", e.target.value)
                      }
                      placeholder="Min"
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <input
                      type="number"
                      value={localFilters.hourlyMaxRate}
                      onChange={(e) =>
                        handleChange("hourlyMaxRate", e.target.value)
                      }
                      placeholder="Max"
                      className="w-full p-2 border rounded-md text-sm"
                    />
                  </div>
                  {errors.hourlyRate && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors.hourlyRate}
                    </div>
                  )}
                </>
              )}

              {localFilters.jobType === "fixed" && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Range
                  </label>
                  <select
                    value={localFilters.fixedPriceRange}
                    onChange={(e) =>
                      handleChange("fixedPriceRange", e.target.value)
                    }
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="">Select Budget Range</option>
                    {fixedPriceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Technologies & Rating */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies
              </label>
              <Select
                isMulti
                options={techOptions}
                value={localFilters.selectedTechnologies}
                onChange={(value) => handleChange("selectedTechnologies", value)}
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "36px",
                    fontSize: "14px",
                  }),
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={localFilters.rating || ""}
                onChange={(e) => handleChange("rating", e.target.value || null)}
                className="p-2 border rounded-md w-full text-sm"
              >
                <option value="">All Ratings</option>
                {[4.5, 4.0, 3.5].map((r) => (
                  <option key={r} value={r}>
                    {r} and above
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range (using react-date-range) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <DateRangePickerInput
              dateRange={dateRange}
              handleDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={handleLocalClear}
              className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
