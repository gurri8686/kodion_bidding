'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAppSelector } from '@/lib/store/hooks';

export default function UserJobDetails() {
  const params = useParams();
  const userId = params.userId as string;
  const token = useAppSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError('');

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/user/${userId}/jobs`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (!cancelled) setData(res.data);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.response?.data?.error || e?.message || 'Failed to load user job details.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (userId && token) run();
    else {
      setLoading(false);
      setError('Missing userId in route.');
    }

    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900">User Job Details</h1>
          <p className="text-sm text-gray-600">UserId: {userId}</p>
        </div>

        <div className="p-6">
          {loading && (
            <div className="bg-white border border-gray-200 p-10 rounded-xl text-center">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">Loading...</p>
            </div>
          )}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
              <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          )}
          {!loading && !error && (
            <div className="bg-white border border-gray-200 p-6 rounded-xl overflow-auto">
              <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
