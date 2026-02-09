import { useState } from "react";
import { useFormik } from "formik";
import { loginSchema } from "../utils/validations";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from "lucide-react"; // or any icons you like
import { useSelector } from "react-redux";
import logo from "../assets/dark.png";
// Adjust the path to your logo
const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const user = useSelector((state) => state?.auth?.user);
  // const role = user?.role;
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
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
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
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard/profile");
    }
  }, 2000);
    } else {
      console.error("Invalid login response:", response.data);
      toast.error("Unexpected login response. Please try again.");
    }
  } catch (error) {
    console.error("Login Error:", error);

    // 💡 Handle blocked user message or other server errors
    const errMsg = error.response?.data?.error || "Login failed.";
    toast.error(errMsg);
  } finally {
    setLoading(false);
  }
}


  });

  return (
    <div className="flex justify-center flex-col items-center min-h-screen bg-[#E9ECEF]">
      <img src={logo} className="lg:w-[22%] w-[65%] mb-5" />
      <div className="bg-white p-6 rounded-lg shadow-md lg:w-96  w-[80%]">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-2 border rounded-md"
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
              className="w-full p-2 border rounded-md border-none focus:outline-none "
            />
            <span
              className=" cursor-pointer pr-2"
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
            className="w-full  text-white p-2 rounded-md bg-[#f76a00] hover:bg-[#db6613] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>

      {/* Toast notifications */}
    <ToastContainer
  position="top-center"
  autoClose={3000}
  toastClassName="custom-toast"
/>
    </div>
  );
};

export default Login;
