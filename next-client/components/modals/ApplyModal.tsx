"use client";

import Modal from "react-modal";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { appliedJobSchema } from '@/lib/utils/validations";

Modal.setAppElement("#root");

const ApplyModal = ({ isOpen, onRequestClose, jobId, job, onApplyJob }) => {
  console.log("ApplyModal job:", job);
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const [profileOptions, setProfileOptions] = useState([]);
  const [techOptions, setTechOptions] = useState([]);



  const fetchProfiles = async () => {
    try {
      const response = await fetch(`/api/profiles`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      console.log("Fetched profiles:", data);
      if (Array.isArray(data)) {
        const formatted = data.map(profile => ({
          value: profile.id,
          label: profile.name,
        }));
        console.log("Setting profileOptions:", formatted);
        setProfileOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };
  const fetchTechnologies = async () => {
    try {
      const response = await fetch(`/api/jobs/technologies/names`);
      const data = await response.json();
      if (Array.isArray(data.technologies)) {
        const formatted = data.technologies.map(tech => ({ value: tech, label: tech }));
        setTechOptions(formatted);
      } else {
        console.warn("Unexpected response format:", data);
      }
    } catch (err) {
      console.error("Failed to fetch technologies:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
    fetchTechnologies();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const response = await fetch(`/api/jobs/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          jobId,
          bidderName: values.bidderName,
          profileId: values.profileId, // ✅ Send profileId
          technologies: values.technologies,
          connectsUsed: Number(values.connects),
          proposalLink: values.proposalLink,
          submitted: true,
        }),
      });

      if (response.status === 201) {
        toast.success("You have successfully applied for the job!");
        onApplyJob(jobId);
        onRequestClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to apply for the job");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", error);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Apply Job Modal"
        className="bg-white p-6 mt-[100px] mx-4 rounded-lg shadow-md lg:w-1/3 w-full lg:mx-auto mt-5 outline-none z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-40"
      >
        <h2 className="text-xl font-bold mb-4">Applied Job Details</h2>
        <Formik
          initialValues={{
            bidderName: user.firstname,
            profileId: "", // ✅ was profileName
            technologies: [],
            connectsUsed: "",
            proposalLink: "",
          }}
          validationSchema={appliedJobSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form className="space-y-3">
              <div>
                <label className="block font-medium">Upwork Profile Name</label>
                <Select
                  name="profileId"
                  value={profileOptions.find(opt => opt.value === values.profileId) || null}
                  onChange={(option) => setFieldValue("profileId", option.value)}
                  options={profileOptions}
                  className="w-full"
                  placeholder="Select Profile"
                />
                <ErrorMessage name="profileName" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block font-medium">Technologies Used</label>
                <Select
                  isMulti
                  name="technologies"
                  value={values.technologies.map(t => ({ value: t, label: t }))}
                  onChange={(options) => setFieldValue("technologies", options.map(opt => opt.value))}
                  options={techOptions}
                  className="w-full"
                  placeholder="Select Technologies"
                />
                <ErrorMessage name="technologies" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block font-medium">Connects Used</label>
                <Field name="connects" type="number" className="w-full border px-3 py-2 rounded" />
                <ErrorMessage name="connects" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block font-medium">Proposal Link</label>
                <Field name="proposalLink" className="w-full border px-3 py-2 rounded" />
                <ErrorMessage name="proposalLink" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="flex justify-end mt-5 gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={onRequestClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default ApplyModal;
