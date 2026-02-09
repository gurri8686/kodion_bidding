import { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
// import { Loader } from "../utils/Loader";
import { X } from "lucide-react";

Modal.setAppElement("#root");

export default function MarkAsNotHiredModal({ isOpen, onClose, job, fetchAppliedJobs }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!job) return null;

  const handleNotHired = async () => {
    try {
      setLoading(true);

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/jobs/update-stage/${job.id}`,
        {
          stage: "not-hired",
           notes: notes,
          date: new Date(),
        },
        { withCredentials: true }
      );

      fetchAppliedJobs(1);
      onClose();
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white rounded-lg shadow-lg max-w-md mx-auto p-6 mt-20 outline-none w-full"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Mark as Not Hired</h2>
        <button onClick={onClose}>
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add reason or feedback..."
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-orange-300"
          ></textarea>
        </div>

        <button
          disabled={loading}
          onClick={handleNotHired}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}
