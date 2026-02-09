export default function AppliedJobsTable({ jobs }) {
  return (
    <table className="min-w-full bg-white border shadow-xl rounded-lg overflow-hidden">
      <thead className="bg-gray-50 sticky top-0 z-10">
        <tr className="text-left text-sm font-bold text-gray-700">
          <th className="p-4 w-[18rem]">Title</th>
          <th className="p-4">Profile Used</th>
          <th className="p-4">Connects Used</th>
          <th className="p-4">Technology Applied</th>
          <th className="p-4">Proposal Link</th>
          <th className="p-4">Job Link</th>
          <th className="p-4">Applied At</th>
        </tr>
        
      </thead>
      <tbody className="text-sm">
        {jobs.length > 0 ? (
          jobs.map((job, idx) => (
            <tr
              key={job.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="p-4">
                {job.manualJobTitle || job.Job?.title || "—"}
              </td>
              <td className="p-4">{job?.profile?.name ?? "—"}</td>
              <td className="p-4">{job.connectsUsed ?? "—"}</td>
              <td className="p-4">
                {(() => {
                  if (job.technologies) {
                    try {
                      const techs = JSON.parse(job.technologies);
                      return Array.isArray(techs)
                        ? techs.join(", ")
                        : job.technologies;
                    } catch {
                      return job.technologies;
                    }
                  }
                  return "—";
                })()}
              </td>
              <td className="p-4">
                {job.proposalLink || job.manualJobUrl ? (
                  <a
                    href={job.proposalLink || job.manualJobUrl}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    View Proposal
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-4">
                {job.manualJobUrl || job.proposalLink ? (
                  <a
                    href={job.manualJobUrl || job.proposalLink}
                    target="_blank"
                    className="text-green-600 hover:underline"
                  >
                    Job Link
                  </a>
                ) : (
                  "—"
                )}
              </td>
              <td className="p-4">
                {job.appliedAt
                  ? new Date(job.appliedAt).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "—"}
              </td>
            </tr>
          ))
        ) : (
          <>
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No applied jobs found.
              </td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
}
