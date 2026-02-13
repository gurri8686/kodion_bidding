'use client';

import { useState, useEffect } from 'react';
import { Calendar, Target, X, Plus, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader } from '@/components/admin/Loader';
import { toast } from 'react-toastify';

export default function ProgressTracker() {
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.userId);

  const generateLastWeeks = () => {
    const weeks: Array<{ id: number; label: string; start: Date; end: Date }> = [];
    let current = new Date();

    for (let i = 0; i < 8; i++) {
      const start = new Date(current);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const label = `${start.toDateString().slice(4, 10)} – ${end.toDateString().slice(4, 10)}`;

      weeks.push({
        id: i,
        label,
        start,
        end,
      });

      current.setDate(current.getDate() - 7);
    }
    return weeks;
  };

  const weekOptions = generateLastWeeks();

  const [selectedWeek, setSelectedWeek] = useState(weekOptions[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const [targetAmount, setTargetAmount] = useState('');
  const [achievedAmount, setAchievedAmount] = useState(0);
  const [hasTarget, setHasTarget] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formAmount, setFormAmount] = useState('');
  const [formAchievedAmount, setFormAchievedAmount] = useState('');

  const fetchTarget = async () => {
    setLoading(true);
    try {
      const week_start = selectedWeek.start.toISOString().slice(0, 10);
      const week_end = selectedWeek.end.toISOString().slice(0, 10);

      const res = await axios.get(`/api/get-target`, {
        params: { userId, week_start, week_end },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.data && res.data.data) {
        const record = res.data.data;
        setTargetAmount(record.target_amount);
        setAchievedAmount(record.achieved_amount);
        setHasTarget(true);
      } else {
        setTargetAmount('');
        setAchievedAmount(0);
        setHasTarget(false);
      }
    } catch (err) {
      console.log('Error fetching target:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) fetchTarget();
  }, [selectedWeek, userId, token]);

  const handleOpenModal = (mode: 'create' | 'edit') => {
    setModalMode(mode);
    setFormAmount(mode === 'edit' ? targetAmount : '');
    setFormAchievedAmount(mode === 'edit' ? String(achievedAmount) : '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      userId,
      week_start: selectedWeek.start.toISOString().slice(0, 10),
      week_end: selectedWeek.end.toISOString().slice(0, 10),
      target_amount: Number(formAmount),
      achieved_amount: Number(formAchievedAmount),
    };

    try {
      await axios.post(`/api/set-target`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      fetchTarget();
      handleCloseModal();
      toast.success(`Target ${modalMode === 'create' ? 'created' : 'updated'} successfully!`);
    } catch (error) {
      console.error('Failed to set target:', error);
      toast.error('Error saving target');
    }
  };

  const progress = targetAmount ? Math.round(Math.min((achievedAmount / Number(targetAmount)) * 100, 100)) : 0;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 overflow-auto">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">Progress Tracker</h1>
        </div>

        <div className="p-4 md:p-10">
          {loading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold">Weekly Target</h2>
                  <p className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                    <Calendar size={16} /> {selectedWeek.label}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedWeek.id}
                    onChange={(e) => setSelectedWeek(weekOptions.find((w) => w.id == Number(e.target.value))!)}
                    className="border p-2 rounded-lg bg-white w-full sm:w-auto"
                  >
                    {weekOptions.map((week) => (
                      <option key={week.id} value={week.id}>
                        {week.label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleOpenModal(hasTarget ? 'edit' : 'create')}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg w-full sm:w-auto"
                  >
                    <Plus /> {hasTarget ? 'Edit Target' : 'Set Target'}
                  </button>
                </div>
              </div>

              {!hasTarget ? (
                <div className="bg-white p-6 md:p-10 rounded-xl shadow text-center border">
                  <Target size={50} className="mx-auto text-blue-500" />
                  <h2 className="text-lg md:text-xl font-semibold mt-3">No target set for this week</h2>
                  <p className="text-gray-600 mt-1 text-sm md:text-base">
                    Set your weekly target to start tracking.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 md:p-6 rounded-xl shadow border mb-8">
                    <h2 className="text-lg md:text-xl font-bold mb-4">Weekly Summary</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm">Target Amount ($)</p>
                        <p className="text-2xl md:text-3xl font-bold">{targetAmount}</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <p className="text-gray-500 text-sm">Achieved ($)</p>
                        <p className="text-2xl md:text-3xl font-bold text-green-600">{achievedAmount}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="mb-1 text-sm">Progress</p>
                      <div className="bg-gray-200 w-full h-3 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-right mt-1 text-sm font-semibold">{progress}%</p>
                    </div>
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 md:p-6 rounded-xl border border-blue-200 mt-6 md:mt-10">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-700 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">How It Works</h3>
                    <p className="text-xs md:text-sm text-blue-800">
                      Add both your Target & Achieved amounts manually every week.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
              <div className="bg-white w-full max-w-md rounded-xl p-4 md:p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-bold">
                    {modalMode === 'create' ? 'Set Weekly Target' : 'Edit Weekly Target'}
                  </h2>
                  <button onClick={handleCloseModal} className="p-1">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <label className="font-medium mb-1 block text-sm md:text-base">Target Amount (in $)</label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg text-sm md:text-base"
                    required
                  />

                  <label className="font-medium mb-1 block mt-4 text-sm md:text-base">Achieved Amount (in $)</label>
                  <input
                    type="number"
                    value={formAchievedAmount}
                    onChange={(e) => setFormAchievedAmount(e.target.value)}
                    className="w-full border p-2 md:p-3 rounded-lg text-sm md:text-base"
                  />

                  <button
                    type="submit"
                    className="w-full mt-4 bg-blue-600 text-white py-2 md:py-3 rounded-lg text-sm md:text-base"
                  >
                    {modalMode === 'create' ? 'Save Target' : 'Update Target'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
