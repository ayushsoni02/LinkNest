// import { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import clsx from "clsx";

const ProfileDropdown = ({ username, onLogout }) => {
  const initials = username
    ? username
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 transition">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center rounded-full text-sm font-bold">
          {initials}
        </div>
        <span className="text-gray-700 font-medium">{username.split(" ")[0]}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button className={clsx("w-full px-4 py-2 text-sm text-left", active && "bg-gray-100")}>
                <User className="inline-block w-4 h-4 mr-2" /> Profile
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={clsx("w-full px-4 py-2 text-sm text-left", active && "bg-gray-100")}>
                <Settings className="inline-block w-4 h-4 mr-2" /> Settings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onLogout}
                className={clsx("w-full px-4 py-2 text-sm text-left text-red-500", active && "bg-gray-100")}
              >
                <LogOut className="inline-block w-4 h-4 mr-2" /> Logout
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default ProfileDropdown;