import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { registerSchema } from "../utils/validations";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Eye, EyeOff } from "lucide-react"; // 👈 Eye toggle icons
import logo from "../assets/dark.png"; // Adjust the path to your logo

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // 👈 Eye toggle state



  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        values
      );
      toast.success(data.message);
      resetForm();
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen ">
      <img src={logo} className="lg:w-[22%] w-[65%] mb-5" />
      <div className="bg-white p-6 rounded-lg shadow-md lg:w-96 w-[80%]">
        <h2 className="text-2xl font-semibold text-center mb-4">Register</h2>
        <Formik
          initialValues={{ firstname: "", lastname: "", email: "", password: "" }}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              {["firstname", "lastname", "email"].map((field) => (
                <div key={field}>
                  <Field
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    placeholder={field[0].toUpperCase() + field.slice(1).replace("name", " Name")}
                    className="w-full p-2 border rounded-md"
                  />
                  <ErrorMessage name={field} component="div" className="text-red-500 text-sm" />
                </div>
              ))}
              <div className="flex items-center justify-between border border-gray-300 rounded-md 
             focus-within:border-1 focus-within:border-black 
             focus-within:ring-1 focus-within:ring-black">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border-none outline-none"
                />
                <span className="cursor-pointer pr-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm err-msg" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#f76a00] hover:bg-[#db6613] text-white p-2 rounded-md  transition"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
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
export default Register;

