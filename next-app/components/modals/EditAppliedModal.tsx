'use client';

import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useFormik } from "formik";
import Select from "react-select";
import { useSelector } from "react-redux";
import { editJobSchema } from "@/utils/validations";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditAppliedJobModal = ({ isOpen, onClose, job, fetchAppliedJobs }: any) => {
  const { token } = useSelector((state: any) => state.auth);
  const [techOptions, setTechOptions] = useState<any[]>([]);
  const [profileOptions, setProfileOptions] = useState<any[]>([]);
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);

  const fetchTechnologies = async () => {
    try {
      const response = await fetch(`/api/jobs/all-technology-names`);
      const data = await response.json();
      if (Array.isArray(data.technologies)) {
        setTechOptions(data.technologies.map((tech: string) => ({ value: tech, label: tech })));
      }
    } catch (err) { console.error("Error fetching technologies:", err); }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`/api/get-all-profiles`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (Array.isArray(data)) {
        setProfileOptions(data.map((p: any) => ({ value: p.id, label: p.name })));
      }
    } catch (err) { console.error("Error fetching profiles:", err); }
  };

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(`/api/admin/platforms`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (Array.isArray(data)) {
        setPlatformOptions(data.map((p: any) => ({ value: p.id, label: p.name })));
      }
    } catch (err) { console.error("Error fetching platforms:", err); }
  };

  useEffect(() => {
    if (token) { fetchTechnologies(); fetchProfiles(); fetchPlatforms(); }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      manualJobTitle: job?.manualJobTitle || job?.Job?.title || "",
      profileId: job?.profile?.id || "",
      platformId: job?.platformId || "",
      proposalLink: job?.proposalLink || "",
      manualJobUrl: job?.manualJobUrl || "",
      appliedAt: job?.appliedAt || new Date().toISOString().split("T")[0],
      technologies: Array.isArray(job?.technologies) ? job.technologies : typeof job?.technologies === "string" ? JSON.parse(job.technologies) : [],
      connectsUsed: job?.connectsUsed || 0,
    },
    enableReinitialize: true,
    validationSchema: editJobSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(`/api/jobs/edit-apply-job/${job.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            manualJobTitle: values.manualJobTitle, profileId: values.profileId, platformId: values.platformId,
            technologies: values.technologies, connectsUsed: Number(values.connectsUsed),
            proposalLink: values.proposalLink, manualJobUrl: values.manualJobUrl, appliedAt: values.appliedAt,
          }),
        });
        const result = await response.json();
        if (response.ok) { toast.success("Job updated successfully!"); fetchAppliedJobs(); onClose(); }
        else { toast.error(result.message || "Failed to update job"); }
      } catch (err) { console.error("Error in handleSubmit:", err); toast.error("Something went wrong."); }
    },
  });

  if (!isOpen) return null;

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Edit Applied Job Modal"
        className="bg-white p-6 mx-4 rounded-lg shadow-md lg:w-1/2 w-full lg:mx-auto outline-none z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-40">
        <h2 className="text-xl font-bold mb-4">Edit Applied Job</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Job Title</label>
              <input type="text" name="manualJobTitle" value={formik.values.manualJobTitle} onChange={formik.handleChange} className="w-full border px-3 py-2 rounded" />
              {formik.touched.manualJobTitle && formik.errors.manualJobTitle && <div className="text-red-500 text-sm">{formik.errors.manualJobTitle as string}</div>}
            </div>
            <div>
              <label className="block font-medium">Upwork Profile</label>
              <Select name="profileId" value={profileOptions.find(opt => opt.value === formik.values.profileId) || null} onChange={(option: any) => formik.setFieldValue("profileId", option.value)} options={profileOptions} className="w-full" />
              {formik.touched.profileId && formik.errors.profileId && <div className="text-red-500 text-sm">{formik.errors.profileId as string}</div>}
            </div>
          </div>
          <div>
            <label className="block font-medium">Platform</label>
            <Select name="platformId" value={platformOptions.find(opt => opt.value === formik.values.platformId) || null} onChange={(option: any) => formik.setFieldValue("platformId", option.value)} options={platformOptions} className="w-full" placeholder="Select Platform" />
          </div>
          <div>
            <label className="block font-medium">Technologies</label>
            <Select isMulti name="technologies" value={formik.values.technologies.map((t: string) => ({ value: t, label: t }))} onChange={(options: any) => formik.setFieldValue("technologies", options.map((opt: any) => opt.value))} options={techOptions} className="w-full" />
            {formik.touched.technologies && formik.errors.technologies && <div className="text-red-500 text-sm">{formik.errors.technologies as string}</div>}
          </div>
          <div>
            <label className="block font-medium">Connects Used</label>
            <input type="number" name="connectsUsed" value={formik.values.connectsUsed} onChange={formik.handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Proposal Link</label>
              <input type="text" name="proposalLink" value={formik.values.proposalLink} onChange={formik.handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
            <div>
              <label className="block font-medium">Job URL</label>
              <input type="text" name="manualJobUrl" value={formik.values.manualJobUrl} onChange={formik.handleChange} className="w-full border px-3 py-2 rounded" />
            </div>
          </div>
          <div>
            <label className="block font-medium">Applied Date</label>
            <input type="date" name="appliedAt" value={formik.values.appliedAt?.split('T')[0]} onChange={formik.handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditAppliedJobModal;
