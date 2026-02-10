'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader } from '@/components/admin/Loader';
import { toast } from 'react-toastify';
import ConnectCostModal from '@/components/admin/modals/ConnectCostModal';

interface Platform {
  id: number;
  name: string;
  connect_cost_usd: number | null;
  connect_cost_inr: number | null;
  updatedAt: string;
}

export default function ConnectsCost() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformId, setPlatformId] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [costUSD, setCostUSD] = useState('');
  const [costINR, setCostINR] = useState('');
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = useAppSelector((state) => state.auth.token);

  const fetchPlatforms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/platforms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPlatforms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchPlatforms();
  }, [token]);

  const openAddModal = () => {
    setEditing(false);
    setPlatformId('');
    setPlatformName('');
    setCostUSD('');
    setCostINR('');
    setModalOpen(true);
  };

  const openEditModal = (p: Platform) => {
    setEditing(true);
    setPlatformId(String(p.id));
    setPlatformName(p.name);
    setCostUSD(p.connect_cost_usd ? String(p.connect_cost_usd) : '');
    setCostINR(p.connect_cost_inr ? String(p.connect_cost_inr) : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;

      if (!editing) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create-platform`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            platformName,
            connect_cost_usd: Number(costUSD),
            connect_cost_inr: Number(costINR),
          }),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/save-connect-cost`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            platformId,
            connect_cost_usd: Number(costUSD),
            connect_cost_inr: Number(costINR),
          }),
        });
      }

      if (response.ok) {
        toast.success(editing ? 'Updated successfully' : 'Platform added!');
        await fetchPlatforms();
      } else {
        toast.error('Something went wrong!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving configuration');
    }

    setLoading(false);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">Connects Cost</h1>
        </div>

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
                        <td className="p-3 text-center">{p.connect_cost_usd ?? '-'}</td>
                        <td className="p-3 text-center">{p.connect_cost_inr ?? '-'}</td>
                        <td className="p-3 text-center">{p.updatedAt?.split('T')[0] || '-'}</td>
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

              <ConnectCostModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                editing={editing}
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
}
