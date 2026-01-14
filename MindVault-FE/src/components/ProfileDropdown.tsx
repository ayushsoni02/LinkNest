import { Menu } from "@headlessui/react";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProfileDropdown = ({ username, onLogout, isCollapsed }: { username: string; onLogout: () => void; isCollapsed?: boolean }) => {
  const initials = username
    ? username
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <Menu.Button className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-slate-800/50 transition w-full">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0">
          {initials}
        </div>
        {!isCollapsed && (
          <>
            <span className="text-slate-200 font-medium text-sm flex-1 text-left truncate">
              {username.split(" ")[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </>
        )}
      </Menu.Button>

      <Menu.Items className="absolute left-0 bottom-full mb-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button className={clsx("w-full px-4 py-2 text-sm text-left text-slate-200", active && "bg-slate-800")}>
                <User className="inline-block w-4 h-4 mr-2" /> Profile
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button className={clsx("w-full px-4 py-2 text-sm text-left text-slate-200", active && "bg-slate-800")}>
                <Settings className="inline-block w-4 h-4 mr-2" /> Settings
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => {
                  toast.info("Logged out successfully!", {
                    position: "top-right",
                    autoClose: 2000,
                  });
                  onLogout();
                }}
                className={clsx("w-full px-4 py-2 text-sm text-left text-red-400", active && "bg-slate-800")}
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