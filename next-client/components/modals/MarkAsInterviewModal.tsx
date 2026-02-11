"use client";

// src/modals/MarkAsInterviewModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const MarkAsInterviewModal = ({ isOpen, onClose, job, fetchAppliedJobs }) => {
  const token = useSelector((state) => state.auth.token);
  const [notes, setNotes] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [time, setTime] = useState("12:00");
  const [loading, setLoading] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const [hours, minutes] = time.split(":");
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);

    try {
      setLoading(true);

      await axios.put(
        `/api/jobs/update-stage/${job.id}`,
        {
          stage: "interview",
          date: dateTime.toISOString(), // interviewDate
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      toast.success("Job marked as Interview!");
      fetchAppliedJobs();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark as interview");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4">Mark as Interview</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="relative" ref={pickerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Date & Time
            </label>

            <div
              className="flex items-center border rounded-lg px-3 py-2 cursor-pointer hover:border-orange-400 transition"
              onClick={() => setIsPickerOpen((prev) => !prev)}
            >
              <Calendar className="text-gray-500 mr-2" size={16} />
              <span className="text-gray-700 text-sm">
                {format(selectedDate, "dd MMM yyyy")} at {time}
              </span>
            </div>

            {isPickerOpen && (
              <div className="absolute mt-2 right-0 bg-white rounded-lg shadow-lg border z-50 w-[280px]">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) =>
                    setSelectedDate(item.selection.startDate)
                  }
                  moveRangeOnFirstSelection={false}
                  ranges={[
                    {
                      startDate: selectedDate,
                      endDate: selectedDate,
                      key: "selection",
                    },
                  ]}
                  showDateDisplay={false}
                  showMonthAndYearPickers={false}
                  rangeColors={["#f97316"]}
                  direction="vertical"
                />
              </div>
            )}

            {/* Time Input */}
            <div className="mt-2">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add interview notes..."
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring focus:ring-orange-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarkAsInterviewModal;
