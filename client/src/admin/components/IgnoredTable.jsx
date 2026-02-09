export default function IgnoredJobsTable({ jobs }) {
  return (
    <table className="min-w-full bg-white border shadow-xl rounded-lg overflow-hidden">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr className="text-left text-sm font-bold text-gray-700">
          <th className="p-4 w-[18rem]">Title</th>
          <th className="p-4">Location</th>
          <th className="p-4">Job Type</th>
          <th className="p-4">Price</th>
          <th className="p-4">Reason</th>
          <th className="p-4">Job Link</th>
          <th className="p-4">Ignored Time</th>
        </tr>
      </thead>
      <tbody className="text-sm">
        {jobs.length > 0 ? (
          jobs.map((job, idx) => (
            <tr
              key={job.id || job.jobId}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-4">{job.title || job.manualJobTitle || "—"}</td>
              <td className="p-4">
                {job.clientLocation?.replace("Location\n", "") || "—"}
              </td>
              <td className="p-4">{job.jobType || "—"}</td>
              <td className="p-4">{job.fixedPrice || job.hourlyRate || "—"}</td>
              <td className="p-4">{job.reason || job.customReason || "—"}</td>
              <td className="p-4">
                {job.link || job.manualJobUrl ? (
                  <a
                    href={job.link || job.manualJobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Job
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-4">
                {job.ignoredAt
                  ? new Date(job.ignoredAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </td>
            </tr>
          ))
        ) : (
          <>
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No ignored jobs found.
              </td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
}
