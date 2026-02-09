import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import GlobalHeader from "../components/GlobalHeader";
import ConnectCostModal from "../admin/modals/ConnectCostModal";
import { useSelector } from "react-redux";
import { Loader } from "../utils/Loader";
import { ToastContainer, toast } from "react-toastify";

const ConnectsCost = () => {
  const [platforms, setPlatforms] = useState([]);
  const [platformId, setPlatformId] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [costUSD, setCostUSD] = useState("");
  const [costINR, setCostINR] = useState("");
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = useSelector((state) => state.auth.token);

  // Fetch platforms
  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/platforms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setPlatforms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  // ---- OPEN ADD MODAL ----
  const openAddModal = () => {
    setEditing(false);
    setPlatformId("");
    setPlatformName("");
    setCostUSD("");
    setCostINR("");
    setModalOpen(true);
  };

  // ---- OPEN EDIT MODAL ----
  const openEditModal = (p) => {
    setEditing(true);
    setPlatformId(p.id);
    setPlatformName(p.name);
    setCostUSD(p.connect_cost_usd || "");
    setCostINR(p.connect_cost_inr || "");
    setModalOpen(true);
  };

  // ---- FORM SUBMIT ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (!editing) {
        // CREATE NEW PLATFORM + COST
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/create-platform`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              platformName,
              connect_cost_usd: Number(costUSD),
              connect_cost_inr: Number(costINR),
            }),
          }
        );
      } else {
        // UPDATE COST ONLY
        response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/save-connect-cost`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              platformId,
              connect_cost_usd: Number(costUSD),
              connect_cost_inr: Number(costINR),
            }),
          }
        );
      }

      if (response.ok) {
        toast.success(editing ? "Updated successfully" : "Platform added!");
        await fetchPlatforms();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving configuration");
    }

    setLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <ToastContainer position="top-right" autoClose={1200} />

      <div className="flex-1 overflow-auto">
        <GlobalHeader title="Connects Cost" />
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={openAddModal}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  + Add Platform
                </button>
              </div>

            {/* TABLE */}
            <div className="bg-white p-5 rounded-xl shadow-md border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left">Platform</th>
                    <th className="p-3 text-center">USD ($)</th>
                    <th className="p-3 text-center">INR (₹)</th>
                    <th className="p-3 text-center">Updated</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3">{p.name}</td>
                      <td className="p-3 text-center">{p.connect_cost_usd ?? "-"}</td>
                      <td className="p-3 text-center">{p.connect_cost_inr ?? "-"}</td>
                      <td className="p-3 text-center">
                        {p.updatedAt?.split("T")[0] || "-"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openEditModal(p)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MODAL */}
            <ConnectCostModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSubmit={handleSubmit}
              editing={editing}
              platformId={platformId}
              setPlatformId={setPlatformId}
              platformName={platformName}
              setPlatformName={setPlatformName}
              costUSD={costUSD}
              setCostUSD={setCostUSD}
              costINR={costINR}
              setCostINR={setCostINR}
            />
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default ConnectsCost;
