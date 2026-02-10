"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Briefcase,
  Search,
  ExternalLink,
  Grid3x3,
  Table as TableIcon,
  Filter,
  X
} from "lucide-react";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Portfolio {
  id: number;
  user_id: number;
  portfolio_url: string;
  technologies: string[];
  created_at: string;
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  };
}

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

const AllPortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTechnologies, setSelectedTechnologies] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch all portfolios
  const fetchAllPortfolios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/api/portfolios/all`, {
        withCredentials: true,
      });
      setPortfolios(response.data.data);
      setFilteredPortfolios(response.data.data);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for filter
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/api/admin/allusers`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      const response = await axios.get(`${API}/api/jobs/all-technology-names`, {
        withCredentials: true,
      });
      setAvailableTechnologies(response.data.technologies || []);
    } catch (error) {
      console.error("Error fetching technologies:", error);
    }
  };

  useEffect(() => {
    fetchAllPortfolios();
    fetchUsers();
    fetchTechnologies();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...portfolios];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (portfolio) =>
          portfolio.user?.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          portfolio.user?.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          portfolio.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          portfolio.portfolio_url?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // User filter
    if (selectedUser) {
      filtered = filtered.filter((portfolio) => portfolio.user_id === selectedUser.value);
    }

    // Technology filter
    if (selectedTechnologies.length > 0) {
      filtered = filtered.filter((portfolio) =>
        selectedTechnologies.some((tech) =>
          portfolio.technologies.includes(tech.value)
        )
      );
    }

    setFilteredPortfolios(filtered);
  }, [searchTerm, selectedUser, selectedTechnologies, portfolios]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setSelectedTechnologies([]);
  };

  const userOptions = users.map((user) => ({
    value: user.id,
    label: `${user.firstname} ${user.lastname} (${user.email})`,
  }));

  const technologyOptions = availableTechnologies.map((tech) => ({
    value: tech,
    label: tech,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <main className="p-8">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Portfolio Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all user portfolios
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "card"
                    ? "bg-[#f76a00] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Card View"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-[#f76a00] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                title="Table View"
              >
                <TableIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {(searchTerm || selectedUser || selectedTechnologies.length > 0) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-[#f76a00] hover:text-[#db6613] flex items-center gap-1"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or URL..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f76a00] focus:border-[#f76a00] outline-none transition"
                />
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by User
              </label>
              <Select
                value={selectedUser}
                onChange={setSelectedUser}
                options={userOptions}
                isClearable
                placeholder="All Users"
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                  }),
                }}
              />
            </div>

            {/* Technology Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Technology
              </label>
              <Select
                isMulti
                value={selectedTechnologies}
                onChange={setSelectedTechnologies}
                options={technologyOptions}
                placeholder="All Technologies"
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "42px",
                    borderColor: "#d1d5db",
                  }),
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredPortfolios.length}</span> of{" "}
            <span className="font-semibold">{portfolios.length}</span> portfolios
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f76a00]"></div>
          </div>
        ) : filteredPortfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <Briefcase size={48} className="text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Portfolios Found</h2>
            <p className="text-gray-500 mt-2 text-sm">
              {searchTerm || selectedUser || selectedTechnologies.length > 0
                ? "Try adjusting your filters"
                : "No portfolios have been created yet"}
            </p>
          </div>
        ) : viewMode === "card" ? (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-5">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#f76a00] flex items-center justify-center text-white font-semibold">
                      {portfolio.user?.firstname?.charAt(0)}
                      {portfolio.user?.lastname?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {portfolio.user?.firstname} {portfolio.user?.lastname}
                      </p>
                      <p className="text-xs text-gray-500">{portfolio.user?.email}</p>
                    </div>
                  </div>

                  {/* Portfolio URL */}
                  <a
                    href={portfolio.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-4 group"
                  >
                    <div className="text-sm font-bold text-[#f76a00] group-hover:text-[#db6613] group-hover:underline break-all flex items-center gap-2">
                      {portfolio.portfolio_url}
                      <ExternalLink size={14} className="flex-shrink-0" />
                    </div>
                  </a>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {portfolio.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-[#f76a00]/10 text-[#f76a00] rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-gray-500">
                    Added: {new Date(portfolio.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Portfolio URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Technologies
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPortfolios.map((portfolio) => (
                    <tr key={portfolio.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f76a00] flex items-center justify-center text-white font-semibold text-sm">
                            {portfolio.user?.firstname?.charAt(0)}
                            {portfolio.user?.lastname?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {portfolio.user?.firstname} {portfolio.user?.lastname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {portfolio.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={portfolio.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#f76a00] hover:text-[#db6613] hover:underline flex items-center gap-2 max-w-xs truncate"
                        >
                          {portfolio.portfolio_url}
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {portfolio.technologies.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-[#f76a00]/10 text-[#f76a00] rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                          {portfolio.technologies.length > 3 && (
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              +{portfolio.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(portfolio.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AllPortfolios;
