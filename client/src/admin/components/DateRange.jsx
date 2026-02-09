import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";

export const DateRangePickerInput = ({ dateRange, setDateRange,handleDateRangeChange  }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const start = dateRange?.[0]?.startDate
    ? format(dateRange[0].startDate, "yyyy-MM-dd")
    : ""; 
  const end = dateRange?.[0]?.endDate
    ? format(dateRange[0].endDate, "yyyy-MM-dd")
    : "";


  return (
    <div className="relative" ref={ref}>
      <input
        readOnly
        value={`${start} - ${end}`}
        onClick={() => setOpen(!open)}
        className="border px-3 py-2 rounded cursor-pointer w-64 text-sm"
      />
      {open && (
        <div className="absolute border z-50 mt-2 shadow-lg bg-white">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => {
              if (handleDateRangeChange) {
                handleDateRangeChange(item);
              } else if (setDateRange) {
                setDateRange([item.selection]);
              }
            }} 
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            months={1}
            direction="horizontal"
          />
        </div>
      )}
    </div>
  );
};
