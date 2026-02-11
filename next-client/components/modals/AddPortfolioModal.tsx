"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { X } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";

const AddPortfolioModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    portfolio_url: "",
    technologies: [],
  });
  const [availableTechnologies, setAvailableTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTech, setFetchingTech] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const API = "";

  // Fetch available technologies
  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        setFetchingTech(true);
        const response = await axios.get(`${API}/api/jobs/technologies/names`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setAvailableTechnologies(response.data.technologies || []);
      } catch (error) {
        console.error("Error fetching technologies:", error);
        setError("Failed to load technologies");
      } finally {
        setFetchingTech(false);
      }
    };

    if (isOpen) {
      fetchTechnologies();
    }
  }, [isOpen, API, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleTechnologyChange = (selectedOptions) => {
    const technologies = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({
      ...formData,
      technologies: technologies,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.portfolio_url || formData.technologies.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API}/api/portfolios`,
        {
          user_id: user.id,
          portfolio_url: formData.portfolio_url,
          technologies: formData.technologies,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Reset form
      setFormData({
        portfolio_url: "",
        technologies: [],
      });

      toast.success("Portfolio created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating portfolio:", error);
      const errorMessage = error.response?.data?.message || "Failed to create portfolio. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Add New Portfolio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Portfolio URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Portfolio URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url}
              onChange={handleChange}
              placeholder="https://example.com/my-project"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL of your portfolio or project
            </p>
          </div>

          {/* Technologies - Multi-Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Technologies <span className="text-red-500">*</span>
            </label>
            {fetchingTech ? (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500">
                Loading technologies...
              </div>
            ) : (
              <Select
                isMulti
                options={availableTechnologies.map(tech => ({ value: tech, label: tech }))}
                value={formData.technologies.map(tech => ({ value: tech, label: tech }))}
                onChange={handleTechnologyChange}
                placeholder="Select technologies..."
                className="text-sm"
                classNamePrefix="select"
                menuPosition="fixed"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#9ca3af'
                    }
                  }),
                  menu: (base) => ({
                    ...base,
                    maxHeight: '280px',
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: '280px',
                  }),
                  option: (base) => ({
                    ...base,
                    padding: '10px 12px',
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#dbeafe',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#1e40af',
                    fontWeight: '500'
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#1e40af',
                    '&:hover': {
                      backgroundColor: '#bfdbfe',
                      color: '#1e3a8a'
                    }
                  })
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || fetchingTech}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPortfolioModal;
