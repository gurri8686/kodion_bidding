import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/dashboard/Job";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import Profile from "./pages/dashboard/Profile";
import AppliedJobs from "./pages/dashboard/AppliedJobs";
import IgnoredJobs from "./pages/dashboard/IgnoredJobs";
import ScrapeLogs from "./pages/dashboard/ScrapeLogs";
import Notifications from "./pages/dashboard/Notifications";
import Dashboard from "./admin/Dashboard";
import Settings from "./pages/dashboard/Settings";
import "./App.css";
import UserActivity from "./admin/UserActivity";
import AllUsers from "./admin/Allusers";
import UserJobDetails from "./admin/UserJobDetails";
import HiredJobs from "./pages/dashboard/HiredJobs";
import ManageDevelopers from "./pages/dashboard/ManageDevelopers";
import { Loader } from "./utils/Loader";
import Connects from "./admin/Connects";
import Test from "./pages/dashboard/Test.jsx";
import ProgressTracker from "./admin/ProgressTracker";
import ConnectsCost from "./admin/ConnectCost";
import Portfolios from "./pages/dashboard/Portfolios";
import AllPortfolios from "./admin/AllPortfolios";
function App() {
  const token = useSelector((state) => state?.auth?.token);
  const user = useSelector((state) => state?.auth?.user);
  const role = user?.role;
  console.log("User Role:", role);
  // // Optional loading guard if user info isn't ready
  // if (token && !role) {
  //   return <div><Loader/></div>;
  // }
  if (token && !role) {
    return <Loader />;
  }
  return (  
    <Router>
      <Routes>
        {/* Redirect root path based on token and role */}
        <Route
          path="/"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Admin Routes */}
        {role === "admin" && (
          <>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/jobs" element={<Jobs />} />
            <Route path="/admin/applied-jobs" element={<AppliedJobs />} />
            <Route path="/admin/ignored-jobs" element={<IgnoredJobs />} />
            <Route path="/admin/hired-jobs" element={<HiredJobs />} />
            <Route path="/admin/users" element={<AllUsers />} />
            <Route path="/admin/user-activity" element={<UserActivity />} />
            <Route path="/admin/scrape-logs" element={<ScrapeLogs />} />
            <Route path="/admin/user/:userId/jobs" element={<UserJobDetails />} />
            <Route path="/admin/connects-logs" element={<Connects />} />
            <Route path="/admin/progress-tracker" element={<ProgressTracker />} />
            <Route path="/admin/connects-cost" element={<ConnectsCost />} />
            <Route path="/admin/portfolios" element={<AllPortfolios />} />
            <Route path="/admin/notifications" element={<Notifications />} />
          </>
        )}

        {/* Protected User Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/applied-jobs" element={<AppliedJobs />} />
          <Route path="/dashboard/ignored-jobs" element={<IgnoredJobs />} />
          <Route path="/dashboard/hired-jobs" element={<HiredJobs />} />
          <Route path="/dashboard/portfolios" element={<Portfolios />} />
          <Route path="/dashboard/progress-tracker" element={<ProgressTracker />} />
           <Route path="/dashboard/manage-developers" element={<ManageDevelopers />} />
             <Route path="/dashboard/test" element={<Test />} />
          {/* 👇 Conditional scrape logs route for non-admin users only */}
          <Route
            path="/dashboard/scrape-logs"
            element={
              role === "admin" ? (
                <Navigate to="/admin/scrape-logs" replace />
              ) : (
                <ScrapeLogs />
              )
            }
          />

          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/notifications" element={<Notifications />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
