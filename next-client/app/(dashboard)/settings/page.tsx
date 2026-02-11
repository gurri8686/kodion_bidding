'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import GlobalHeader from '../../../components/GlobalHeader';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from "react-toastify";
import { Loader } from '../../../utils/Loader';
import "react-toastify/dist/ReactToastify.css";

const Settings = () => {
  const [activeTech, setActiveTech] = useState<string[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector((state: any) => state.auth.userId);
  const token = useSelector((state: any) => state.auth.token);

  useEffect(() => {
    fetchTechOptions();
    fetchActiveTechnologies();
  }, []);

  const fetchTechOptions = async () => {
    try {
      const endpoint = `/api/jobs/technologies/names`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.technologies)) {
        setAllTechnologies(data.technologies);
      } else {
        console.error("Unexpected format or error fetching tech list:", data);
        setAllTechnologies([]);
      }
    } catch (error) {
      console.error("Failed to load technologies:", error);
    }
  };

  const fetchActiveTechnologies = async () => {
    try {
      const response = await fetch(`/api/jobs/technologies/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        const techNames = data.technologies
          .filter((tech: any) => tech.is_active)
          .map((tech: any) => tech.name);
        setActiveTech(techNames);
      } else {
        console.error('Error fetching active technologies:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (tech: string) => {
    const isActive = activeTech.includes(tech);
    const endpoint = isActive ? 'deactivate' : 'activate';

    try {
      const response = await fetch(`/api/jobs/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, technologyName: tech }),
      });

      if (response.ok) {
        setActiveTech(prev =>
          isActive ? prev.filter(t => t !== tech) : [...prev, tech]
        );
        toast.success(`${tech} ${isActive ? 'removed' : 'added'} successfully.`);
      } else {
        toast.error(`Failed to ${isActive ? 'remove' : 'add'} technology.`);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <GlobalHeader title="Settings" />
        <div className="p-8 h-full flex items-start justify-center overflow-hidden">
          {loading ? (
            <div className='grid grid-cols-1 mx-auto'>
              <Loader />
            </div>
          ) : (
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg h-[calc(100vh-150px)] flex flex-col">
              <ToastContainer position="top-center" autoClose={2000} />

              <div className="px-8 py-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Manage Your Technologies</h2>
                <p className="text-sm text-gray-500 mt-1">Select the technologies you want to track for job opportunities</p>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-3">
                  {allTechnologies.length > 0 ? (
                    allTechnologies.map((tech) => (
                      <div
                        key={tech}
                        className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <span className="text-gray-700 font-medium text-base">{tech}</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={activeTech.includes(tech)}
                            onChange={() => handleToggle(tech)}
                          />
                          <div className="relative w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner" />
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No technologies found.</p>
                  )}
                </div>
              </div>

              <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">{activeTech.length}</span> {activeTech.length === 1 ? 'technology' : 'technologies'} selected
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
