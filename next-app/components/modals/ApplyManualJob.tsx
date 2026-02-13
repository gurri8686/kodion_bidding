'use client';

import Modal from "react-modal";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { applyManualJobSchema } from "@/utils/validations";
import FileUpload from "@/components/FileUpload";

const ApplyManualJob = ({ isOpen, onRequestClose, onApplyJob, fetchAppliedJobs }: any) => {
  const { user, token } = useSelector((state: any) => state.auth);
  const [techOptions, setTechOptions] = useState<any[]>([]);
  const [profileOptions, setProfileOptions] = useState<any[]>([]);
  const [platformOptions, setPlatformOptions] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch(`/api/admin/platforms`, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (Array.isArray(data)) setPlatformOptions(data.map((p: any) => ({ value: p.id, label: p.name })));
    } catch (err) { console.error("Error fetching platforms:", err); }
  };

  const fetchTechOptions = async () => {
    try {
      const response = await fetch(`/api/jobs/all-technology-names`);
      const data = await response.json();
      if (Array.isArray(data.technologies)) setTechOptions(data.technologies.map((tech: string) => ({ label: tech, value: tech })));
    } catch (err) { console.error("Error fetching technologies:", err); }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`/api/get-all-profiles`, { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (Array.isArray(data)) setProfileOptions(data.map((p: any) => ({ value: p.id, label: p.name })));
    } catch (err) { console.error("Error fetching profiles:", err); }
  };

  const handleClose = () => {
    formik.resetForm({ values: { ...formik.initialValues, appliedAt: new Date().toISOString() } });
    setAttachments([]);
    onRequestClose();
  };

  useEffect(() => {
    if (token) { fetchProfiles(); fetchTechOptions(); fetchPlatforms(); }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      jobTitle: "", jobDescription: "", upworkJobUrl: "",
      bidderName: user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : "",
      platformId: null, profileId: "", technologies: [] as string[], connects: "", proposalLink: "",
      appliedAt: new Date().toISOString(),
    },
    validationSchema: applyManualJobSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const formData = new FormData();
        formData.append("userId", user.id);
        formData.append("jobTitle", values.jobTitle);
        formData.append("jobDescription", values.jobDescription || "");
        formData.append("upworkJobUrl", values.upworkJobUrl || "");
        formData.append("bidderName", values.bidderName);
        formData.append("profileId", values.profileId);
        formData.append("technologies", JSON.stringify(values.technologies));
        formData.append("connectsUsed", String(Number(values.connects)));
        formData.append("proposalLink", values.proposalLink || "");
        formData.append("appliedAt", values.appliedAt);
        formData.append("platformId", values.platformId || "");
        attachments.forEach((fileObj: any) => { if (fileObj.file) formData.append("attachments", fileObj.file); });

        const res = await fetch(`/api/jobs/apply-job`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }, credentials: "include", body: formData,
        });
        if (res.status === 201) {
          toast.success("Job applied successfully!");
          resetForm(); setAttachments([]); onApplyJob(); onRequestClose(); fetchAppliedJobs(1);
        } else if (res.status === 400) { toast.error("You already applied for this job."); }
      } catch (error) { console.error("Error submitting job:", error); toast.error("Something went wrong."); }
      finally { setSubmitting(false); }
    },
  });

  useEffect(() => {
    if (isOpen) formik.setFieldValue("appliedAt", new Date().toISOString());
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onRequestClose={handleClose} contentLabel="Add Manual Job Entry"
      className="bg-white mx-6 lg:mx-0 p-6 rounded-lg shadow-lg lg:w-1/2 w-full mx-auto outline-none z-50 max-h-[90vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start pt-8 z-40">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="sticky -top-[23px] bg-white pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Add Your Job Application</h2>
      </div>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input name="jobTitle" placeholder="Job Title" value={formik.values.jobTitle} onChange={formik.handleChange} onBlur={formik.handleBlur} className="border p-2 rounded w-full" />
            {formik.touched.jobTitle && formik.errors.jobTitle && <div className="text-red-500 text-sm">{formik.errors.jobTitle as string}</div>}
          </div>
          <div>
            <Select name="profileId" value={profileOptions.find(opt => opt.value === formik.values.profileId) || null} onChange={(option: any) => formik.setFieldValue("profileId", option.value)} onBlur={() => formik.setFieldTouched("profileId", true)} options={profileOptions} className="w-full" placeholder="Select Upwork Profile" />
            {formik.touched.profileId && formik.errors.profileId && <div className="text-red-500 text-sm">{formik.errors.profileId as string}</div>}
          </div>
        </div>
        <div>
          <Select name="platformId" value={platformOptions.find(opt => opt.value === formik.values.platformId) || null} onChange={(option: any) => formik.setFieldValue("platformId", option.value)} options={platformOptions} className="w-full" placeholder="Select Platform" />
        </div>
        <div>
          <Select isMulti name="technologies" value={formik.values.technologies.map((val: string) => ({ label: val, value: val }))} onChange={(opts: any) => formik.setFieldValue("technologies", opts.map((o: any) => o.value))} onBlur={() => formik.setFieldTouched("technologies", true)} options={techOptions} placeholder="Select Technologies" />
          {formik.touched.technologies && formik.errors.technologies && <div className="text-red-500 text-sm">{formik.errors.technologies as string}</div>}
        </div>
        <div>
          <input name="connects" type="number" placeholder="Connects Used" value={formik.values.connects} onChange={formik.handleChange} onBlur={formik.handleBlur} className="border p-2 rounded w-full" />
          {formik.touched.connects && formik.errors.connects && <div className="text-red-500 text-sm">{formik.errors.connects as string}</div>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input name="proposalLink" placeholder="Proposal Link" value={formik.values.proposalLink} onChange={formik.handleChange} onBlur={formik.handleBlur} className="border p-2 rounded w-full" />
            {formik.touched.proposalLink && formik.errors.proposalLink && <div className="text-red-500 text-sm">{formik.errors.proposalLink as string}</div>}
          </div>
          <div>
            <input name="upworkJobUrl" placeholder="Job URL" value={formik.values.upworkJobUrl} onChange={formik.handleChange} onBlur={formik.handleBlur} className="border p-2 rounded w-full" />
            {formik.touched.upworkJobUrl && formik.errors.upworkJobUrl && <div className="text-red-500 text-sm">{formik.errors.upworkJobUrl as string}</div>}
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Applied Date</label>
          <input type="datetime-local" value={formik.values.appliedAt?.slice(0, 16)} onChange={(e) => formik.setFieldValue("appliedAt", new Date(e.target.value).toISOString())} className="border p-2 rounded w-full" />
        </div>
        <FileUpload files={attachments} setFiles={setAttachments} maxFiles={5} />
        <div className="flex justify-end gap-3 mt-6 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
          <button type="submit" disabled={formik.isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {formik.isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyManualJob;
