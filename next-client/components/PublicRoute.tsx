"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSelector } from "react-redux";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const token = useSelector((state: any) => state.auth.token);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`/api/auth/check`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [token]);

  useEffect(() => {
    if (isAuthenticated === true) {
      router.replace("/jobs");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated) return null;

  return <>{children}</>;
};

export default PublicRoute;
