# Remaining Modal Components - Creation Guide

This document contains all the code for the remaining modal components. Create each file manually in the specified location.

## 1. ApplyModal.tsx
**Location:** `d:\bidding-tracking\next-app\components\modals\ApplyModal.tsx`

```typescript
'use client';

import Modal from "react-modal";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useEffect, useState } from "react";
import { appliedJobSchema } from "../../lib/validations";

interface ApplyModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  jobId: string;
  job: any;
  onApplyJob: (jobId: string) => void;
}

const ApplyModal = ({ isOpen, onRequestClose, jobId, job, onApplyJob }: ApplyModalProps) => {
  const { user } = useSelector((state: any) => state.auth);
  const token = useSelector((state: any) => state.auth.token);
  const [profileOptions, setProfileOptions] = useState([]);
  const [techOptions, setTechOptions] = useState([]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`/api/get-all-profiles`, {
        method: "GET",
        headers: { Authorization: \`Bearer \${token}\` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data.map((profile: any) => ({
          value: profile.id,
          label: profile.name,
        }));
        setProfileOptions(formatted);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const response = await fetch(`/api/jobs/all-technology-names`);
      const data = await response.json();
      if (Array.isArray(data.technologies)) {
        const formatted = data.technologies.map((tech: string) => ({ value: tech, label: tech }));
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

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch(`/api/jobs/apply-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${token}\`,
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          jobId,
          bidderName: values.bidderName,
          profileId: values.profileId,
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
      toast.error("Something went wrong. Please try again.");
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
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold mb-4">Applied Job Details</h2>
        <Formik
          initialValues={{
            bidderName: user?.firstname || "",
            profileId: "",
            technologies: [],
            connectsUsed: "",
            proposalLink: "",
          }}
          validationSchema={appliedJobSchema}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }: any) => (
            <Form className="space-y-3">
              <div>
                <label className="block font-medium">Upwork Profile Name</label>
                <Select
                  name="profileId"
                  value={profileOptions.find((opt: any) => opt.value === values.profileId) || null}
                  onChange={(option: any) => setFieldValue("profileId", option.value)}
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
                  value={values.technologies.map((t: string) => ({ value: t, label: t }))}
                  onChange={(options: any) => setFieldValue("technologies", options.map((opt: any) => opt.value))}
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
```

---

## 2. MediaGalleryModal.tsx
**Location:** `d:\bidding-tracking\next-app\components\modals\MediaGalleryModal.tsx`

```typescript
'use client';

import Modal from "react-modal";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useState } from "react";

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachments?: string[];
}

const MediaGalleryModal = ({ isOpen, onClose, attachments = [] }: MediaGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  const currentFile = attachments[currentIndex];
  const filename = currentFile.split('/').pop() || '';
  const isImage = /\\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename);
  const isPdf = /\\.pdf$/i.test(filename);
  const fullUrl = \`\${process.env.NEXT_PUBLIC_API_URL}\${currentFile}\`;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % attachments.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
  };

  const handleClose = () => {
    setCurrentIndex(0);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      contentLabel="Media Gallery"
      className="bg-white mx-4 lg:mx-auto p-0 rounded-xl shadow-2xl lg:w-[90vw] lg:max-w-6xl w-full outline-none z-50 max-h-[95vh] flex flex-col overflow-hidden"
      overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      ariaHideApp={false}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {filename}
          </h2>
          <p className="text-sm text-gray-500">
            {currentIndex + 1} of {attachments.length} • {isImage ? 'Image' : isPdf ? 'PDF Document' : 'File'}
          </p>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* Open in New Tab (for PDF) */}
          {isPdf && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={20} className="text-gray-700" />
            </a>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
            title="Close"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Fixed Height */}
      <div className="flex items-center justify-center bg-gray-900 relative overflow-hidden h-[600px]">
        {isImage ? (
          <img
            src={fullUrl}
            alt={filename}
            className="max-w-full max-h-full object-contain"
          />
        ) : isPdf ? (
          <div className="w-full h-full bg-white p-4">
            <iframe
              src={fullUrl}
              title={filename}
              className="w-full h-full rounded"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-white p-8">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg mb-4">Preview not available</p>
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Open File
            </a>
          </div>
        )}

        {/* Navigation Arrows */}
        {attachments.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white flex items-center justify-center transition-all"
              title="Previous"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white flex items-center justify-center transition-all"
              title="Next"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {attachments.length > 1 && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {attachments.map((fileUrl, idx) => {
              const thumbFilename = fileUrl.split('/').pop() || '';
              const thumbIsImage = /\\.(jpg|jpeg|png|gif|webp)$/i.test(thumbFilename);
              const thumbIsPdf = /\\.pdf$/i.test(thumbFilename);

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={\`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all \${
                    currentIndex === idx ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-gray-400'
                  }\`}
                >
                  {thumbIsImage ? (
                    <img
                      src={\`\${process.env.NEXT_PUBLIC_API_URL}\${fileUrl}\`}
                      alt={thumbFilename}
                      className="w-full h-full object-cover"
                    />
                  ) : thumbIsPdf ? (
                    <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                      <span className="text-[8px] font-bold text-red-600 mt-1">PDF</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MediaGalleryModal;
```

---

## Remaining Files

Due to length constraints, I've created the most critical modal components above. The remaining components follow similar patterns:

### Pattern for Stage Modals (MarkAsReply, MarkAsInterview, MarkAsNotHired)
- Use similar structure to ViewStageDetailsModal
- Include date/time picker
- Include notes field
- POST to `/api/jobs/update-stage/{id}`

### Pattern for Edit/Add Modals (EditAppliedModal, HiredJob, ApplyManualJob, Portfolio modals)
- Use Formik for form handling
- Use react-select for dropdowns
- Include validation schemas from lib/validations.ts
- Follow the structure of ApplyModal above

### Pattern for Attachment Modals
- Similar to MediaGalleryModal
- Support image preview and PDF viewing
- Include download functionality

## Supporting Files Needed

### 1. lib/validations.ts
Copy from: `d:\bidding-tracking\client\src\utils\validations.js`
Convert to TypeScript with proper types

### 2. lib/components/UnifiedDateTimePicker.tsx
Copy from: `d:\bidding-tracking\client\src\components\UnifiedDateTimePicker.jsx`
Convert to TypeScript

### 3. lib/components/FileUpload.tsx
Copy from: `d:\bidding-tracking\client\src\components\FileUpload.jsx`
**IMPORTANT**: Update to use @vercel/blob instead of local file handling

## Next Steps

1. Create all remaining modal components using the patterns above
2. Create supporting utility files
3. Test each component individually
4. Verify API integrations work correctly
