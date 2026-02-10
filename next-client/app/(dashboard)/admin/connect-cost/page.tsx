"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Platform {
  id: number;
  name: string;
  connect_cost_usd: number | null;
  connect_cost_inr: number | null;
  updatedAt?: string;
}

const ConnectsCost = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformId, setPlatformId] = useState("");
  const [platformName, setPlatformName] = useState("");
  const [costUSD, setCostUSD] = useState("");
  const [costINR, setCostINR] = useState("");
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch platforms
  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/platforms`,
        {
          credentials: "include",
        }
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
  const openEditModal = (p: Platform) => {
    setEditing(true);
    setPlatformId(String(p.id));
    setPlatformName(p.name);
    setCostUSD(String(p.connect_cost_usd || ""));
    setCostINR(String(p.connect_cost_inr || ""));
    setModalOpen(true);
  };

  // ---- FORM SUBMIT ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (!editing) {
        // CREATE NEW PLATFORM + COST
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create-platform`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/save-connect-cost`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
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
    <div className="flex-1 overflow-auto">
      <ToastContainer position="top-right" autoClose={1200} />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Connects Cost</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f76a00]"></div>
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
                          className="px-3 py-1 bg-[#f76a00] text-white rounded hover:bg-[#db6613]"
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
            {modalOpen && (
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).id === "modalOverlay") setModalOpen(false);
                }}
                id="modalOverlay"
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
              >
                <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
                  <h2 className="text-xl font-semibold mb-4">
                    {editing ? "Update Connect Cost" : "Add New Platform & Cost"}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Platform Name - only in ADD mode */}
                    {!editing && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={platformName}
                          onChange={(e) => setPlatformName(e.target.value)}
                          placeholder="Enter Platform Name (e.g., Upwork)"
                          className="w-full border rounded-lg p-2 focus:ring focus:ring-[#f76a00]/30"
                          required
                        />
                      </div>
                    )}

                    {/* Cost USD */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cost per Connect (USD $)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costUSD}
                        onChange={(e) => setCostUSD(e.target.value)}
                        className="w-full border rounded-lg p-2 focus:ring focus:ring-[#f76a00]/30"
                        required
                      />
                    </div>

                    {/* Cost INR */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Cost per Connect (INR ₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costINR}
                        onChange={(e) => setCostINR(e.target.value)}
                        className="w-full border rounded-lg p-2 focus:ring focus:ring-[#f76a00]/30"
                        required
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-[#f76a00] text-white py-2 rounded-lg hover:bg-[#db6613] transition"
                      >
                        {editing ? "Update" : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectsCost;
