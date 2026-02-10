"use client";

import React from 'react';

interface User {
  firstname: string;
}

interface ConfirmUserBlockProps {
  setConfirmModalOpen: (open: boolean) => void;
  isStatusUpdating: boolean;
  confirmStatusChange: () => void;
  pendingAction: string | null;
  selectedUser: User | null;
}

const ConfirmUserBlock = ({
  setConfirmModalOpen,
  isStatusUpdating,
  confirmStatusChange,
  pendingAction,
  selectedUser
}: ConfirmUserBlockProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 m-4 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4 text-gray-900">
          {pendingAction === 'suspend' ? 'Suspend User' : 'Activate User'}
        </h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to <span className="font-semibold">{pendingAction}</span>{' '}
          <span className="font-semibold">{selectedUser?.firstname}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmModalOpen(false)}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={confirmStatusChange}
            disabled={isStatusUpdating}
            className={`px-5 py-2 text-white rounded ${
              pendingAction === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            } ${isStatusUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isStatusUpdating
              ? 'Processing...'
              : pendingAction === 'suspend'
              ? 'Suspend User'
              : 'Activate User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUserBlock;
