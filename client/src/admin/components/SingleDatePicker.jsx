import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export const SingleDatePicker = ({
  selectedDate,
  setSelectedDate,
  position = "below",
  withTime = false, // 👈 flag to toggle time selection
}) => {
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

  const dropdownPositionClass =
    position === "above" ? "bottom-full mb-2" : "top-full mt-2";

  return (
    <div className="relative" ref={ref}>
      <input
        readOnly
        value={
          selectedDate
            ? format(selectedDate, withTime ? "yyyy-MM-dd hh:mm aa" : "yyyy-MM-dd")
            : ""
        }
        onClick={() => setOpen(!open)}
        className="border px-3 py-2 rounded cursor-pointer w-56"
      />
      {open && (
        <div
          className={`absolute z-50 shadow-lg bg-white ${dropdownPositionClass}`}
        >
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setOpen(false);
            }}
            inline
            {...(withTime
              ? {
                  showTimeSelect: true,
                  timeFormat: "hh:mm aa",
                  timeIntervals: 1,
                  dateFormat: "yyyy-MM-dd hh:mm aa",
                }
              : {
                  dateFormat: "yyyy-MM-dd",
                })}
          />
        </div>
      )}
    </div>
  );
};
