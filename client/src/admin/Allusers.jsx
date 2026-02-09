import { useState } from "react";
import { Search, Eye, UserCheck, UserX, Shield } from "lucide-react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Loader } from "../../src/utils/Loader";
import ViewUser from "./modals/ViewUser";
import ConfirmUserBlock from "./modals/ConfirmUserBlock";

const AllUsers = () => {  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null);
  const token = useSelector((state) => state.auth.token);


  // Fetch all users with optional search term
  const fetchUsers = async (searchTerm = "") => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/allusers`,
        {
          params: { search: searchTerm },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setUsers(response.data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };


  // Fetch users on component mount and when token changes
  useEffect(() => {
    fetchUsers();
  }, [token])

  // Handle status toggle for user
  const handleStatusToggle = (user) => {
    setSelectedUser(user);
    setPendingAction(user.status === 'Active' || user.status === 'active' ? 'suspend' : 'activate');
    setConfirmModalOpen(true);
  };

  // Confirm status change action
  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    setIsStatusUpdating(true); // disable button

    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/user/${selectedUser.id}/status`,
        {
          status: pendingAction === 'suspend' ? 'blocked' : 'active'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      toast.success(
        `User has been successfully ${pendingAction === 'suspend' ? 'blocked' : 'activated'}`
      );
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? { ...user, status: pendingAction === 'suspend' ? 'blocked' : 'active' }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error("Failed to update user status");
    } finally {
      setIsStatusUpdating(false); // enable button
      setConfirmModalOpen(false);
      setSelectedUser(null);
      setPendingAction(null);
    }
  };


  // Handle view user details 
  const handleView = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <GlobalHeader title="All Users" />
        <div className="p-8">
          <div className="mb-8">
            <p className="text-gray-600">Manage and monitor all users in your system</p>
          </div>
          <ToastContainer position="top-center" autoClose={3000} />

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                fetchUsers(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
        </div>
        {loading ? <Loader /> : (users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-600 border border-gray-100">
            <p className="text-lg font-medium">No users found</p>
            <p className="text-sm mt-2">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.firstname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${user.role === 'Admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(user)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded hover:bg-blue-100 border border-blue-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border ${user.status === 'active'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200'
                            }`}
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        )}
        {/* View Modal */}
        {viewModalOpen && selectedUser && (
          <ViewUser viewModalOpen={viewModalOpen} selectedUser={selectedUser} setViewModalOpen={setViewModalOpen} />
        )}
        {confirmModalOpen && selectedUser && (
          <ConfirmUserBlock setConfirmModalOpen={setConfirmModalOpen} confirmStatusChange={confirmStatusChange} isStatusUpdating={isStatusUpdating} pendingAction={pendingAction} selectedUser={selectedUser} />
        )}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;