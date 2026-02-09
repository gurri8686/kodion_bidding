import Modal from "react-modal";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { applyManualJobSchema } from "../utils/validations";
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";
import FileUpload from "../components/FileUpload";
Modal.setAppElement("#root");

const ApplyManualJob = ({
  isOpen,
  onRequestClose,
  onApplyJob,
  fetchAppliedJobs,
}) => {
  const { user, token } = useSelector((state) => state.auth);
  const [techOptions, setTechOptions] = useState([]);
  const [profileOptions, setProfileOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // Fetch platforms
  const fetchPlatforms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/platforms`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data.map((platform) => ({
          value: platform.id,
          label: platform.name,
        }));
        setPlatformOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching platforms:", err);
    }
  };

  const fetchTechOptions = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/jobs/all-technology-names`
      );
      const data = await response.json();

      if (Array.isArray(data.technologies)) {
        const formatted = data.technologies.map((tech) => ({
          label: tech,
          value: tech,
        }));
        setTechOptions(formatted);
      } else {
        console.warn("Unexpected format:", data);
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
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data.map((profile) => ({
          value: profile.id,
          label: profile.name,
        }));
        setProfileOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const handleClose = () => {
    formik.resetForm({
      values: {
        ...formik.initialValues,
        appliedAt: new Date().toISOString(),
      },
    });
    setAttachments([]);
    onRequestClose();
  };

  useEffect(() => {
    if (token) {
      fetchProfiles();
      fetchTechOptions();
      fetchPlatforms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const formik = useFormik({
    initialValues: {
      jobTitle: "",
      jobDescription: "",
      upworkJobUrl: "",
      bidderName: user?.firstname && user?.lastname
        ? `${user.firstname} ${user.lastname}`
        : "",
      platformId: null,
      // platformId: "", // <-- new field for platform
      technologies: [],
      connects: "",
      proposalLink: "",
      appliedAt: new Date().toISOString(),
    },
    validationSchema: applyManualJobSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append("userId", user.id);
        formData.append("jobTitle", values.jobTitle);
        formData.append("jobDescription", values.jobDescription || "");
        formData.append("upworkJobUrl", values.upworkJobUrl || "");
        formData.append("bidderName", values.bidderName);
        formData.append("profileId", values.profileId);

        // Send technologies as JSON string (backend will parse it)
        formData.append("technologies", JSON.stringify(values.technologies));

        formData.append("connectsUsed", Number(values.connects));
        formData.append("proposalLink", values.proposalLink || "");
        formData.append("appliedAt", values.appliedAt);
        formData.append("platformId", values.platformId || "");

        // Append files
        attachments.forEach((fileObj) => {
          if (fileObj.file) {
            formData.append("attachments", fileObj.file);
          }
        });

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/jobs/apply-job`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            credentials: "include",
            body: formData,
          }
        );

        if (res.status === 201) {
          toast.success("Job applied successfully!");
          resetForm();
          setAttachments([]);
          onApplyJob();
          onRequestClose();
          fetchAppliedJobs(1);
        } else if (res.status === 400) {
          toast.error("You already applied for this job.");
        }
      } catch (error) {
        console.error("Error submitting job:", error);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Reset appliedAt date when modal opens
  useEffect(() => {
    if (isOpen) {
      formik.setFieldValue("appliedAt", new Date().toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Add Manual Job Entry"
      className="bg-white mx-6 lg:mx-0 p-6 rounded-lg shadow-lg lg:w-1/2 w-full  mx-auto outline-none z-50 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-8 z-40"
    >
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="sticky -top-[23px] bg-white pb-4 mb-4 ">
        <h2 className="text-2xl font-bold text-gray-900">
          Add Your Job Application
        </h2>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Job Title */}
          <div>
            <input
              name="jobTitle"
              placeholder="Job Title"
              value={formik.values.jobTitle}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border p-2 rounded w-full"
            />
            {formik.touched.jobTitle && formik.errors.jobTitle && (
              <div className="text-red-500 text-sm">
                {formik.errors.jobTitle}
              </div>
            )}
          </div>

          {/* Upwork Profile */}
          <div>
            <Select
              name="profileId"
              value={
                profileOptions.find(
                  (opt) => opt.value === formik.values.profileId
                ) || null
              }
              onChange={(option) =>
                formik.setFieldValue("profileId", option.value)
              }
              onBlur={() => formik.setFieldTouched("profileId", true)}
              options={profileOptions}
              className="w-full"
              placeholder="Select Upwork Profile"
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
          <Select
            name="platformId"
            value={
              platformOptions.find(
                (opt) => opt.value === formik.values.platformId
              ) || null
            }
            onChange={(option) =>
              formik.setFieldValue("platformId", option.value)
            }
            onBlur={() => formik.setFieldTouched("platformId", true)}
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
          <Select
            isMulti
            name="technologies"
            value={formik.values.technologies.map((val) => ({
              label: val,
              value: val,
            }))}
            onChange={(opts) =>
              formik.setFieldValue(
                "technologies",
                opts.map((o) => o.value)
              )
            }
            onBlur={() => formik.setFieldTouched("technologies", true)}
            options={techOptions}
            placeholder="Select Technologies"
          />
          {formik.touched.technologies && formik.errors.technologies && (
            <div className="text-red-500 text-sm">
              {formik.errors.technologies}
            </div>
          )}
        </div>

        {/* Connects Used */}
        <div>
          <input
            name="connects"
            type="number"
            placeholder="Connects Used"
            value={formik.values.connects}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="border p-2 rounded w-full"
          />
          {formik.touched.connects && formik.errors.connects && (
            <div className="text-red-500 text-sm">{formik.errors.connects}</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Proposal Link */}
          <div>
            <input
              name="proposalLink"
              placeholder="Proposal Link"
              value={formik.values.proposalLink}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border p-2 rounded w-full"
            />
            {formik.touched.proposalLink && formik.errors.proposalLink && (
              <div className="text-red-500 text-sm">
                {formik.errors.proposalLink}
              </div>
            )}
          </div>

          {/* Job URL */}
          <div>
            <input
              name="upworkJobUrl"
              placeholder="Job URL"
              value={formik.values.upworkJobUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border p-2 rounded w-full"
            />
            {formik.touched.upworkJobUrl && formik.errors.upworkJobUrl && (
              <div className="text-red-500 text-sm">
                {formik.errors.upworkJobUrl}
              </div>
            )}
          </div>
        </div>
        {/* Applied Date */}
        <div>
          <label className="block mb-1 font-medium">Applied Date</label>
          <UnifiedDateTimePicker
            selectedDate={new Date(formik.values.appliedAt)}
            setSelectedDate={(date) =>
              formik.setFieldValue("appliedAt", date.toISOString())
            }
            position="above"
            withTime={true}
          />
          {formik.touched.appliedAt && formik.errors.appliedAt && (
            <div className="text-red-500 text-sm">
              {formik.errors.appliedAt}
            </div>
          )}
        </div>

        {/* File Upload */}
        <FileUpload files={attachments} setFiles={setAttachments} maxFiles={5} />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 ">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {formik.isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyManualJob;