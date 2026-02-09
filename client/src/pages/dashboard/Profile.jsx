import { useSelector } from "react-redux";
import Sidebar from "../../components/Sidebar";
import GlobalHeader from "../../components/GlobalHeader";
import { Edit, User, Mail,  Phone,   } from "lucide-react";
const Profile = () => {
  const { user } = useSelector((state) => state.auth);


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <GlobalHeader title="Profile" />
        <main className="overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 h-32"></div>
            <div className="px-6 pb-6 -mt-16 relative">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={user.avatar || "https://avatar.vercel.sh/" + user.email}
                      alt="User avatar"
                      className="h-24 w-24 rounded-full border-4 border-white shadow-md"
                    />
                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50">
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.firstname} {user.lastname}
                    </h1>
                    <p className="text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <button className="mt-4 sm:mt-0 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-1">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 text-blue-500 mr-2" />
                  Personal Information
                </h2>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Edit
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.firstname}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.lastname}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    {user.email}
                  </p>
                </div>

                {user.phone && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </label>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {user.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>


        </div>
      </main>
      </div>
    </div>
  );
};

export default Profile;