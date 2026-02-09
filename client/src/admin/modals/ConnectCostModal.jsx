const ConnectCostModal = ({
  isOpen,
  onClose,
  onSubmit,
  editing,
  // platformId,
  // setPlatformId,
  platformName,
  setPlatformName,
  costUSD,
  setCostUSD,
  costINR,
  setCostINR,
}) => {

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.id === "modalOverlay") onClose();
  };

  return (
    <div
      id="modalOverlay"
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
    >
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">
          {editing ? "Update Connect Cost" : "Add New Platform & Cost"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">

          {/* Platform Name - only in ADD mode */}
          {!editing && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Enter Platform Name (e.g., Upwork)"
                className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                required
              />
            </div>
          )}

          {/* Cost USD */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cost per Connect (USD $)
            </label>
            <input
              type="number"
              min="0"
               step="0.01"
              value={costUSD}
              onChange={(e) => setCostUSD(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Cost INR */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cost per Connect (INR ₹)
            </label>
            <input
              type="number"
              min="0"
               step="0.01"
              value={costINR}
              onChange={(e) => setCostINR(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {editing ? "Update" : "Save"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectCostModal;
