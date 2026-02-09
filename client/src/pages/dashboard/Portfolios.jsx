import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import ReactPaginate from "react-paginate";
import Sidebar from "../../components/Sidebar";
import GlobalHeader from "../../components/GlobalHeader";
import { Loader } from "../../utils/Loader";
import { Briefcase, Plus, ExternalLink, Edit2, Trash2 } from "lucide-react";
import AddPortfolioModal from "../../modals/AddPortfolioModal";
import EditPortfolioModal from "../../modals/EditPortfolioModal";
import ConfirmModal from "../../modals/ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Portfolios = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const portfoliosPerPage = 6;
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const userId = user?.id;
  const API = import.meta.env.VITE_API_BASE_URL;

  const fetchPortfolios = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/api/portfolios/user/${userId}`,
        {
          params: {
            page,
            limit: portfoliosPerPage,
          },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setPortfolios(response.data.data);
      setTotalCount(response.data.totalCount || response.data.data.length);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage ? response.data.currentPage - 1 : 0);
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPortfolios(1);
    }
  }, [userId]);

  const handlePageChange = ({ selected }) => {
    fetchPortfolios(selected + 1);
  };

  const handleDeleteClick = (portfolio) => {
    setPortfolioToDelete(portfolio);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API}/api/portfolios/${portfolioToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      toast.success("Portfolio deleted successfully!");
      fetchPortfolios(currentPage + 1);
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      toast.error("Failed to delete portfolio");
    } finally {
      setShowDeleteModal(false);
      setPortfolioToDelete(null);
    }
  };

  const handleEdit = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="My Portfolios" />
        <main className="p-8">
          {/* Header Section */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Portfolio Showcase</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your professional portfolio entries</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md font-medium text-sm flex items-center gap-2"
            >
              <Plus size={18} />
              Add Portfolio
            </button>
          </div>

          {/* Stats */}
          <div className="flex lg:items-center lg:flex-row flex-col justify-between mb-6 text-left">
            <p className="text-gray-700 font-medium">
              Displaying <span className="font-bold">{portfolios.length}</span> portfolio{portfolios.length !== 1 ? 's' : ''} on this page — <span className="font-bold">{totalCount}</span> portfolio{totalCount !== 1 ? 's' : ''} found in total
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <Loader />
          ) : portfolios.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full mt-10 text-center p-10 bg-white rounded-xl shadow-sm border border-gray-200">
              <Briefcase size={48} className="text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-700">
                No Portfolios Yet
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Start building your professional portfolio by adding your first entry
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                Add Your First Portfolio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Content */}
                  <div className="p-5">
                    {/* Portfolio URL as clickable title */}
                    <a
                      href={portfolio.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mb-4 group"
                    >
                      <div className="text-lg font-bold text-blue-600 group-hover:text-blue-800 group-hover:underline break-all flex items-center gap-2">
                        {portfolio.portfolio_url}
                        <ExternalLink size={16} className="flex-shrink-0" />
                      </div>
                    </a>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {portfolio.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-gray-500 mb-4">
                      Added: {new Date(portfolio.created_at).toLocaleDateString()}
                    </div>

                    {/* Actions - Edit and Delete only */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(portfolio)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(portfolio)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {portfolios.length > 0 && !loading && totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <ReactPaginate
                previousLabel={"←"}
                nextLabel={"→"}
                pageCount={totalPages}
                onPageChange={handlePageChange}
                forcePage={currentPage}
                containerClassName="flex flex-wrap justify-center gap-2 text-sm sm:space-x-2 sm:gap-0"
                pageClassName="border rounded-lg bg-gray-200 hover:bg-blue-500 hover:text-white text-xs sm:text-sm"
                pageLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block text-center"
                previousClassName="border rounded-lg bg-gray-300 hover:bg-gray-400 text-xs sm:text-sm"
                previousLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block"
                nextClassName="border rounded-lg bg-gray-300 hover:bg-gray-400 text-xs sm:text-sm"
                nextLinkClassName="lg:px-3 lg:py-1 px-4 py-2 block"
                activeClassName="bg-blue-600 border-blue-600 text-white"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <ToastContainer position="top-right" autoClose={2000} />
      <AddPortfolioModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchPortfolios}
      />
      <EditPortfolioModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPortfolio(null);
        }}
        portfolio={selectedPortfolio}
        onSuccess={fetchPortfolios}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Portfolio"
        message="Are you sure you want to delete this portfolio? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setPortfolioToDelete(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Portfolios;
