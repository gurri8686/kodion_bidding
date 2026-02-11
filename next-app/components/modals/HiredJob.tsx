'use client';

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { hiredJobSchema } from "@/utils/validations";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HiredJobModal({ isOpen, onClose, onHiredSubmit, jobTitle, jobId, job, fetchAppliedJobs }: any) {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useSelector((state: any) => state.auth.token);
  const userId = useSelector((state: any) => state.auth.userId);

  useEffect(() => {
    if (!isOpen) return;
    const fetchDevelopers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/get-all-developers`, { headers: { Authorization: `Bearer ${token}` } });
        setDevelopers(res.data || []);
      } catch (error) {
        console.error("Error fetching developers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDevelopers();
  }, [isOpen, token]);

  const handleSubmit = async (values: any, { setSubmitting, resetForm }: any) => {
    const hiredDateTime = values.hiredTime ? `${values.hiredDate}T${values.hiredTime}` : `${values.hiredDate}T00:00`;
    const payload = {
      jobId: job.jobId, bidderId: userId, developerId: values.selectedDeveloper,
      hiredAt: hiredDateTime, notes: values.notes, budgetType: values.budgetType,
      budgetAmount: values.budgetAmount, profileName: values.profileName,
      clientName: values.ClientName, hiredDate: values.hiredDate,
    };
    try {
      await axios.post(`/api/jobs/mark-hired`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Job marked as hired successfully.");
      resetForm();
      onClose();
      fetchAppliedJobs();
    } catch (error: any) {
      console.error("Error submitting hired job:", error);
      toast.error(error?.response?.data?.message || "Failed to mark as hired.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-1/2 mx-4">
          <div className="flex items-center justify-between p-6 border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Mark as Hired</h3>
              <p className="text-sm text-gray-500 truncate">{jobTitle}</p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <Formik
            initialValues={{ selectedDeveloper: "", hiredDate: "", notes: "", budgetType: "", budgetAmount: "", profileName: job?.profile?.name || "", ClientName: "" }}
            validationSchema={hiredJobSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }: any) => (
              <Form className="px-6 pb-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Profile Name</label>
                    <Field type="text" name="profileName" readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Client Name</label>
                    <Field type="text" name="ClientName" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <ErrorMessage name="ClientName" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Budget Type</label>
                    <Field as="select" name="budgetType" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="">Select Budget Type</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Fixed">Fixed</option>
                    </Field>
                    <ErrorMessage name="budgetType" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
                    <Field type="number" name="budgetAmount" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter budget amount" />
                    <ErrorMessage name="budgetAmount" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Select Developer</label>
                    <Field as="select" name="selectedDeveloper" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                      <option value="">Choose a developer...</option>
                      {loading ? <option disabled>Loading...</option> : developers.map((dev: any) => (
                        <option key={dev.developerId} value={dev.developerId}>{dev.name}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="selectedDeveloper" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Hired Date</label>
                    <Field type="date" name="hiredDate" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <ErrorMessage name="hiredDate" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <Field as="textarea" name="notes" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none" />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4">
                  <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
