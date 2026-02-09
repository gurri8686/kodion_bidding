import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader } from "../utils/Loader";
const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/check`, {
          headers: {
            Authorization: `Bearer ${token}`, // optional if you're using cookies only
          },
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (err) {
        console.log(err.message, "checkAuth error")
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [token]);

  if (isAuthenticated === null) return <div><Loader /></div>; // or spinner

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
