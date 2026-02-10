'use client';

import { useState, useRef, useEffect } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface UnifiedDateTimePickerProps {
  selectedDate: Date | null;
  setSelectedDate: (date: Date) => void;
  position?: "above" | "below";
  withTime?: boolean;
}

interface TimeValue {
  hours: string;
  minutes: string;
  period: "AM" | "PM";
}

/**
 * UnifiedDateTimePicker - A reusable date and time picker component
 * Uses react-date-range for consistent date selection throughout the project
 *
 * @param selectedDate - Currently selected date
 * @param setSelectedDate - Callback to update selected date
 * @param position - Dropdown position: "above" or "below" (default: "below")
 * @param withTime - Enable time selection (default: false)
 */
export const UnifiedDateTimePicker = ({
  selectedDate,
  setSelectedDate,
  position = "below",
  withTime = false,
}: UnifiedDateTimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());
  const [timeValue, setTimeValue] = useState<TimeValue>({
    hours: selectedDate ? format(selectedDate, "hh") : "12",
    minutes: selectedDate ? format(selectedDate, "mm") : "00",
    period: (selectedDate ? format(selectedDate, "a") : "AM") as "AM" | "PM",
  });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // Update time when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setTempDate(selectedDate);
      setTimeValue({
        hours: format(selectedDate, "hh"),
        minutes: format(selectedDate, "mm"),
        period: format(selectedDate, "a") as "AM" | "PM",
      });
    }
  }, [selectedDate]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 400; // Approximate height of dropdown

      let top: number, left: number;

      if (position === "above") {
        top = rect.top - dropdownHeight - 8;
      } else {
        // Check if there's enough space below
        const spaceBelow = viewportHeight - rect.bottom;
        if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
          // Not enough space below but enough above, position above
          top = rect.top - dropdownHeight - 8;
        } else {
          // Position below
          top = rect.bottom + 8;
        }
      }

      // Ensure dropdown doesn't go off-screen vertically
      if (top < 10) top = 10;
      if (top + dropdownHeight > viewportHeight - 10) {
        top = viewportHeight - dropdownHeight - 10;
      }

      // Position horizontally
      left = withTime ? rect.right - 320 : rect.left;

      // Ensure dropdown doesn't go off-screen horizontally
      const dropdownWidth = withTime ? 320 : 280;
      if (left + dropdownWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropdownWidth - 10;
      }
      if (left < 10) left = 10;

      setDropdownPosition({ top, left });
    }
  }, [open, position, withTime]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (ranges: RangeKeyDict) => {
    const selectedDateFromRange = ranges.selection.startDate as Date;
    setTempDate(selectedDateFromRange);

    if (!withTime) {
      // If no time needed, apply immediately
      setSelectedDate(selectedDateFromRange);
      setOpen(false);
    }
  };

  const handleTimeChange = (field: keyof TimeValue, value: string) => {
    setTimeValue((prev) => ({ ...prev, [field]: value }));
  };

  const applyDateTime = () => {
    if (withTime) {
      // Combine date and time
      const hours24 =
        timeValue.period === "PM" && timeValue.hours !== "12"
          ? parseInt(timeValue.hours) + 12
          : timeValue.period === "AM" && timeValue.hours === "12"
          ? 0
          : parseInt(timeValue.hours);

      const combinedDate = new Date(tempDate);
      combinedDate.setHours(hours24, parseInt(timeValue.minutes), 0, 0);
      setSelectedDate(combinedDate);
    } else {
      setSelectedDate(tempDate);
    }
    setOpen(false);
  };

  // Generate hours (01-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return (
    <div className="relative w-full" ref={ref}>
      <div
        ref={inputRef}
        onClick={() => setOpen(!open)}
        className="border border-gray-300 px-3 py-2 rounded cursor-pointer w-full bg-white hover:border-blue-400 transition-colors flex items-center justify-between"
      >
        <span className="text-gray-700">
          {selectedDate
            ? format(
                selectedDate,
                withTime ? "MMM dd, yyyy hh:mm aa" : "MMM dd, yyyy"
              )
            : "Select date" + (withTime ? " & time" : "")}
        </span>
        {withTime && <Clock className="w-4 h-4 text-gray-400" />}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          className="z-50 shadow-xl bg-white border border-gray-200 rounded-lg"
        >
          <DateRange
            ranges={[
              {
                startDate: tempDate,
                endDate: tempDate,
                key: "selection",
              },
            ]}
            onChange={handleDateChange}
            moveRangeOnFirstSelection={false}
            months={1}
            direction="horizontal"
            showDateDisplay={false}
          />

          {withTime && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Select Time
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Hours */}
                <select
                  value={timeValue.hours}
                  onChange={(e) => handleTimeChange("hours", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-gray-500 font-medium">:</span>
                {/* Minutes */}
                <select
                  value={timeValue.minutes}
                  onChange={(e) => handleTimeChange("minutes", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {/* AM/PM */}
                <select
                  value={timeValue.period}
                  onChange={(e) => handleTimeChange("period", e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          )}

          {/* Apply Button */}
          <div className="p-3 border-t border-gray-200 flex justify-end">
            <button
              onClick={applyDateTime}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
