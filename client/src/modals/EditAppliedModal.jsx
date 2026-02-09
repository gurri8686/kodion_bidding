import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { useFormik } from "formik";
import Select from "react-select";
import { useSelector } from "react-redux";
import { editJobSchema } from "../utils/validations";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";
import { format } from "date-fns";

Modal.setAppElement("#root");

const EditAppliedJobModal = ({ isOpen, onClose, job, fetchAppliedJobs }) => {
  const { token } = useSelector((state) => state.auth);
  const [techOptions, setTechOptions] = useState([]);
  const [profileOptions, setProfileOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);

  const fetchTechnologies = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/jobs/all-technology-names`
      );
      const data = await response.json();
      if (Array.isArray(data.technologies)) {
        setTechOptions(
          data.technologies.map((tech) => ({ value: tech, label: tech }))
        );
      }
    } catch (err) {
      console.error("Error fetching technologies:", err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/get-all-profiles`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setProfileOptions(
          data.map((p) => ({ value: p.id, label: p.name }))
        );
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/platforms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setPlatformOptions(
          data.map((p) => ({ value: p.id, label: p.name }))
        );
      }
    } catch (err) {
      console.error("Error fetching platforms:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTechnologies();
      fetchProfiles();
      fetchPlatforms();
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      manualJobTitle: job.manualJobTitle || job.Job?.title || "",
      profileId: job.profile?.id || "",
      platformId: job.platformId || "", // <-- add platformId
      proposalLink: job.proposalLink || "",
      manualJobUrl: job.manualJobUrl || "",
      appliedAt: job.appliedAt || new Date().toISOString().split("T")[0],
      technologies: Array.isArray(job.technologies)
        ? job.technologies
        : typeof job.technologies === "string"
        ? JSON.parse(job.technologies)
        : [],
      connectsUsed: job.connectsUsed || 0,
    },
    enableReinitialize: true,
    validationSchema: editJobSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/jobs/edit-apply-job/${job.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              manualJobTitle: values.manualJobTitle,
              profileId: values.profileId,
              platformId: values.platformId, // <-- send platformId
              technologies: values.technologies,
              connectsUsed: Number(values.connectsUsed),
              proposalLink: values.proposalLink,
              manualJobUrl: values.manualJobUrl,
              appliedAt: values.appliedAt,
            }),
          }
        );

        const result = await response.json();
        if (response.ok) {
          toast.success("Job updated successfully!");
          fetchAppliedJobs();
          onClose();
        } else {
          toast.error(result.message || "Failed to update job");
        }
      } catch (err) {
        console.error("Error in handleSubmit:", err);
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        contentLabel="Edit Applied Job Modal"
        className="bg-white p-6 mx-4 rounded-lg shadow-md lg:w-1/2 w-full lg:mx-auto outline-none z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-40"
      >
        <h2 className="text-xl font-bold mb-4">Edit Applied Job</h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Job Title & Profile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Job Title</label>
              <input
                type="text"
                name="manualJobTitle"
                value={formik.values.manualJobTitle}
                onChange={formik.handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              {formik.touched.manualJobTitle && formik.errors.manualJobTitle && (
                <div className="text-red-500 text-sm">
                  {formik.errors.manualJobTitle}
                </div>
              )}
            </div>

            <div>
              <label className="block font-medium">Upwork Profile</label>
              <Select
                name="profileId"
                value={
                  profileOptions.find(
                    (opt) => opt.value === formik.values.profileId
                  ) || null
                }
                onChange={(option) => formik.setFieldValue("profileId", option.value)}
                options={profileOptions}
                className="w-full"
              />
              {formik.touched.profileId && formik.errors.profileId && (
                <div className="text-red-500 text-sm">
                  {formik.errors.profileId}
                </div>
              )}
            </div>
          </div>

          {/* Platform Dropdown */}
          <div>
            <label className="block font-medium">Platform</label>
            <Select
              name="platformId"
              value={
                platformOptions.find(
                  (opt) => opt.value === formik.values.platformId
                ) || null
              }
              onChange={(option) => formik.setFieldValue("platformId", option.value)}
              options={platformOptions}
              className="w-full"
              placeholder="Select Platform"
            />
            {formik.touched.platformId && formik.errors.platformId && (
              <div className="text-red-500 text-sm">
                {formik.errors.platformId}
              </div>
            )}
          </div>

          {/* Technologies */}
          <div>
            <label className="block font-medium">Technologies</label>
            <Select
              isMulti
              name="technologies"
              value={formik.values.technologies.map((t) => ({
                value: t,
                label: t,
              }))}
              onChange={(options) =>
                formik.setFieldValue(
                  "technologies",
                  options.map((opt) => opt.value)
                )
              }
              options={techOptions}
              className="w-full"
            />
            {formik.touched.technologies && formik.errors.technologies && (
              <div className="text-red-500 text-sm">
                {formik.errors.technologies}
              </div>
            )}
          </div>

          {/* Connects */}
          <div>
            <label className="block font-medium">Connects Used</label>
            <input
              type="number"
              name="connectsUsed"
              value={formik.values.connectsUsed}
              onChange={formik.handleChange}
              className="w-full border px-3 py-2 rounded"
            />
            {formik.touched.connectsUsed && formik.errors.connectsUsed && (
              <div className="text-red-500 text-sm">
                {formik.errors.connectsUsed}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proposal Link */}
            <div>
              <label className="block font-medium">Proposal Link</label>
              <input
                type="text"
                name="proposalLink"
                value={formik.values.proposalLink}
                onChange={formik.handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              {formik.touched.proposalLink && formik.errors.proposalLink && (
                <div className="text-red-500 text-sm">
                  {formik.errors.proposalLink}
                </div>
              )}
            </div>

            {/* Job URL */}
            <div>
              <label className="block font-medium">Job URL</label>
              <input
                type="text"
                name="manualJobUrl"
                value={formik.values.manualJobUrl}
                onChange={formik.handleChange}
                className="w-full border px-3 py-2 rounded"
              />
              {formik.touched.manualJobUrl && formik.errors.manualJobUrl && (
                <div className="text-red-500 text-sm">
                  {formik.errors.manualJobUrl}
                </div>
              )}
            </div>
          </div>
          {/* Applied Date */}
          <div>
            <label className="block font-medium">Applied Date</label>
            <UnifiedDateTimePicker
              selectedDate={new Date(formik.values.appliedAt)}
              position="above"
              withTime={true}
              setSelectedDate={(date) =>
                formik.setFieldValue("appliedAt", date.toISOString())
              }
            />
            {formik.touched.appliedAt && formik.errors.appliedAt && (
              <div className="text-red-500 text-sm">
                {formik.errors.appliedAt}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditAppliedJobModal;