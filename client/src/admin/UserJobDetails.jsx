import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserJobDetails() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError("");

        // This endpoint may vary; keeping it safe to render even if API isn't ready.
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/user/${userId}/jobs`;
        const res = await axios.get(url, { withCredentials: true });

        if (!cancelled) setData(res.data);
      } catch (e) {
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

      {loading && <div>Loading...</div>}
      {!loading && error && (
        <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>
      )}
      {!loading && !error && (
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

