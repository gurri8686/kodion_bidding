"use client";

import React from 'react';
import { X } from "lucide-react";

interface User {
  firstname: string;
  email: string;
  role: string;
  status: string;
}

interface ViewUserProps {
  selectedUser: User;
  setViewModalOpen: (open: boolean) => void;
}

const ViewUser = ({ selectedUser, setViewModalOpen }: ViewUserProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 m-4 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">User Details</h2>
          <button
            onClick={() => setViewModalOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-gray-500">Full Name</div>
            <div className="font-semibold text-gray-900">{selectedUser.firstname}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-semibold text-gray-900">{selectedUser.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Role</div>
            <div className="font-semibold text-gray-900">{selectedUser.role}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Account Status</div>
            <div className={`font-semibold ${selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {selectedUser.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
