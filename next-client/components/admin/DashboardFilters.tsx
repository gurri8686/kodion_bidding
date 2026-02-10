"use client";

import Select from "react-select";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DateRange } from "react-date-range";
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
} from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface FilterData {
  platform: string | null;
  userProfile: number | null;
  bidder: string | null;
  startDate: string;
  endDate: string;
}

interface DashboardFiltersProps {
  onFilterChange: (filters: FilterData) => void;
}

const DashboardFilters = ({ onFilterChange }: DashboardFiltersProps) => {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [platform, setPlatform] = useState<any[]>([]); // MULTI
  const [userProfile, setUserProfile] = useState<number | null>(null);
  const [bidder, setBidder] = useState<any[]>([]); // MULTI
  const [dateLabel, setDateLabel] = useState("This Week");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [range, setRange] = useState({
    startDate: startOfWeek(new Date()),
    endDate: endOfWeek(new Date()),
    key: "selection",
  });

  const dateOptions = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "Last Year",
    "Custom Range",
  ];

  // Close custom range picker on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleOutside);
    }

    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showPicker]);

  // --- Fetch Platforms, Users, Profiles ---
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [platformRes, userRes, profileRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/platforms`,
            {
              withCredentials: true,
            }
          ),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/allusers`, {
            withCredentials: true,
          }),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-all-profiles`,
            {
              withCredentials: true,
            }
          ),
        ]);

        setPlatforms(platformRes.data || []);
        setUsers(userRes.data || []);
        setProfiles(profileRes.data || []);
      } catch (err) {
        console.error("Error fetching filters:", err);
      }
    };

    fetchFilters();
  }, []);

  // ===== DATE FILTER LOGIC =====
  const applyDateOption = (option: string) => {
    const now = new Date();
    let start: Date, end: Date;

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

      case "Last Year": {
        const lastYear = subYears(now, 1);
        start = startOfYear(lastYear);
        end = endOfYear(lastYear);
        break;
      }

      case "Custom Range":
        setShowPicker(true);
        return;

      default:
        start = startOfWeek(now);
        end = endOfWeek(now);
    }

    setDateLabel(option);
    setRange({ startDate: start, endDate: end, key: "selection" });
    setShowPicker(false);
  };

  const handleRangeChange = (item: any) => {
    setRange(item.selection);
  };

  const handleApplyCustomRange = () => {
    setShowPicker(false);
    const startStr = range.startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const endStr = range.endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    setDateLabel(`${startStr} - ${endStr}`);
  };

  const formatDateString = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;

  // react-select options
  const platformOptions = platforms.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const bidderOptions = users.map((u) => ({
    value: u.id,
    label: u.firstname,
  }));

  const dateSelectOptions = dateOptions.map((d) => ({
    value: d,
    label: d,
  }));

  const profileOptions = [
    { value: null, label: "All Profiles" },
    ...profiles.map((p) => ({
      value: p.id,
      label: p.name,
    })),
  ];

  // Custom styles for single-select dropdowns
  const singleSelectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "38px",
      borderColor: "#e5e7eb",
      "&:hover": {
        borderColor: "#d1d5db",
      },
    }),
    menu: (base: any) => ({
      ...base,
      zIndex: 50,
    }),
    menuList: (base: any) => ({
      ...base,
      maxHeight: "none",
      padding: "4px 0",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#2684ff"
        : state.isFocused
        ? "#deebff"
        : "white",
      color: state.isSelected ? "white" : "#333",
      padding: "8px 12px",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#b3d4ff",
      },
    }),
  };

  // CALL API on every filter change
  useEffect(() => {
    if (!platforms.length && !users.length && !profiles.length) return;

    const filterData: FilterData = {
      platform: platform.length
        ? platform.map((x) => x.value).join(",")
        : null,
      userProfile,
      bidder: bidder.length ? bidder.map((x) => x.value).join(",") : null,
      startDate: formatDateString(range.startDate),
      endDate: formatDateString(range.endDate),
    };

    if (onFilterChange) {
      onFilterChange(filterData);
    }
  }, [platform, userProfile, bidder, range.startDate, range.endDate]);

  return (
    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl shadow-md border border-gray-100 items-center m-5">
      {/* Platform */}
      <div className="flex flex-col min-w-[250px]">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Platform
        </label>
        <Select
          isMulti
          options={platformOptions}
          value={platform}
          onChange={(val) => setPlatform(val || [])}
          classNamePrefix="select"
          placeholder="Select Platforms..."
        />
      </div>

      {/* Date Filter */}
      <div className="flex flex-col relative min-w-[180px]" ref={pickerRef}>
        <label className="text-sm font-semibold text-gray-600 mb-1">Date</label>

        <Select
          options={dateSelectOptions}
          value={{ value: dateLabel, label: dateLabel }}
          onChange={(option) => applyDateOption(option?.value || "")}
          classNamePrefix="select"
          placeholder="Select Date..."
          isSearchable={false}
          styles={singleSelectStyles}
        />

        {showPicker && (
          <div className="absolute z-50 top-[70px] bg-white shadow-xl border rounded-xl p-3">
            <DateRange
              editableDateInputs
              ranges={[range]}
              onChange={handleRangeChange}
              maxDate={new Date()}
            />
            <div className="flex justify-end gap-2 mt-2 border-t pt-2">
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyCustomRange}
                className="px-4 py-2 text-sm bg-[#f76a00] text-white rounded-md hover:bg-[#db6613]"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="flex flex-col min-w-[180px]">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          User Profile
        </label>

        <Select
          options={profileOptions}
          value={profileOptions.find((opt) => opt.value === userProfile) || profileOptions[0]}
          onChange={(option) => setUserProfile(option?.value || null)}
          classNamePrefix="select"
          placeholder="Select Profile..."
          isSearchable={false}
          styles={singleSelectStyles}
        />
      </div>

      {/* Bidder */}
      <div className="flex flex-col min-w-[250px]">
        <label className="text-sm font-semibold text-gray-600 mb-1">
          Bidder
        </label>
        <Select
          isMulti
          options={bidderOptions}
          value={bidder}
          onChange={(val) => setBidder(val || [])}
          classNamePrefix="select"
          placeholder="Select Bidders..."
        />
      </div>
    </div>
  );
};

export default DashboardFilters;
