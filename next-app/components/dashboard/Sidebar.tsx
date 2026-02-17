'use client';

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import axios from "axios";
import { logout } from "@/lib/store/slices/authSlice";
import { useState } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import {
  User,
  ClipboardList,
  Workflow,
  Settings,
  LogOut,
  LayoutDashboard,
  BarChart,
  BadgeCheck,
  Code2,
  Plug,
  DollarSign,
  FolderKanban,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        `/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(logout());
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      closeModal();
    }
  };

  const menuItems =
    role === "admin"
      ? [
          {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: <LayoutDashboard size={18} />,
          },
          {
            label: "User Activity",
            path: "/admin/activity",
            icon: <BarChart size={18} />,
          },
          {
            label: "Applied Jobs",
            path: "/applied-jobs",
            icon: <ClipboardList size={18} />,
          },
          {
            label: "Hired Jobs",
            path: "/hired-jobs",
            icon: <BadgeCheck size={18} />,
          },
          {
            label: "Portfolios",
            path: "/admin/portfolios",
            icon: <FolderKanban size={18} />,
          },
          {
            label: "Progress Tracker",
            path: "/admin/progress",
            icon: <Workflow size={18} />,
          },
          {
            label: "Connects Cost",
            path: "/admin/connect-cost",
            icon: <DollarSign size={18} />,
          },
          {
            label: "Connects Logs",
            path: "/admin/connects",
            icon: <Plug size={18} />,
          },
        ]
      : [
          {
            label: "Dashboard",
            path: "/jobs",
            icon: <LayoutDashboard size={18} />,
          },
          {
            label: "Profile",
            path: "/profile",
            icon: <User size={18} />,
          },
          {
            label: "Applied Jobs",
            path: "/applied-jobs",
            icon: <ClipboardList size={18} />,
          },
          {
            label: "Hired Jobs",
            path: "/hired-jobs",
            icon: <BadgeCheck size={18} />,
          },
          {
            label: "Portfolios",
            path: "/portfolios",
            icon: <FolderKanban size={18} />,
          },
          {
            label: "Progress Tracker",
            path: "/admin/progress",
            icon: <Plug size={18} />,
          },
          {
            label: "Manage Developers",
            path: "/developers",
            icon: <Code2 size={18} />,
          },
          {
            label: "Active Technologies",
            path: "/settings",
            icon: <Settings size={18} />,
          },
        ];

  const isActive = (path: string, label: string) => {
    if (label === "Dashboard") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const renderMenuItems = (onItemClick?: () => void) => (
    <>
      {menuItems.map((item) => (
        <li key={item.path}>
          <Link
            href={item.path}
            className={`p-3 flex items-center gap-3 rounded ${
              isActive(item.path, item.label)
                ? "bg-[#007BFF] text-white font-semibold"
                : "hover:bg-[#494E53]"
            }`}
            onClick={onItemClick}
          >
            {item.icon}
            {item.label}
          </Link>
        </li>
      ))}
      <li
        className="hover:bg-red-600 p-3 rounded cursor-pointer mt-6"
        onClick={openModal}
      >
        <LogOut size={18} className="inline-block mr-4" /> Logout
      </li>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle - CSS-only visibility */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="transition-transform duration-300 ease-in-out p-2 rounded-full shadow-md"
        >
          {isMobileMenuOpen ? (
            <X
              size={24}
              className="absolute top-[12px] left-[19rem] text-white"
            />
          ) : (
            <Menu size={26} />
          )}
        </button>
      </div>

      {/* Mobile Sidebar - CSS-only visibility */}
      <div
        className={`fixed inset-0 z-20 bg-[#343A40] text-white transform md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4">
          <div className="mt-3 mb-6">
            <Image src="/logo.png" alt="Logo" width={160} height={64} className="h-[4rem] w-auto" />
          </div>
          <ul className="space-y-2 mt-4" style={{ borderTop: '1px solid #4f5962' }}>
            {renderMenuItems(() => setIsMobileMenuOpen(false))}
          </ul>
        </div>
      </div>

      {/* Desktop Sidebar - CSS-only visibility, always in DOM */}
      <aside className="w-[17rem] min-w-[17rem] bg-[#343A40] text-white p-4 min-h-screen hidden md:block">
        <div className="mt-3 mb-4">
          <Image src="/logo.png" alt="Logo" width={200} height={80} className="w-auto" />
        </div>
        <ul className="space-y-1 mt-4" style={{ borderTop: '1px solid #4f5962' }}>
          {renderMenuItems()}
        </ul>
      </aside>

      {/* Logout Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirm Logout"
        className="bg-white p-6 m-10 rounded-lg shadow-md max-w-sm lg:mx-auto mt-[14rem] outline-none"
        style={{ overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 50 } }}
      >
        <h2 className="text-xl font-bold mb-4">
          Are you sure you want to log out?
        </h2>
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded-md"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={handleLogout}
          >
            Yes, Logout
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
