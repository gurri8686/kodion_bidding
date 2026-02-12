'use client';

import { useState } from "react";
import { useFormik } from "formik";
import { loginSchema } from "@/lib/utils/validations";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCredentials } from "@/lib/store/slices/authSlice";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post(
          `/api/auth/login`,
          values,
          { withCredentials: true }
        );

        const { token, userId, user } = response.data;

        if (token && userId && user) {
          dispatch(setCredentials({ token, userId, user }));
          toast.success("Welcome! You're logged in.");
          localStorage.setItem("userId", userId);
          setTimeout(() => {
            if (user.role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/profile");
            }
          }, 2000);
        } else {
          console.error("Invalid login response:", response.data);
          toast.error("Unexpected login response. Please try again.");
        }
      } catch (error: any) {
        console.error("Login Error:", error);
        
        // Show more detailed error
        let errMsg = "Login failed.";
        if (error.response?.data?.error) {
          errMsg = error.response.data.error;
        } else if (error.message) {
          errMsg = error.message;
        } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_CLOSED') {
          errMsg = "Cannot connect to server. Database may be unavailable.";
        }
        
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="flex justify-center flex-col items-center min-h-screen bg-[#E9ECEF]">
      <Image src="/dark.png" alt="Logo" width={300} height={100} className="lg:w-[22%] w-[65%] mb-5" priority />
      <div className="bg-white p-6 rounded-lg shadow-md lg:w-96 w-[80%]">
        <h2 className="text-2xl font-semibold text-center mb-4 text-gray-900">Login</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-md text-gray-900 placeholder-gray-500"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
          </div>

          <div className="flex items-center justify-between border border-gray-300 rounded-md
             focus-within:border-1 focus-within:border-black
             focus-within:ring-1 focus-within:ring-black">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-md border-none focus:outline-none text-gray-900 placeholder-gray-500"
            />
            <span
              className="cursor-pointer pr-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-red-500 text-sm err-msg">{formik.errors.password}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white p-2 rounded-md bg-[#f76a00] hover:bg-[#db6613] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        toastClassName="custom-toast"
      />
    </div>
  );
};

export default LoginPage;
