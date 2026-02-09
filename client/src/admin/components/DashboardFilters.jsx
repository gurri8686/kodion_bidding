import Select from "react-select";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
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

const DashboardFilters = ({ onFilterChange }) => {
  const token = useSelector((state) => state.auth.token);
  const [platforms, setPlatforms] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [platform, setPlatform] = useState([]); // MULTI
  const [userProfile, setUserProfile] = useState(null);
  const [bidder, setBidder] = useState([]); // MULTI
  const [dateLabel, setDateLabel] = useState("This Week");
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

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
    const handleOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
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
            `${import.meta.env.VITE_API_BASE_URL}/api/admin/platforms`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/allusers`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/get-all-profiles`,
            {
              headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  // ===== DATE FILTER LOGIC =====
  const applyDateOption = (option) => {
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

      case "Last Year": {
        const lastYear = subYears(now, 1);
        start = startOfYear(lastYear);
        end = endOfYear(lastYear);
        break;
      }

      case "Custom Range":
        setShowPicker(true);
        return;
    }

    setDateLabel(option);
    setRange({ startDate: start, endDate: end, key: "selection" });
    setShowPicker(false); // Ensure picker is closed for predefined ranges
  };

  const handleRangeChange = (item) => {
    setRange(item.selection);
  };

  const handleApplyCustomRange = () => {
    setShowPicker(false);
    // Format the date range for display
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

  const formatDateString = (date) =>
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

  // Custom styles for single-select dropdowns to match styling
  const singleSelectStyles = {
    control: (base) => ({
      ...base,
      minHeight: "38px",
      borderColor: "#e5e7eb",
      "&:hover": {
        borderColor: "#d1d5db",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "none",
      padding: "4px 0",
    }),
    option: (base, state) => ({
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
    // Only trigger if data has loaded
    if (!platforms.length && !users.length && !profiles.length) return;

    const filterData = {
      platform: platform.length
        ? platform.map((x) => x.value).join(",")
        : null,
      userProfile,
      bidder: bidder.length ? bidder.map((x) => x.value).join(",") : null,
      startDate: formatDateString(range.startDate),
      endDate: formatDateString(range.endDate),
    };

    console.log("Filters changed:", filterData);

    if (onFilterChange) {
      onFilterChange(filterData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          onChange={(option) => applyDateOption(option.value)}
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
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
