"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface UserJobDetailsProps {
  params: {
    userId: string;
  };
}

export default function UserJobDetails({ params }: UserJobDetailsProps) {
  const { userId } = params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        const url = `/api/admin/users/${userId}/jobs`;
        const res = await axios.get(url, { withCredentials: true });

        if (!cancelled) setData(res.data);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.response?.data?.error ||
              e?.message ||
              "Failed to load user job details."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (userId) run();
    else {
      setLoading(false);
      setError("Missing userId in route.");
    }

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">User Job Details</h1>
      <p className="text-sm text-gray-600 mb-4">UserId: {userId}</p>

      {loading && (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f76a00]"></div>
        </div>
      )}
      {!loading && error && (
        <div className="text-red-600 text-sm whitespace-pre-wrap bg-red-50 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      {!loading && !error && (
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
