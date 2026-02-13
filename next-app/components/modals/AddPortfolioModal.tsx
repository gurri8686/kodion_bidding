'use client';

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { X } from "lucide-react";
import Select from "react-select";
import { toast } from "react-toastify";

const AddPortfolioModal = ({ isOpen, onClose, onSuccess }: any) => {
  const [formData, setFormData] = useState({ portfolio_url: "", technologies: [] as string[] });
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTech, setFetchingTech] = useState(true);
  const [error, setError] = useState("");
  const user = useSelector((state: any) => state.auth.user);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        setFetchingTech(true);
        const response = await axios.get(`/api/jobs/all-technology-names`, {
          headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
        });
        setAvailableTechnologies(response.data.technologies || []);
      } catch (error) {
        console.error("Error fetching technologies:", error);
        setError("Failed to load technologies");
      } finally {
        setFetchingTech(false);
      }
    };
    if (isOpen) fetchTechnologies();
  }, [isOpen, token]);

  const handleChange = (e: any) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };
  const handleTechnologyChange = (selectedOptions: any) => {
    setFormData({ ...formData, technologies: selectedOptions ? selectedOptions.map((o: any) => o.value) : [] }); setError("");
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault(); setError("");
    if (!formData.portfolio_url || formData.technologies.length === 0) { setError("Please fill in all required fields"); return; }
    try {
      setLoading(true);
      await axios.post(`/api/portfolios`, { user_id: user.id, portfolio_url: formData.portfolio_url, technologies: formData.technologies }, {
        headers: { Authorization: `Bearer ${token}` }, withCredentials: true,
      });
      setFormData({ portfolio_url: "", technologies: [] });
      toast.success("Portfolio created successfully!");
      onSuccess(); onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to create portfolio.";
      setError(errorMessage); toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900">Add New Portfolio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL <span className="text-red-500">*</span></label>
            <input type="url" name="portfolio_url" value={formData.portfolio_url} onChange={handleChange} placeholder="https://example.com/my-project" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Technologies <span className="text-red-500">*</span></label>
            {fetchingTech ? (
              <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500">Loading technologies...</div>
            ) : (
              <Select isMulti options={availableTechnologies.map(tech => ({ value: tech, label: tech }))} value={formData.technologies.map(tech => ({ value: tech, label: tech }))} onChange={handleTechnologyChange} placeholder="Select technologies..." className="text-sm" classNamePrefix="select" menuPosition="fixed" />
            )}
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancel</button>
            <button type="submit" disabled={loading || fetchingTech} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50">{loading ? "Creating..." : "Create Portfolio"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPortfolioModal;
