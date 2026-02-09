import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader } from "../utils/Loader";
import { useNavigate } from "react-router-dom";

const UserActivity = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/user/activity`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setUsers(res.data);
        setFilteredUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

 

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <GlobalHeader title="User Activity" />
        <div className="max-w-7xl mx-auto p-6">

          {/* Search and View Mode Toggle */}
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-sm"
                  />
                  <svg
                    className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === "cards"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Cards
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Table
                  </div>
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px] w-full">
              <Loader />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search criteria</p>
            </div>
          ) : viewMode === "cards" ? (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-3 group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="text-center bg-gray-50 rounded py-1.5 hover:bg-gray-100 transition-colors">
                      <p className="text-lg font-bold text-gray-900">
                        {user.appliedJobs || 0}
                      </p>
                      <p className="text-[13px]  mt-0.5 font-medium">Applied</p>
                    </div>
                    <div className="text-center bg-gray-50 rounded py-1.5 hover:bg-gray-100 transition-colors">
                          <p className="text-lg font-bold text-gray-900">
                            {user.ignoredJobs || 0}
                      </p>
                      <p className="text-[13px]  mt-0.5 font-medium">Ignored</p>
                    </div>
                    <div className="text-center bg-green-50 rounded py-1.5 hover:bg-green-100 transition-colors">
                      <p className="text-lg font-bold text-green-700">
                        {user.hiredJobs || 0}
                      </p>
                      <p className="text-[13px]  mt-0.5 font-medium">Hired</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center py-1.5 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                      <p className="text-lg font-bold text-blue-600">
                        {user.repliedJobs || 0}
                      </p>
                      <p className="text-[13px] mt-0.5 font-medium">Replied</p>
                    </div>
                    <div className="text-center py-1.5 bg-purple-50 rounded hover:bg-purple-100 transition-colors">
                      <p className="text-lg font-bold text-purple-600">
                        {user.interviewedJobs || 0}
                      </p>
                      <p className="text-[13px]  mt-0.5 font-medium">Interview</p>
                    </div>
                    <div className="text-center py-1.5 bg-red-50 rounded hover:bg-red-100 transition-colors">
                      <p className="text-lg font-bold text-red-600">
                        {user.notHiredJobs || 0}
                      </p>
                      <p className="text-[13px]  mt-0.5 font-medium">Rejected</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() =>
                      navigate(`/admin/user/${user.id}/jobs`, {
                        state: { user, token },
                      })
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                  >
                    View Details
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Replied
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Interview
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Ignored
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Hired
                      </th>
                      <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Rejected
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-150 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-sm font-bold text-gray-900">
                            {user.appliedJobs || 0}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                            {user.repliedJobs || 0}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50 text-sm font-bold text-purple-600">
                            {user.interviewedJobs || 0}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-sm font-bold text-gray-900">
                            {user.ignoredJobs || 0}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 text-sm font-bold text-green-700">
                            {user.hiredJobs || 0}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 text-sm font-bold text-red-600">
                            {user.notHiredJobs || 0}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() =>
                              navigate(`/admin/user/${user.id}/jobs`, {
                                state: { user, token },
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                          >
                            View
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserActivity;
