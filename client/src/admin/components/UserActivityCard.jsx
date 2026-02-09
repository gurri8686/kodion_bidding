import { useNavigate } from 'react-router-dom';
const UserActivityCard = ({ user, token }) => {
  const navigate = useNavigate();

  const handleViewJobs = () => {
    navigate(`/admin/user/${user.id}/jobs`, {
      state: {
        user: user,
        token: token
      }
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* User Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
              style={{ background: 'linear-gradient(to right, #FF6D00, #FFA040)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-600 text-sm">{user.email || "Email not available"}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 text-sm">Jobs Applied</h4>
            <p className="text-xl font-bold text-blue-600">{user.appliedJobs || 0}</p>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 text-sm">Jobs Ignored</h4>
            <p className="text-xl font-bold text-yellow-600">{user.ignoredJobs || 0}</p>
          </div>
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-sm">Active Technologies</h4>
            <div className="flex flex-wrap gap-1">
              {user?.activeTechnologies?.length > 0 ? (
                user.activeTechnologies.map((tech) => (
                  <span key={tech} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-xs">No technologies listed</span>
              )}
            </div>
            <button
              onClick={handleViewJobs}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 mt-3 rounded-md transition"
            >
              View Jobs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserActivityCard